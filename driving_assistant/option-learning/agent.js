const Trait = require('./traits.js').Trait
const cop = require('./context-traits.js')

const fs = require('fs')
const path = require('path');


function Agent(world) {
    //environmet in which the agent lives
    this.world = world
    //agent specific state
    this.speed = 50
    //lane: 0 = right, 1 = left
    this.position = {"lane": 0, "column":10}
    this.collisionTime = 4
    //this.passenger = NaN
    this.actions = getMethods(Agent.prototype)
} 
/*
Agent.prototype.stop = function() {
    this.speed = 0
}
*/
Agent.prototype.straight = function() {
    //do nothing
    this._getState()
}

Agent.prototype.slowDown = function() {
    if(this.speed > 0)
        this.speed -= 10
    cumReward += getRewards(this._getState(),1)
}

Agent.prototype.speedUp = function() {
    if(this.speed < 80)
        this.speed += 10
    cumReward += getRewards(this._getState(),2)
}

Agent.prototype.steerLeft = function() {
    //if(!this.position.lane)
        this.position.lane = 1
    /*else
        this.speed = 0
        */
    cumReward += getRewards(this._getState(),3)
}

Agent.prototype.steerRight = function() {
    //if(this.position.lane)
        this.position.lane = 0
   /* else    
        this.speed = 0
        */
    cumReward += getRewards(this._getState(),4)
}

Agent.prototype._timeToCollision = function() {
    let cars = this.world.otherCars.filter(car => car.position.lane == this.position.lane)
    let distances = cars.map(car => {
        let dx = Math.round((car.position.column - this.position.column) ) * 0.005
        let dv = this.speed - car.speed
        let dt = 100
        if(dv != 0) 
            dt = (Math.round((dx/dv * 200)*2)/2 );
        return dt
    })
    let ordered = distances.sort()
    let dt = ordered.length == 0 ? 100 :  ordered[0]
    if(dt >0 && dt < 20) {
        this.collisionTime = 1
        return 1
    } else if(dt >=20 && dt < 30) {
        this.collisionTime = 2
        return 2 //it can still slow down
    } else if(dt>=30 && dt < 50) {
        this.collisionTime = 3
        return 3
    } else {
        this.collisionTime = 4
        return 4		
    }
}

Agent.prototype._checkCrashed = function() {
    if(this.speed != 0)
        this.world.otherCars.forEach(c => {
            if(c.position.lane == this.position.lane) {
                var dx = c.position.column - this.position.column
                if(dx < 100) {
                    this.speed = 0
                    c.position.column = -1
                }
            }
        })
}

Agent.prototype._getState = function() {
    //state: {speed, lane, proximity}
    this.world.moveCarsLeft(this)
    this._checkCrashed()
    this.world.otherCars = this.world.otherCars.filter(c => c.position.column > 0)
    if(this.world.otherCars.length == 0) {
        steps++
    }
    return [this.speed, this.position.lane, this._timeToCollision()]
}

Agent.prototype._loadContexts = function(name) {
    var fn = path.join(__dirname, `./${name}.txt`);
    var contents = fs.readFileSync(fn).toString();
    var lines = contents.split("\n");
    let adaptation = ""
    stateOptionsMap = JSON.parse(lines[0])
    stateFrequenciesMap = JSON.parse(lines[1])
    lines.forEach(line => {
        if(line.includes("adapt")) {
            eval(line)
        } else if(line.startsWith("Context")) {
            eval(line)
        } else if(line.startsWith("BA")) {
            adaptation = line
        }else if(line.startsWith("})")) {
            adaptation += line
            eval(adaptation)
            adaptation = ""
        } else {
            adaptation += line
        }
    })
}

Agent.prototype._recordAdaptations = function(indices) {
    var fn = path.join(__dirname, './options.txt');
    var contents = fs.readFileSync(fn).toString();
    var lines = contents.split("\n");
    let adaptation = ""
    let primitiveSize = this.actions.length
    let closing = false
    var stream = fs.createWriteStream("./adaptations.txt")
    let optionsCount = {}
    indices.forEach(elem => optionsCount[Object.keys(elem)[0]] = 1)
    stream.once('open', function(fd) {
        stream.write(`${JSON.stringify(optionsCount)}\n`)
        Object.values(indices).forEach(s => {
            let key = Object.keys(s)[0]
            let state = `${key.replace(/,/g,'')}${s[key] - primitiveSize}`
            let contextName = `Context${state}`
            for(var i=1; i<lines.length; i++) {
                let line = lines[i]
                if(line.startsWith(contextName))  {
                    line = line.replace(new RegExp(contextName, 'g'), contextName.slice(0,-1))
                    stream.write(line + '\n')
                } else if(line.startsWith(`BA${contextName}`)) {
                    adaptation = line.replace(contextName, contextName.slice(0,-1))
                    closing = true
                } else if(closing && line.startsWith("})")) {
                    adaptation += line
                    stream.write(adaptation + '\n')
                    closing = false
                } else if(closing) {
                    adaptation += line
                }
            }
        })
        stream.end()
    })
}

function getMethods(obj) {
    return Object.getOwnPropertyNames(obj).
        filter(item => typeof obj[item] === 'function' && !item.startsWith('_') && item != 'constructor')
}

function getRewards(state, action) {
    if(state[0] == 0)
      return -8 //crash
    else if(state[0] > 60)
      return -6  //fast
    else if(state[0] < 50)
      return -6  //slow
    else if(state[1] == 1)
      return -5 //wrong lane
    else if(state[2] == 4)
      return 10
    else
      return 0
  }

module.exports = Agent