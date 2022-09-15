/*
 * Implementation of the Q-learning algorithm
 */

function QLearning(agent, alpha=0.1, gamma=0.6, epsilon=0.1) {
   this.alpha = alpha
   this.gamma = gamma
   this.epsilon = epsilon
   this.agent = agent
   this.actions = agent.actions
   //The current state is a tuple gathered from the agent
   this.currentState = agent._getState()
   this.qtable = initQTable(this.actions)
}

QLearning.prototype.randomAction = function() {
    return randInt(0, this.actions.length - 1)
}

QLearning.prototype.run = function() {
    let done = false
    let action = -1
    let data = ""
    let crashes = 0, wrongLanes = 0, overSpeed = 0
    let i = 0
    let result = []
    while(i < 8000) {
    //while(!done) {
        if(Math.random() < this.epsilon)
            action = this.randomAction()
        else { 
            //console.log(this.currentState)
            action = this.qtable[this.currentState].map((x, i) => [x, i]).reduce((r, a) => (a[0] > r[0] ? a : r))[1]
        }//console.log(action)
        //result = [next_sate, reward, donde, info]
        result = this.step(action)
        oldValue = this.qtable[this.currentState][action]
        nextMax = Math.max.apply(Math, this.qtable[result[0]])
        newValue = (1- this.alpha)*oldValue + this.alpha*(result[1] + this.gamma*nextMax)
        this.qtable[this.currentState][action] = newValue
        
        //console.log(result[3])
        //print to file
        if(result[1] == -100) 
            crashes++
        else if(result[1] == -50)
            wrongLanes++
        data += `${this.currentState},${this.actions[action]},${result[0]},${crashes},${wrongLanes}\n`
        this.currentState = result[0]
        //done = result[2]
        this.agent.world.addCars()
        i++
    }
    return data
}

QLearning.prototype.step = function(action) {
    //reward_done = [reward, done]
    eval(`this.agent.${this.actions[action]}()`)
    let next_state = this.agent._getState()
    let reward_done = this.getRewards(next_state, this.actions[action])
    info = `Executed action: ${this.actions[action]} at state ${this.currentState}`
    return [next_state, reward_done[0], reward_done[1], info]
}

/*change function */
QLearning.prototype.getRewards = function(state, action) {
    if(state[0] == 0)
        return [-100, false] //crash
    else if(state[0] > 70)
        return [-30, false]
    else if(state[0] < 50)
        return [-700, false]
    else if(state[1] == 1)
        return [-50, false] //wrong lane
    else if(state[2] == 4)
        return [50, false] //no car infront
    else
        return [0, false]
}

/*change function */
function initQTable(actions) {
    table = {}
    var i =0
    let speeds = [0,10,20,30,40,50,60,70]
    //var leni = 5//this.agent.world.maxX
    while(i < speeds.length) {
       // table[speeds[i]] = new Array(actions.length).fill(0)
        var j = 0 
        var lenj = 2//this.agent.world.maxY
        while(j < lenj) {
            var k = 1
            while(k <= 4) {
                table[[speeds[i],0,k]] = new Array(actions.length).fill(0)
                table[[speeds[i],1,k]] = new Array(actions.length).fill(0)
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

module.exports = QLearning