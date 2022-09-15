const Agent = require("./agent.js")
const QLearning = require("./qlearning.js")
const fs = require('fs')

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
  let id = Math.floor(Math.random()*(9999-999+1)+999)
  let speed = otherSpeeds[Math.floor(Math.random() * otherSpeeds.length)]
  let position = {"lane": 0, "column":this.width}
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
  if(this.otherCars.length == 0 && steps >= 3 && Math.random() < this.density ) {
    this.carB()
    steps = 0
    generated++
  }
}
steps = 0
generated = 0
function main() {
  w = new World()
  agent = new Agent(w)
  console.log(agent.actions)
  learner = new QLearning(agent)
  let data = "speed,lane,proximity,action,next_speed,crashes,wrong_lane,over_limit\n"
  for(let i=0; i<1; i++) {
    data += learner.run()
    fs.writeFile(`./run${i+1}.csv`, data, function (err,data) {
      if (err) 
        return console.log(err)
      console.log(data)})
  }
  fs.writeFile('./qtable.txt', JSON.stringify(learner.qtable, function(k,v) {
      if(v instanceof Array)
        return JSON.stringify(v);
      return v;
    }, 2).replace(/\\/g, '')
          .replace(/\"\[/g, '[')
          .replace(/\]\"/g,']')
          .replace(/\"\{/g, '{')
          .replace(/\}\"/g,'}')
  , function (err,data) {
      if (err) {
        return console.log(err);
      }
      console.log("saved file")})
  //Exploitation
  learner.epsilon /= 100
  let expData = "Speed,Lane,Proximity,action,Speed,next_lane,next_proximity,crashes,wrong_lane,over_speed\n"
  agent.speed = 50
  agent.position.lane = 0
  w.otherCars = []
  learner.currentState = agent._getState()
  generated = 0
  expData += learner.run()  
  console.log(generated)
  table = learner.qtable
  fs.writeFile(`./exploitation.csv`, expData, function (err,data) {
      if (err) {
        return console.log(err);
      }
      console.log(data)})
}
main()