var fs = require('fs')
var lineReader = require('readline')
var path = require('path')
const CUTOFF = 10

var actionIndex = -1
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
let namesToWrite = ["./exploitation.csv"]
namesToWrite.forEach(function(filename) {
  let fn = path.join(__dirname, filename);
  let contents = fs.readFileSync(fn).toString();
  let lines = contents.split("\n");
  //detect the actions and the states
  let arr = lines[0].split(',')
  for(var i=0; i<arr.length; i++) {
    if(arr[i] === 'action') {
      actionIndex = i
      break
    }
  }
  let currentState = ""
  let lastState = ""
  var automationStructure = {}
  for(var i=1; i<lines.length; i++) {
    //The file comes in the format:
    //State (many entries), action, Next State (same entrie as before), penalties (many entries)
    var line = lines[i];
    if(typeof(line) !== 'undefined') {
      var columns = line.split(",");
      var action = columns[actionIndex];
      currentState = columns.slice(0,actionIndex);
      if(columns[0] != 60 || columns[1]!=0 || columns[2]<4) {
        let result = subSequence(lines.slice(i), actionIndex)
        //i = result[0]
        collectActions(automationStructure, currentState, result)
      }
    }
  }
  //contextGeneration(extractActions(automationStructure))
  contextGeneration(automationStructure)
});

//goal condition
function subSequence(lines, actionIndex) {
  let sequence = []
  let i = 0
  let columns = lines[i].split(",")
  while(columns[0] != 60 || columns[1]!=0 || columns[2]<4) {
    //console.log(`${i} lines: ${lines.length}`)
    //if(i >= lines.length - 1) 
    //  return [i, sequence]
    sequence.push(lines[i])
    i++  
    columns = lines[i].split(",")
  } 
  return sequence
}

//Choose options based on highest reward, max length order
function collectActions(automationStructure, currentState, lines) {
  let stateActions = automationStructure[currentState]
  if(typeof(stateActions) == "undefined") {
    automationStructure[currentState] = new Set()
    stateActions = automationStructure[currentState]
  }
  //let cumulativeReward = lines.reduce( (accum, val) => accum + parseInt(val.split(",")[2*actionIndex + 1]), 0 )
  //if(!isNaN(cumulativeReward)) {
    let actions = lines.map( line => line.split(",")[actionIndex])
    let frequency = checkEquals(stateActions, actions)
    if(frequency == 1) {
      let obj = [frequency, actions]
      stateActions.add(obj)
    }
}

function checkEquals(stateActions, arr) {
  for(let item of stateActions) {
    if(arrayEquals(item[1], arr)) {
      item[0] += 1
      return item[0] + 1
    }
  }
  return 1
}

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

//Context generation
function contextGeneration(automationStructure) {
  let optionsCount = {}
  let frequencies = {}
  Object.keys(automationStructure).forEach(function(s) {
    optionsCount[s] = automationStructure[s].size
  })
  Object.keys(automationStructure).forEach(function(s) {
    let it = automationStructure[s].values()
    for(var i=0; i<automationStructure[s].size; i++) 
      frequencies[`${s},${i}`] = it.next().value[0]
  })
  var stream = fs.createWriteStream("./options.txt");
  stream.once('open', function(fd) {
    stream.write(`${JSON.stringify(optionsCount)}\n`)
    stream.write(`${JSON.stringify(frequencies)}\n`)
    Object.keys(automationStructure).forEach(function(s) {
      let it = automationStructure[s].values()
      for(var i=0; i<automationStructure[s].size; i++) {
        let stateName = `Context${s.replace(/,/g,'')}${i}`
        stream.write(`${stateName} = new cop.Context({ 'name': "${stateName}"})\n`)
        let actions = it.next().value
        let adaptation = createBehavioralAdaptation(stateName, actions[1]);  
        stream.write(`${adaptation[1]}\n`)
        stream.write(`${stateName}.adapt(agent, ${adaptation[0]})\n`)
      }
    })
    stream.end()
  })
}

function createBehavioralAdaptation(s, actions) {
  var funBody = "";
  actions.forEach(action =>  {
    funBody += `\t\tthis.${action}();\n`
  })
  return [`BA${s}`, `BA${s} = Trait({
    'option': function() {\n ${funBody} \t}\n})`]
}