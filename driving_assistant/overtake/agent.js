function Agent(world) {
    //environmet in which the agent lives
    this.world = world
    //agent specific state
    this.speed = 50
    //lane: 0 = right, 1 = left
    this.position = {"lane": 0, "column":10}
    this.collisionTime = 0
    //this.passenger = NaN
    this.actions = getMethods(Agent.prototype)
} 


Agent.prototype.straight = function() {
    //skip - do nothing
}

Agent.prototype.slowDown = function() {
    if(this.speed > 0)
        this.speed -= 10
}

Agent.prototype.speedUp = function() {
    if(this.speed < 80)
        this.speed += 10
}

Agent.prototype.steerLeft = function() {
    this.position.lane = 1
}

Agent.prototype.steerRight = function() {
    this.position.lane = 0
}

Agent.prototype._timeToCollision = function() {
    let cars = this.world.otherCars.filter(car => car.position.lane == this.position.lane)
    let distances = cars.map(car => {
        let dx = Math.round((car.position.column - this.position.column)) * 0.005
        let dv = this.speed - car.speed
        let dt = 100
        if(dv != 0) 
            dt = (Math.round((dx/dv * 200)*2)/2)
        return dt
    })
    let ordered = distances.sort()
    let dt = ordered.length == 0 ? 100 :  ordered[0]
    if(dt >0 && dt < 20)
        return 1
	else if(dt >=20 && dt < 30)
        return 2 //it can still slow down
    else if(dt>=30 && dt < 50)
        return 3
    else 
        return 4		
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
    return [this.speed, this.position.lane, this._timeToCollision()]
}

function getMethods(obj) {
    return Object.getOwnPropertyNames(obj).
        filter(item => typeof obj[item] === 'function' && !item.startsWith('_') && item != 'constructor')
}

module.exports = Agent