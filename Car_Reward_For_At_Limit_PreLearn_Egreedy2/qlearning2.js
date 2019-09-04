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
	this.steps=0;
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
  for(action in this.qvalues[state])
   {
        if(i==0)
        {   
            max = this.qvalues[state][action];
        }
         else{
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
    console.log(dump);
    document.getElementById('log').value = dump;
  
};

QLearner.prototype.learn = function(steps){
    steps = Math.max(1, steps || 0);
    while (steps--){
        this.currentState = this.randomState();
        this.step();
    }
};

//ivana new version, to balance exploitation and exploration better


QLearner.prototype.bestAction = function(state){
    
    var stateQvalues = this.qvalues[state] || {};
    
   exploreLimit=0;
   if (this.steps < 100)
	   exploreLimit=0.5;
   else	
	   exploreLimit=0.99;
   
    var bestAction = this.actions[Math.floor(Math.random()*this.actions.length+1)];
	
	//var bestAction =null;
	if (Math.random()<exploreLimit) //not exploring/getting random, just get the best tone
	{
		for (var action in stateQvalues){
			if (stateQvalues.hasOwnProperty(action)){
				
				if (!bestAction){
					bestAction = action;
					//stateQvalues[action] == stateQvalues[bestAction] as it was, will only get another one with same value?
					//stateQvalues[action] <= stateQvalues[bestAction] will get the smallest one? 
					
				 //} else if ((stateQvalues[action] <= stateQvalues[bestAction]) && (Math.random()>exploreLimit)){//this will always pick next one, not random one ...
				  //bestAction = action;
				 }
				else if (stateQvalues[action] > stateQvalues[bestAction]){
					bestAction = action;
				}
			
		   }
		   
		}
	}
	
	//still no cars generated, guessing cuz of overtaking and speed 0 action
	
	if (Math.random()>exploreLimit)
	{
			bestAction = Math.floor(Math.random()*4+1) ;
	}
    
    return bestAction; //returns hardcoded action here but not above
};



/*
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
};*/

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

QLearner.prototype.runOnce = function(state, steps){
	this.steps = steps;
    var best = this.bestAction(state, steps);
    var action = this.states[state].actions[best];
    if (action){
        this.currentState = this.states[action.nextState];
    }
    return action && this.currentState;
};