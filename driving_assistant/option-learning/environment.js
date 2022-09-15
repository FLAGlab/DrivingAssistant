const Trait = require('./traits.js').Trait
const cop = require('./context-traits.js')

const Agent = require("./agent.js")
const fs = require('fs')
const path = require('path');

/* 
 * environment definition
 */
function World() {
    this.width = 500
    this.height = 4
    this.timeForFullDistance = 0.01
    this.speedIntervals = 5
    this.density = 0.1
    this.exploration = 0.2
    this.otherCars = []
}

World.prototype.carB = function() {
    let otherSpeeds = [30]
    let id = Math.floor(Math.random()*(9999-999+1)+999);
    let speed = otherSpeeds[Math.floor(Math.random() * otherSpeeds.length)];
    let position = {"lane": 0, "column":this.width};
    //console.log(`car added to lane ${position.lane} with speed ${speed}`)
    this.otherCars.push({"id": id, "speed": speed, "position": position, "spawnTime": this.currentTime()})
}

World.prototype.moveCarsLeft = function(agent) {
  if(agent.speed != 0)
    this.otherCars.forEach(car => {
      let relativeSpeed = (agent.speed - car.speed)
      var dt = this.currentTime() -  car.spawnTime;
      //var d = -(relativeSpeed * (dt/(0.005*1000))/100) + car.position.column;
      var d = Math.min(-(relativeSpeed * 10) + car.position.column, 1000)
      car.spawnTime = this.currentTime()
      car.position.column = d
    })
  //check if out of bounds
  //this.otherCars = this.otherCars.filter(c => c.position.column > 0)
}

World.prototype.currentTime = function() {
  var d = new Date();
  return  d.getTime();
}

World.prototype.addCars = function() {
    if(this.otherCars.length == 0 && steps >= 3 && Math.random() < this.density) {
      this.carB()
      steps = 0
      generated++
    }
}

//--------------- RUNNING --------------
masterCounter = 0
optionCounter = 0
steps = 0
generated = 0
cumReward = 0
stateOptionsMap = {}
stateFrequenciesMap = {}
w = new World()
agent = new Agent(w)
currentState = agent._getState()
agent._loadContexts("options")
let qtable = []

function main() {
  var alpha = 0.1
  var gamma = 0.1
  var epsilon = 0.1
  
  console.log(agent.actions)
  qtable = initQTable(agent.actions)
  let data = "speed, action, next_speed, crashes, wrong_lane, over_limit\n"
  let action = -1
  let crashes = 0, wrongLanes = 0, overSpeed = 0
  let i = 0
  let result = []
  let next_state = []
  while(i < 8000) {
    let actions = agent.actions
    if(Math.random() < epsilon)
      action = randomAction(qtable[currentState])
    else 
      action = qtable[currentState].map((x, i) => [x, i]).reduce((r, a) => (a[0] > r[0] ? a : r))[1]
    //result = [next_sate, reward, donde, info]
    let reward_done = []
    if(action >= actions.length) {
      let state = currentState.toString().replace(/,/g,'')
      let adaptation = state + (action - actions.length)
      cumReward = 0
      eval(`Context${adaptation}.activate()`)
      agent.option()
      
      next_state = [agent.speed, agent.position.lane, agent.collisionTime]
      reward_done = getRewards(next_state, action)
      if(reward_done[0] > 0) {
        let frequency = stateFrequenciesMap[`${currentState},${action-agent.actions.length}`]
        reward_done[0] *= frequency
      }
    } else {
      eval(`agent.${actions[action]}()`)
      //next_state = agent._getState()
      next_state = [agent.speed, agent.position.lane, agent.collisionTime]
      reward_done = getRewards(next_state, action)
    }
    next_state = [agent.speed, agent.position.lane, agent.collisionTime]
    info = `Executed action: ${actions[action]} at state ${currentState}`
    result = [next_state, reward_done[0], reward_done[1], info]
    oldValue = qtable[currentState][action]
    nextMax = Math.max.apply(Math, qtable[result[0]])
    newValue = (1- alpha)*oldValue + alpha*(result[1] + gamma*nextMax)
    qtable[currentState][action] = newValue
    data += `${currentState},${actions[action]},${result[0]},${crashes},${wrongLanes},${overSpeed}\n`
    //print to file
    if(result[0][0] == 0) 
      crashes++
    else if(result[0][0] > 60)
      overSpeed++
    if(result[0][1] == 1)
      wrongLanes++
    currentState = result[0]
    //done = result[2]
    agent.world.addCars()
    i++
    //steps++
  }
  console.log(generated)
  fs.writeFile(`./run${i+1}.csv`, data, function (err,data) {
    if (err) 
      return console.log(err)
    console.log(data)})

  fs.writeFile('./qtable.txt', JSON.stringify(qtable, function(k,v) {
      if(v instanceof Array)
        return JSON.stringify(v);
      return v;
    }, 2).replace(/\\/g, '')
          .replace(/\"\[/g, '[')
          .replace(/\]\"/g,']')
          .replace(/\"\{/g, '{')
          .replace(/\}\"/g,'}')
  , function (err,data) {
      if (err) 
        return console.log(err);
    })
  let newQTable = qtable
  let maxIndices = Object.keys(qtable).map(k => {
    let max = Number.NEGATIVE_INFINITY
    let maxIndex = -1
    for(var i=agent.actions.length; i< qtable[k].length; i++ ) {
      if(max <= qtable[k][i]) {
        max = qtable[k][i]
        maxIndex = i
      }
    }
    let obj = {}
    obj[k] =  maxIndex
    let arr = newQTable[k].slice(0, agent.actions.length)
    if(max == Number.NEGATIVE_INFINITY)
      newQTable[k] = arr
    else
      newQTable[k] = arr.concat([max])
    return obj
  })
  fs.writeFile('./newqtable.txt', JSON.stringify(newQTable, function(k,v) {
    if(v instanceof Array)
      return JSON.stringify(v);
    return v;
  }, 2).replace(/\\/g, '')
        .replace(/\"\[/g, '[')
        .replace(/\]\"/g,']')
        .replace(/\"\{/g, '{')
        .replace(/\}\"/g,'}')
, function (err,data) {
    if (err) 
      return console.log(err);
  })
  maxIndices = maxIndices.filter(elem => Object.values(elem)[0]>0)
  agent._recordAdaptations(maxIndices)  
}

function randomAction(actions) {
  return randInt(0, actions.length - 1)
}

function option_reward(state, action) {
  if(action == 5) 
    return [50, false]
  else 
    return [1, false]
}

function getRewards(state, action) {
  if(state[0] == 0)
    return [-8, false] //crash
  else if(state[0] > 60)
    return [-6, false]  //fast
  else if(state[0] < 50)
    return [-6, false]  //slow
  else if(state[1] == 1)
    return [-5, false] //wrong lane
  else if(state[2] == 4)
    if(action > agent.actions.length) {
      return [8, false] //no car infront
    } else
      return [5, false]
  else
    return [0, false]
}

/*change function */
function initQTable(actions) {
  table = {}
  var i =0
  let speeds = [0,10,20,30,40,50,60,70,80]
  //var leni = 5//this.agent.world.maxX
  while(i < speeds.length) {
     // table[speeds[i]] = new Array(actions.length).fill(0)
      var j = 0 
      var lenj = 2//this.agent.world.maxY
      while(j < lenj) {
          var k = 1
          while(k <= 4) {
            let map = stateOptionsMap[[speeds[i],j,k]]
            let size2 = actions.length + (typeof(stateOptionsMap[[speeds[i],j,k]]) != "undefined" ? stateOptionsMap[[speeds[i],j,k]] : 0)
            table[[speeds[i],j,k]] = new Array(size2).fill(0)
            k++
          }
          j ++
      }
      i++
  }
  return table
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min) ) + min;
}

main()