var Trait = require('./traits.js').Trait;
var cop = require("./context-traits.js");
//file managing libraries
var fs = require('fs');
var path = require('path');

var contexts = [];

function State(name){
    this.name = name;
    this.actions = {};
    this.actionsList = [];
}

State.prototype.addAction = function (nextState, reward, actionName,qValue){
    var action =  {
        name: actionName===undefined ? nextState : actionName,
        nextState: nextState,
        reward: reward,
        qvalue: qValue
    };
    this.actionsList.push(action);
    this.actions[action.name] = action;
};

State.prototype.randomAction = function(){
     return this.actionsList[~~(this.actionsList.length * Math.random())];
};

function QLearner(gamma,alpha, actions){
    this.alpha = alpha || 0.8;
    this.gamma = gamma || 0.8;
    this.rewards = {};
    this.qvalues = {};
    this.states = {};
    this.statesList = [];
    this.currentState = null;
    this.actions = actions;
}

QLearner.prototype.add = function (from, to, reward, actionName){
    if (!this.states[from]) this.addState(from);
    if (!this.states[to]) this.addState(to);

    this.rewards[from] || (this.rewards[from] = {});
    this.rewards[from][actionName] = reward;

    var blank = {};
    for(i = 0; i< this.actions.length; i++){
        blank[this.actions[i]] = 0;
    }

    this.qvalues[from] ||  (this.qvalues[from] = blank);
    this.qvalues[to] ||  (this.qvalues[to] = blank);
    var qval = this.qvalues[from][actionName] || 0;

    var qv = ( qval + this.alpha * (  reward + this.gamma * (this.optimalFutureValue(to)) - qval));
    //console.log( from  + " || " + to  + " |+| " + qval + " || " + reward + " || "  + this.optimalFutureValue(to) + " || " + qv );
    this.qvalues[from][actionName] = qv;
    this.states[from].addAction(to, reward, actionName,qv);
};

QLearner.prototype.addState = function (name){
    var state = new State(name);
    this.states[name] = state;
    this.statesList.push(state);
    return state;
};

QLearner.prototype.setState = function (name){
    this.currentState = this.states[name];
    return this.currentState;
};

QLearner.prototype.getState = function (){
    return this.currentState && this.currentState.name;
};

QLearner.prototype.randomState = function(){

    return this.statesList[~~(this.statesList.length * Math.random())];
};

QLearner.prototype.optimalFutureValue = function(state){
   var max;
   var i = 0;
  for(action in this.qvalues[state]) {
        if(i==0) {
            max = this.qvalues[state][action];
        } else {
            max =  Math.max(max, this.qvalues[state][action]);
        }
       i++;
   }
    return max ;
};

QLearner.prototype.step = function (){
   /* this.currentState || (this.currentState = this.randomState());
    var action = this.currentState.randomAction();
    if (!action) return null;
    this.rewards[this.currentState.name] || (this.rewards[this.currentState.name] = {});

    //rewards array - filling it
    this.rewards[this.currentState.name][action.name] = action.reward;

    var rw = (action.reward || 0)

   this.qvalues[this.currentState.name] ||  (this.qvalues[this.currentState.name] = {});
    var qval = (this.qvalues[this.currentState.name][action.name] || 0)

    var newQ =  ( qval + this.alpha * (  rw + this.gamma * (this.optimalFutureValue(action.nextState)) - qval));

   this.qvalues[this.currentState.name][action.name] = newQ;

    return this.currentState = this.states[action.nextState];
    */
};

QLearner.prototype.printDump = function(){
    var dump = JSON.stringify(this.qvalues);
    //console.log(dump);
    document.getElementById('log').value = dump;
};

QLearner.prototype.learn = function(steps){
    steps = Math.max(1, steps || 0);
    while (steps--){
        this.currentState = this.randomState();
        this.step();
    }
};

QLearner.prototype.bestAction = function(state){
    var stateQvalues = this.qvalues[state] || {};

    var bestAction = null;
    for (var action in stateQvalues){
        if (stateQvalues.hasOwnProperty(action)){
            if (!bestAction){
                bestAction = action;
            } else if ((stateQvalues[action] == stateQvalues[bestAction]) && (Math.random()>0.5)){
                bestAction = action;
            } else if (stateQvalues[action] > stateQvalues[bestAction]){
                bestAction = action;
            }
        }
    }
    return bestAction;
};

QLearner.prototype.knowsAction = function(state, action){
    return (this.qvalues[state] || {}).hasOwnProperty(action);
};

QLearner.prototype.applyAction = function(actionName){
    var actionObject = this.states[this.currentState.name].actions[actionName];
    if (actionObject){
        this.currentState = this.states[actionObject.nextState];
    }
    return actionObject && this.currentState;
};

QLearner.prototype.runOnce = function(state){
    var best = this.bestAction(state);
    var action = this.states[state].actions[best];
    if (action){
        this.currentState = this.states[action.nextState];
    }
    return action && this.currentState;
};


otherSpeeds = [20];
var colors = ["AliceBlue","AntiqueWhite","Aqua","Aquamarine","Azure","Beige","Bisque","Black","BlanchedAlmond","Blue","BlueViolet","Brown","BurlyWood","CadetBlue","Chartreuse","Chocolate","Coral","CornflowerBlue","Cornsilk","Crimson","Cyan","DarkBlue","DarkCyan","DarkGoldenRod","DarkGray","DarkGrey","DarkGreen","DarkKhaki","DarkMagenta","DarkOliveGreen","Darkorange","DarkOrchid","DarkRed","DarkSalmon","DarkSeaGreen","DarkSlateBlue","DarkSlateGray","DarkSlateGrey","DarkTurquoise","DarkViolet","DeepPink","DeepSkyBlue","DimGray","DimGrey","DodgerBlue","FireBrick","FloralWhite","ForestGreen","Fuchsia","Gainsboro","GhostWhite","Gold","GoldenRod","Gray","Grey","Green","GreenYellow","HoneyDew","HotPink","IndianRed","Indigo","Ivory","Khaki","Lavender","LavenderBlush","LawnGreen","LemonChiffon","LightBlue","LightCoral","LightCyan","LightGoldenRodYellow","LightGray","LightGrey","LightGreen","LightPink","LightSalmon","LightSeaGreen","LightSkyBlue","LightSlateGray","LightSlateGrey","LightSteelBlue","LightYellow","Lime","LimeGreen","Linen","Magenta","Maroon","MediumAquaMarine","MediumBlue","MediumOrchid","MediumPurple","MediumSeaGreen","MediumSlateBlue","MediumSpringGreen","MediumTurquoise","MediumVioletRed","MidnightBlue","MintCream","MistyRose","Moccasin","NavajoWhite","Navy","OldLace","Olive","OliveDrab","Orange","OrangeRed","Orchid","PaleGoldenRod","PaleGreen","PaleTurquoise","PaleVioletRed","PapayaWhip","PeachPuff","Peru","Pink","Plum","PowderBlue","Purple","Red","RosyBrown","RoyalBlue","SaddleBrown","Salmon","SandyBrown","SeaGreen","SeaShell","Sienna","Silver","SkyBlue","SlateBlue","SlateGray","SlateGrey","Snow","SpringGreen","SteelBlue","Tan","Teal","Thistle","Tomato","Turquoise","Violet","Wheat","White","WhiteSmoke","Yellow","YellowGreen"];

function carB(){
			this.id = Math.floor(Math.random()*(9999-999+1)+999);
			this.speed = otherSpeeds[Math.floor(Math.random() *otherSpeeds.length)];
			this.position = 100;
			this.spawnTime = currentTime();
			this.color = colors[Math.floor(Math.random() *colors.length)]
		}

function road(){
			/*
			states:
				0. speed=0
				1. speed 0-20
				2. speed 20-40
				3. speed 40-60
				4. speed >60

				actions:
				1. go straight
				2. stop
				3. overtake
				4. slow down
				5. speed up

				rewards should be as follows:
				1. speed 40-60 shoould get 100 points (ivana: was it not just 60? check)
				2. 0-20 and 20-40 should get 0 points
				3. speed 0 should get -100
				4. Crash is the quivalent of crashing (ivana: guess that's stopping, speed of 0)
				5. speed over 60 should get 0 points

				ivana
				6. being in right lane, if not overtaking, ie collision=0 at prev step should get -50
			*/


			//this.canvasId  = "canvas";
			this.mapDiv = "map";
			this.scoreId = "score";

			this.timeForFullDistance = 0.005; //in seconds
			this.speedIntervals = 5; //speeds which +/- when speeding up / slowing down


			this.canvasWidth = 100;
			this.canvasHeight = 200;

			this.width=100;
			this.height = 4;

			this.board = [];
			this.empty = 0;
			this.agent = 1;
			this.carB = 2;
			this.bank = 3;

			this.otherCars = [];
			//this.otherSpeeds = [10,20,30,45];

			this.agentCar ={
				speed: 20,
				averageSpeed: 20, //ivana stats
				stepsOnSpeedLimit:0, //ivana stats
				speedSum:20,//ivana stats

				overtaking : false,
				overtakingSteps:0,
				collisionTime: 0,
				div : "agent", //document.getElementById("agent"),
				position: {
					line: 1,
		        	column: 3
				}
			};

			this.actions = [1,2,3,4,5];

			this.density = 0.17;

			this.score = {};
			this.score[this.empty] = 0;
			this.score[this.carB] = 0;
			this.score[this.bank] = 0;
			this.score[4] = 0;

			this.userAction = undefined;
			this.exploration = 0.05;
			this.canvasContext = undefined;

			this.colorDictionary = {};
			this.colorDictionary[this.agent] = 'blue';
			this.colorDictionary[this.carB] = 'red';
			this.colorDictionary[this.bank] = 'grey';
			this.colorDictionary[this.empty] = 'white';

			this.rewardDictionary = {};
			this.rewardDictionary[this.carB] = -3;
			this.rewardDictionary[this.empty] = 1;
			this.rewardDictionary[this.bank] = -3;

			this.actionDictionary = {};
			this.actionDictionary[1] = "straight";
			this.actionDictionary[2] = "stop";
			this.actionDictionary[3] = "overtake";
			this.actionDictionary[4] = "slow down";
			this.actionDictionary[5] = "speed up";
      this.actionDictionary[99] = "adaptation";

			this.laneDictionary = {};
			this.laneDictionary[1] = "left";
			this.laneDictionary[2] = "right";
}

road.prototype.currentState = function() {
			var state = "";
		  if(this.agentCar.speed == 0){
				state+="speed=0";
			}
			else if(this.agentCar.speed > 0 && this.agentCar.speed < 20)
				state+= "speed=0-20";
			else if(this.agentCar.speed>=20 && this.agentCar.speed < 40)
				state+="speed=20-40";
			else if(this.agentCar.speed >=40 && this.agentCar.speed <60)
				state+="speed=40-60";
      else if(this.agentCar.speed >60 && this.agentCar.speed <80)
  				state+="speed=60-80";
			else if(this.agentCar.speed == 60)
				state+="speed=60";
			else state+="speed=60+";

			traffic = false;
			var dt, dx,dv;

			for(var i = 0; i<this.otherCars.length; i++){
				var car = this.otherCars[i];
				 dx = Math.round((car.position - this.agentCar.position.column) ) * this.timeForFullDistance ;
				 dv = (this.agentCar.speed - car.speed) ;

				if(dv !== 0) dt = (Math.round((dx/dv * 200)*2)/2 );
				else dt = -100;
				traffic = true;

				if(dt > 20)
					dt = "20+";			//eliminate states over 20
				else if(dt > 8)
					dt = Math.round(dt); //reduce the amount of states above 8

			}

				if(!traffic || dt <= 0 || dt>=3)
					{
						state+= "TimeToCollision=0";
						this.agentCar.collisionTime = 0;
					}
				else if (dt >0 && dt < 2){
					state+="TimeToCollision=1";
					this.agentCar.collisionTime = 1;
					}		//it can still overtake
				else if(dt >=2 && dt < 3){
					state+="TimeToCollision=2";
					this.agentCar.collisionTime = 2; //it can still slow down
				}
				else{
					state+= "TimeToCollision=0";
					this.agentCar.collisionTime = 0;
				}

			//console.log(dx + " || " + dv + " || " + dt + " || " + state );
			return state;

		};

road.prototype.randomAction = function() {
		return this.actions[~~(Math.random()*this.actions.length)];
};

road.prototype.applyAction = function(action){
			if(action == 1) {
				//do nothing - go straight
			}
			else if(action == 2) {
				//stop
				this.agentCar.speed = 0;

			}
			else if(action == 3){
				//overtake...somehow
				this.agentCar.overtaking = true;
				this.agentCar.overtakingSteps = 1;
				this.setPosition(2);
			}
			else if(action == 4){
				//slow down
				this.agentCar.speed += -this.speedIntervals;
				if(this.agentCar.speed <0)
					this.agentCar.speed = 0;
			}
			else if(action == 5){
				//speed up
				this.agentCar.speed += this.speedIntervals;
			}

			if(action != 3){
				this.setPosition(1); //if it's not overtaking move it into the left lane
				game.agentCar.overtaking = false;
			}
};

road.prototype.addMoreCars = function(){
				//only add them to the left lane
				//only add a new car if there isn't already a car on the lane
        //console.log("-----------adding cars called");
        //console.log(this.density);
        //console.log(this.otherCars.length);
				if(Math.random() < this.density && this.otherCars.length <1 ){
          //console.log(this.score[4]);
          this.score[4] += 1;//this.score[4]++;
					var newCar = new carB();
          //console.log("newCar created " + this.score[4]);
					//document.getElementById(this.mapDiv).innerHTML += "<div class='carB' id='"+ newCar.id + "'></div>";
					//document.getElementById(newCar.id).style.backgroundColor = newCar.color;
					this.otherCars.push(newCar);
				}
			this.setPosition(this.agentCar.position.line);
		};

road.prototype.setPosition = function (line){
			//set agents position
			line2 = (line + this.height) % this.height; // circular world

			this.agentCar.position.line = line2;

			//document.getElementById("agent").style.top = (line2*(this.canvasHeight/this.height) + 5) + "px";
		};

road.prototype.checkIfCrashed = function(){
			if (this.agentCar.position.line == 1){
					//only if it is in the left lane will we check if it has crashed.
					//otherwise just do nothing
					for(var i = 0; i<this.otherCars.length; i++){
						var car = this.otherCars[i];
						var dx = Math.abs(car.position - this.agentCar.position.column);
						if( dx < 8 &&  car.position > 0) {
							this.score[this.carB]++;
							//set the speed of the car to 0
							this.agentCar.speed = 0;
							//remove it from the dom
							//document.getElementById(this.mapDiv).removeChild(document.getElementById(car.id));
							//remove it from the array
							this.otherCars.splice(i,1);
							return true;
						}
					}
					return false;
				}
				return false;
		};

road.prototype.moveObjectsLeft = function(){
      for(var i = 0; i<this.otherCars.length; i++){
					var car = this.otherCars[i];
          var dt = currentTime() -  car.spawnTime;
          var d = -(((this.agentCar.speed - car.speed) * (dt/(this.timeForFullDistance * 1000) )/ 100)) + car.position;
          //document.getElementById(car.id).style.left = d +  "%";
					car.spawnTime = currentTime();
					car.position = d;

					if(d < -3) { // if it's moved off the map
						//remove it from the array
						this.otherCars.splice(i,1);
					}
			}
		};

road.prototype.calcReward = function(){
      var reward =0;
      if(this.agentCar.speed >60 && this.agentCar.speed < 80)
                      reward =0;
      else if(this.agentCar.speed >= 40 && this.agentCar.speed < 60)
                      reward =0;
      else if(this.agentCar.speed >= 20 && this.agentCar.speed < 40)
                      reward =0;
      else if( this.agentCar.speed > 80)
                      reward =0;
      else if(this.agentCar.speed === 0)
                      reward =-100;
      else if(this.agentCar.speed == 60)
                      reward =200;
      return reward;
};

function currentTime() {
			var d = new Date();
			return  d.getTime();
		}

var adaptationsCount = 0;
var over1000 = false;

S = Trait({
  //
  checkingSpeedLimits: function() {
    game.agentCar.averageSpeed = game.agentCar.speedSum/j;
  	if (game.agentCar.speed == 55 || game.agentCar.speed == 60)
  		game.agentCar.stepsOnSpeedLimit++;
  	if(game.agentCar.overtaking) {
  		if(game.agentCar.overtakingSteps < 0) {
  			game.agentCar.overtaking = false;
  	  }
  		game.agentCar.overtakingSteps--;
  	}
  },
  log: function() {
    log3 += currentTime() - curTime + "," + j + "," + adaptationsCount + "," +  game.score[game.carB] + "," + game.score[4] + "," +  Math.floor((game.score[game.carB]/game.score[4]) * 100) + "," + game.agentCar.stepsOnSpeedLimit + "," +  Math.floor((game.agentCar.stepsOnSpeedLimit/j) * 100) + '\n';
  },
  drive: function(action) {
    //console.log("normal drive");
    this.checkingSpeedLimits();
    game.applyAction(action);
    game.moveObjectsLeft();
    game.checkIfCrashed();
    game.addMoreCars();
    j += 1;
    this.log();
  },
  step: function() {
    //console.log("step debug");
  	var currentSpeed = game.agentCar.speed;
    var currentState = game.currentState();
    //console.log("Current state: " + currentState);

    var context;
    var foundContext = false;
    for(var i=0; i < contexts.length && !foundContext; i++) {
      //console.log("context " + i + "  " + contexts[i].name().name);
      if(contexts[i].name().name == currentState) {
        context = contexts[i];
        foundContext = true;
        //console.log("context found " + foundContext);
      }
    }
    var action = learner.bestAction(currentState);

    if(foundContext) {
      adaptationsCount ++;
      context.activate();
      action = 99;
    }
    actionarray = "";
    action = Number(action);
    //check collision time and lane BEFORE applying action!
    var wrongOvertake=false;
    if ((game.agentCar.collisionTime === 0)&&(game.agentCar.lane="left"))
    	wrongOvertake=true;

    this.drive(action);
    //console.log(actionarray);
    var nextState = game.currentState();
    var reward = game.calcReward();
    if ((action==3) && wrongOvertake)
      reward=reward-50;
    learner.add(currentState, nextState, reward, action);
    learner.runOnce(currentState);

    if(context) {
      context.deactivate();
    }
    //feedback
    var summary = "\n Lane:: " + (game.agentCar.position.line+1);
    summary += "\n Speed: " + game.agentCar.speed;
    summary += "\n Steps: " + j;
    summary += "\n Adaptations: " + adaptationsCount;
    summary += "\n Steps on speed limit: " + game.agentCar.stepsOnSpeedLimit;
    summary += "\n Average speed: " + game.agentCar.averageSpeed;
    summary += "\n Action: " + action;
    summary += "\n carB: " + game.score[game.carB] + " / " + game.score[4] + " : " + Math.floor((game.score[game.carB]/game.score[4]) * 100) + "% \n";
    //console.log(summary);

    log2 += currentTime() - curTime + "," + currentState + "," +  nextState + "," + game.laneDictionary[game.agentCar.position.line] + "," + currentSpeed + "," + game.agentCar.collisionTime + "," + game.actionDictionary[action] + "," + action + "," + actionarray + "," + learner.qvalues[currentState][action] + '\n';

    //console.log("ifs j " + j);
    if(game.score[4] >= 450) {
      //ouputFiles(j, this.log2, this.log3);
      console.log("---- PRINTING 450 CARS -----");
      console.log("-log2200");
      console.log(log2);
      console.log("-log3200");
      console.log(log3);
      stop = true;
      //this.steps=0;
    }/*
    else if(game.score[4] >= 1000 && !over1000) {
      console.log("---- PRINTING 1000 STEPS -----");
     // ouputFiles(j, this.log2, this.log3);
      console.log("-log2100");
	    console.log(log2);
      console.log("-log3100");
      console.log(log3);
      over1000 = true;
    }*/
  },
});
var stepper = Object.create(Object.prototype, S);

var curTime = currentTime();

function ouputFiles(steps, log2, log3) {
  console.log("writing files");
    fs.writeFileSync("./log2-"+steps+".txt");

    var stream = fs.createWriteStream("./log2-"+steps+".txt");
    stream.once('open', function(fd) {
      stream.write(log2);
      stream.end();
    });
    fs.writeFileSync("./log3-"+steps+".txt");

    var stream3 = fs.createWriteStream("./log3-"+steps+".txt");
    stream3.once('open', function(fd) {
      stream3.write(log3);
      stream3.end();
    });
}

//----------------------------------------------------------------------------------------

function extract() {
  var fn = path.join(__dirname, './actions2000_cheat.txt');
  var contents = fs.readFileSync(fn).toString();
  var lines = contents.split("\n");
  var newContext = false;
  for(var i=0; i<lines.length; i++) {
    var line = lines[i];
    if(line === '')
      break;
    if(line.startsWith("state ")) {
      var contextName = line.substring(line.indexOf("[")+1, line.indexOf("]"));
      //console.log("contextName for the different states " + contextName);
      /*
      contextName = contextName.replace(/"/g, "");
      //contextName = contextName.replace(/'/g, "")
      //console.log("context: " + contextName);
      var components = contextName.split(",");
      var speed = parseInt(components[0], 10);
      if(speed < 20)
        components[0] = "speed=0-20";
      else if(speed >= 20 && speed <40)
        components[0] = "speed=20-40";
      else if(speed >= 40 && speed <= 60)
        components[0] = "speed=40-60";
      else if(speed >= 60 && speed <= 80)
        components[0] = "speed=60-80";
      else if(speed > 80)
        components[0] = "speed=80+";
      contextName = components[0] + "TimeToCollision=" + components[1];
      */
      contexts.push(new cop.Context({'name': contextName}));
      //console.log(contexts[contexts.length-1].name().name);
      newContext = true;
    } else if(newContext) {
      line = line.substring(line.indexOf("[")+1, line.indexOf("]"));
      line = line.replace(/['"]+/g,'');
      var actionsArray = line.split(",");
      var adaptation = createBehavioralAdaptation(actionsArray);
      BA = Trait({
        'drive': adaptation
      });
      contexts[contexts.length-1].adapt(stepper, BA);
      newContext = false;
    }
  }
}

function createBehavioralAdaptation(actions) {
  var funBody = ""; //"console.log(\"---------- Adaptive execution\");\n";
  var actionsString = "";
  var action = 2;
  for(var i=0; i<actions.length; i++) {
    actionsString += actions[i] + "-"
    if(actions[i].startsWith('straight'))
      action = 1;
    else if(actions[i].startsWith('overtake'))
      action = 3;
    else if(actions[i].startsWith('speed'))
      action = 5;
    else if(actions[i].startsWith('slow'))
      action = 4;
    else
      action = 2;
    funBody += "this.checkingSpeedLimits();\n";
    funBody += "game.applyAction(" + action + ");\n";
    funBody += "game.moveObjectsLeft(); \n";
    funBody += "game.checkIfCrashed();\n";
    funBody += "game.addMoreCars();\n";
    funBody += "j += 1;\n";
    funBody += "this.log();\n";
  }
  funBody += "actionarray = actionsString;\n";
  funBody += "if(actions.length == 1) adaptationsCount -= 1;\n";
  return function(action) { eval(funBody) };
}

//console.log("extracted contexts " + contexts);
//------------------------------------------------------------------------------

extract();
var game = new road();
var learner = new QLearner(0.1,0.1, game.actions);
//setInterval(stepper.step, 300);

var j = 0;
var log2 = "Time, Current State,Next State, Lane [L/R], Current Speed, Time To Collision, Action ,Action Key, CorrespondingActions, QValue \n";
var log3 = "Time, Step, AdaptationsCount, Crashed Cars, Total Cars, Percentage, Steps on Speed Limit, Percentage Steps \n";
var actionarray = "";

var stop = false;
var sid = setInterval(function() {
  //console.log(j);
  //if(j > 200) {
  if(game.score[4] >= 450) {
    clearInterval(sid);
    console.log("Finished execution");
    return;
  }
  stepper.step();
}, 300);
