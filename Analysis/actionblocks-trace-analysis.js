var us = require('underscore');
var fs = require('fs');
var lineReader = require('readline');
var path = require('path');

/**
ADT - structure
states = [{ //Obj1
  state: state_string
  actions: [{   //priority list
   priority: HighPriority,
   actions: []
  },
  {
    priority: lowerPriority,
    actions []
  }]
  },
  { // Obj2 }]
**/

namesToWrite = fs.readdirSync("input/");

us.each(namesToWrite, function(filename) {
  var fn = path.join(__dirname, './input/'+filename);
  var contents = fs.readFileSync(fn).toString();
  var lines = contents.split("\n");
  var automationStructure = {
    states: []
  };
  var length3 = [];
  var length4 = [];
  var length5 = [];
  var state3 = ["", ""];
  var state4 = ["", ""];
  var state5 = ["", ""];
  console.log(filename);
  for(var i=0; i<lines.length; i++) {
    //The file comes in the format:
    //Time, Current State,Next State, Lane [L/R], Current Speed, Time To Collision, Action , Reward , QValue
    // Time, currentState, nextstate (time_to_collision), lane, currentSpeed, Action, reward, q-value
    var line = lines[i];
    //console.log(line);
    //console.log(currentState);
    var columns = line.split(",");
    var action = columns[6];
    var state = "[" + columns[1] + "]"; //columns.slice(4,6);//filter(function(num, index, array) { return index == 3 || index == 5; });
    //console.log(length3);
    var res3 = collectActions(automationStructure, state, action, state3, length3, 3);
    var res4 = collectActions(automationStructure, state, action, state4, length4, 4);
    var res5 = collectActions(automationStructure, state, action, state5, length5, 5);
    state3 = res3[0];
    length3 = res3[1];
    state4 = res4[0];
    length4 = res4[1];
    state5 = res5[0];
    length5 = res5[1];
  }

  //end-of-file event
  writeExtractions(order(automationStructure), filename);
});

//Ordering
function order(structure) {
  us.each(structure.states, function(s) {
    s.actions = us.sortBy(s.actions, 'priority').reverse();
    /*console.log("--ANTES --");
    console.log(s.state);
    console.log(s.actions);
    */
    var swapped = true;

    for(var i=0; i < s.actions.length; i++) {
      for(var j=0; j < s.actions.length && swapped; j++) {
        if(arrayContained(s.actions[i].actions, s.actions[j].actions)) {
          var temp = s.actions[i];
          s.actions[i] = s.actions[j];
          s.actions[j] = temp;
          swapped = false;
        }
      }
    }
    /*
    console.log("--DEPUES --");
    console.log(s.state);
    console.log(s.actions);
    */
  });
  return structure;
}

function collectActions(automationStructure, currentState, currentAction, collectingState, actionsArray, actionsLength) {
  if(actionsArray.length === 0) {
    collectingState = currentState;
  }
  actionsArray.push(currentAction);
  if(actionsArray.length == actionsLength) {
      //console.log(actionsArray);
      checkActions(automationStructure, collectingState, actionsArray);
      actionsArray = [];
  }
  return [collectingState, actionsArray];
}

function checkActions(automationStructure, currentState, actions) {
  if(arrayEquals(currentState, []) || arrayEquals(currentState, ["", ""]) || arrayEquals(actions, [])) {
    return;
  }
  var applicableState = us.filter(automationStructure.states, function(s) {
    return arrayEquals(s.state, currentState);
  });
  if(!arrayEquals(applicableState, [])) {
    //console.log("applicable state");
    var foundActions = us.filter(applicableState[0].actions, function(action) {
      return arrayEquals(action.actions, actions);
    });
    if(!arrayEquals(foundActions, [])) {
      foundActions[0].priority ++;
    } else {
      applicableState[0].actions.push({
        'priority': 1,
        'actions': actions
      });
    }
  } else {
    //console.log("no applicable state");
    automationStructure.states.push({
      'state': currentState,
      'actions': [{
        'priority': 1,
        'actions': actions
      }]
    });
  }
}


//Auxiliary functions
//Checks if array1 is contained in array2
function arrayContained(array1, array2) {
  // if either array is a falsy value, return
  if (!array1 || !array2)
      return false;

  // compare lengths - can save a lot of time
  if (array1.length >= array2.length)
      return false;

  for(var i=0; i<array1.length; i++) {
    if(array1[i] != array2[i])
      return false;
  }
  return true;
}

//Check if the two parameter arrays are equal
function arrayEquals(array1, array2) {
    // if either array is a falsy value, return
    if (!array1 || !array2)
        return false;

    // compare lengths - can save a lot of time
    if (array1.length != array2.length)
        return false;

    for (var i = 0, l=array1.length; i < l; i++) {
        // Check if we have nested arrays
        if (array1[i] instanceof Array && array2[i] instanceof Array) {
            // recurse into the nested arrays
            if (!arrayEquals(array1[i], array2[i]))
                return false;
        }
        else if (array1[i] != array2[i]) {
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;
        }
    }
    return true;
}

//Writting extracted information to a file
function writeExtractions(automationStructure, filename) {
  //console.log("calling extractions");
    fs.writeFileSync("./res/" + filename.split(".")[0] + ".txt");

    var stream = fs.createWriteStream("./res/" + filename.split(".")[0] + ".txt");
    stream.once('open', function(fd) {
      var i = 0;
      us.each(automationStructure.states, function(s) {
        stream.write("state " + i + ":  ");
        stream.write(JSON.stringify(s.state, null, 0));
        stream.write("\n \t");
        us.each(s.actions, function(action) {
            stream.write("priority:" + action.priority + " -> actions: " + JSON.stringify(action.actions, null, 0));
            stream.write("\n \t");
        });
        stream.write("\n");
        i++;
      });
      i = 0;
      stream.end();
    });
}
