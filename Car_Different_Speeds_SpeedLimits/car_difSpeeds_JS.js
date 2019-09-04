function road(){

			/*
			states:
				0. speed=0
				1. speed 0-1/4 speed limit
				2. speed 1/4-3/4 speed limit
				3. speed 3/4 - max speed limit
				4. Above speed Limit

				actions:
				1. go straight
				2. stop
				3. overtake
				4. slow down
				5. speed up

				rewards should be as follows:
				1. speed 3/4 - max speed shoould get 100 points
				2. 0-3/4 should get 0 points
				3. speed 0 should get -100
				4. Crash is the quivalent of stopping
				5. speed Above speed Limit should get 0 points
			*/


			//this.canvasId  = "canvas";
			this.mapDiv = "map";
			this.scoreId = "score";

			
			
			this.timeForFullDistance = 0.01; //in seconds
			this.speedIntervals = 5; //speeds which +/- when speeding up / slowing down
			this.speedLimit = 60;

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
				overtaking : false,
				overtakingSteps:0,
				collisionTime: 0,
				div : document.getElementById("agent"),
				position: {
					line: 1,
		        	column: 3
				}
			};

			this.actions = [1,2,3,4,5];

			this.density = 0.33;

			this.score = {};
			this.score[this.empty] = 0;
			this.score[this.carB] = 0
			this.score[this.bank] = 0;
			this.score[4] = 0;

			this.userAction = undefined;
			this.exploration = 0.2;
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

			this.laneDictionary = {};
			this.laneDictionary[1] = "left";
			this.laneDictionary[2] = "right";




		}
		otherSpeeds = [20];
		var colors = ["AliceBlue","AntiqueWhite","Aqua","Aquamarine","Azure","Beige","Bisque","Black","BlanchedAlmond","Blue","BlueViolet","Brown","BurlyWood","CadetBlue","Chartreuse","Chocolate","Coral","CornflowerBlue","Cornsilk","Crimson","Cyan","DarkBlue","DarkCyan","DarkGoldenRod","DarkGray","DarkGrey","DarkGreen","DarkKhaki","DarkMagenta","DarkOliveGreen","Darkorange","DarkOrchid","DarkRed","DarkSalmon","DarkSeaGreen","DarkSlateBlue","DarkSlateGray","DarkSlateGrey","DarkTurquoise","DarkViolet","DeepPink","DeepSkyBlue","DimGray","DimGrey","DodgerBlue","FireBrick","FloralWhite","ForestGreen","Fuchsia","Gainsboro","GhostWhite","Gold","GoldenRod","Gray","Grey","Green","GreenYellow","HoneyDew","HotPink","IndianRed","Indigo","Ivory","Khaki","Lavender","LavenderBlush","LawnGreen","LemonChiffon","LightBlue","LightCoral","LightCyan","LightGoldenRodYellow","LightGray","LightGrey","LightGreen","LightPink","LightSalmon","LightSeaGreen","LightSkyBlue","LightSlateGray","LightSlateGrey","LightSteelBlue","LightYellow","Lime","LimeGreen","Linen","Magenta","Maroon","MediumAquaMarine","MediumBlue","MediumOrchid","MediumPurple","MediumSeaGreen","MediumSlateBlue","MediumSpringGreen","MediumTurquoise","MediumVioletRed","MidnightBlue","MintCream","MistyRose","Moccasin","NavajoWhite","Navy","OldLace","Olive","OliveDrab","Orange","OrangeRed","Orchid","PaleGoldenRod","PaleGreen","PaleTurquoise","PaleVioletRed","PapayaWhip","PeachPuff","Peru","Pink","Plum","PowderBlue","Purple","Red","RosyBrown","RoyalBlue","SaddleBrown","Salmon","SandyBrown","SeaGreen","SeaShell","Sienna","Silver","SkyBlue","SlateBlue","SlateGray","SlateGrey","Snow","SpringGreen","SteelBlue","Tan","Teal","Thistle","Tomato","Turquoise","Violet","Wheat","White","WhiteSmoke","Yellow","YellowGreen"];
		function carB(){
			this.id = Math.floor(Math.random()*(9999-999+1)+999);
			this.speed = otherSpeeds[Math.floor(Math.random() *otherSpeeds.length)];
			this.position = 100;
			this.spawnTime = currentTime();
			this.color = colors[Math.floor(Math.random() *colors.length)]
			
		}

		
		road.prototype.currentState = function() {
			var state = "";
			
			if(this.agentCar.speed == 0){
				state+="speed=0";
			}
			else if(this.agentCar.speed > 0 && this.agentCar.speed < (this.speedLimit * 0.25))
				state+= "speed=0-(1/4)Limit";
			else if(this.agentCar.speed>= (this.speedLimit * 0.25) && this.agentCar.speed < (this.speedLimit * 0.75))
				state+="speed=(1/4)-(3/4)Limit";
			else if(this.agentCar.speed >= (this.speedLimit * 0.75) && this.agentCar.speed <= (this.speedLimit))
				state+="speed=(3/4)-(1)Limit";
			else state+="speed=AboveLimit";

			traffic = false;
			var dt, dx,dv;

			for(var i = 0; i<this.otherCars.length; i++){

				var car = this.otherCars[i];
				 dx = Math.round((car.position - this.agentCar.position.column) ) * this.timeForFullDistance ;
				 dv = (this.agentCar.speed - car.speed) ;

				if(dv != 0) dt = (Math.round((dx/dv * 200)*2)/2 );
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

		road.prototype.randomAction = function()
		{
			
			return this.actions[~~(Math.random()*this.actions.length)];
			/* actions:
				1. go straight
				2. stop
				3. overtake
				4. slow down
				5. speed up
			*/

		};
		road.prototype.applyAction = function(action){
			if(action == 1)
			{
				//do nothing - go straigh
			}
			else if(action == 2) {
				//stop 
				this.agentCar.speed = 0;
				
			}
			else if(action == 3){
				//overtake...somehow
				this.agentCar.overtaking = true;
				this.agentCar.overtakingSteps = 0;
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
		}
		road.prototype.addMoreCars = function(){
				//only add them to the left lane
				//only add a new car if there isn't already a car on the lane
				if(Math.random() < this.density && this.otherCars.length <1 ){
					this.score[4]++;
					var newCar = new carB();
					document.getElementById(this.mapDiv).innerHTML += "<div class='carB' id='"+ newCar.id + "'></div>";
					document.getElementById(newCar.id).style.backgroundColor = newCar.color;
					this.otherCars.push(newCar);
				}
				

				
			
			this.setPosition(this.agentCar.position.line);
		};


		road.prototype.setPosition = function (line){
			//set agents position
			
			line2 = (line + this.height) % this.height; // circular world
			

			this.agentCar.position.line = line2

			document.getElementById("agent").style.top = (line2*(this.canvasHeight/this.height) + 5) + "px";
			
		};

		road.prototype.checkIfCrashed = function(){
			if (this.agentCar.position.line == 1){
					//only if it is in the left lane will we check if it has crashed. 
					//otherwise just do nothing
					for(var i = 0; i<this.otherCars.length; i++){
						var car = this.otherCars[i];
						var dx = Math.abs(car.position - this.agentCar.position.column);
						if( dx < 5 &&  car.position > 0)
						{		
							this.score[this.carB]++;
							//set the speed of the car to 0
							this.agentCar.speed = 0;
							//remove it from the dom 
							document.getElementById(this.mapDiv).removeChild(document.getElementById(car.id));
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
					
					document.getElementById(car.id).style.left = d +  "%"; 
					car.spawnTime = currentTime();
					car.position = d;

					if(d < -3) // if it's moved off the map
					{
						//remove it from the HTML
						document.getElementById(this.mapDiv).removeChild(document.getElementById(car.id));
						//remove it from the array
						this.otherCars.splice(i,1);
					}

					
			}  	
		};
		

		function currentTime()
		{
			var d = new Date();
			return  d.getTime();
		}
		road.prototype.calcReward = function(){
			if(this.agentCar.speed >=(this.speedLimit * 0.75) && this.agentCar.speed <= this.speedLimit)
				return 100;
			else if(this.agentCar.speed > 0 && this.agentCar.speed < (this.speedLimit * 0.75))
				return 0;
			else if( this.agentCar.speed > this.speedLimit)
				return 0;
			else if(this.agentCar.speed == 0) 
				return -100;
			else return 0;

			/*
			rewards should be as follows:
				1. speed speed 1/4-3/4 speed limit shoould get 100 points
				2. 0-3/4 should get 0 points
				3. speed 0 should get -100
				4. Crash is the quivalent of stopping
				5. speed over should Limit get 0 points
			*/
		};


		var game = new road();
		var learner = new QLearner(0.1,0.1, game.actions);

		var sid = setInterval(step, 300);
		var log = "Current State, Next State, Reward, Action \n";

		var curTime = currentTime();
		document.getElementById('log2').value+= "Time, Current State,Next State, Lane [L/R], Current Speed, Time To Collision, Action ,Action Key, Reward , QValue, Speed Limit \n";
		var steps = 0;
		function step(){
			steps++;
			if(game.agentCar.overtaking)
			{
				if(game.agentCar.overtakingSteps < 0)
				{
					game.setPosition(1);
					game.agentCar.overtaking = false;
				}
				game.agentCar.overtakingSteps--;
				
			}

			if(steps % 30 == 0){
				//every 30 steps change the speed limit
				game.speedLimit = (~~(Math.random()*6) + 3) * 10;
				//speed limit varies in 10's from 30-80
				//starting at 60
			}
			
			var currentSpeed = game.agentCar.speed;
			var currentState = game.currentState();

			var randomAction = game.randomAction();

			var action = learner.bestAction(currentState);

			if(action == null || action == undefined || (!learner.knowsAction(currentState, randomAction) && Math.random() < game.exploration)){
				action = randomAction;
			}

			action = Number(action);
			

			
			game.applyAction(action);

			game.moveObjectsLeft();

			//check if it has crashed
			game.checkIfCrashed()
				
			var nextState = game.currentState();
			

			var reward = game.calcReward();

			

			
			learner.add(currentState, nextState, reward, action);

			
			//var logData = currentState + "," + nextState + "," + reward + "," + action 
			
			//log+= logData + "\n";

			learner.runOnce(currentState);

			game.addMoreCars();

			//feedback

			
			var summary = "<br /> Lane:: " + (game.agentCar.position.line+1);
			summary += "<br /> Speed: " + game.agentCar.speed;
			summary += "<br /> Limit: " + game.speedLimit;			
			summary += "<br /> Steps: " + steps;
		
			summary += "<br /> carB: " + game.score[game.carB] + " / " + game.score[4] + " : " + Math.floor((game.score[game.carB]/game.score[4]) * 100) + "%";
			
			document.getElementById(game.scoreId).innerHTML = summary;
			
			
				document.getElementById('log2').value+= currentTime() - curTime + "," + currentState + "," +  nextState + "," + game.laneDictionary[game.agentCar.position.line] + "," + currentSpeed + ","  + game.agentCar.collisionTime + "," + game.actionDictionary[action] + "," + action + "," + reward + "," + learner.qvalues[currentState][action] + ","+game.speedLimit + '<br /> \n ';
			
			/* if(currentState == "S310320"){
			var l = document.getElementById('log').value;
			document.getElementById('log').value =  currentTime() - curTime + "," + currentState + "," + action + "," + nextState + "," + reward + "," + learner.qvalues[currentState][action] + '\n' + l;
				console.log("*");
			}
			*/
			
		}
