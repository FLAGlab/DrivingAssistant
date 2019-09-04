var cop = require("./context-traits.js");
//file managing libraries
var us = require('underscore');
var fs = require('fs');
var lineReader = require('readline');
var path = require('path');

Car = Trait({
  speed: 0,
  lane: 'right',
  drive: function() {
    console.log("car driving normally: " + this.speed);
  },
  speedUp: function() {
    this.speed += 5;
    console.log("speed+ " + this.speed);
  },
  slowDown: function() {
    this.speed -= 5;
    console.log("speed- " + this.speed);
  },
  overtake: function() {
    if(this.lane == 'right')
      this.lane = 'left';
    this.lane = 'right';
    console.log("Lane: " + this.lane);
  }
});

var car = Object.create(Object.prototype, Car);

filesToRead = fs.readdirSync("res/test/");
var contexts = [];

us.each(filesToRead, function(filename) {
  var fn = path.join(__dirname, './res/test/'+filename);
  var contents = fs.readFileSync(fn).toString();
  var lines = contents.split("\n");
  var newContext = false;
  for(var i=0; i<lines.length; i++) {
    var line = lines[i];
    if(line === '')
      break;
    if(line.startsWith("state ")) {
      var contextName = line.substring(line.indexOf("["), line.indexOf("]")+1);
      //console.log("context: " + contextName);
      contexts.push(new cop.Context({'name': contextName}));
      //console.log(contexts[contexts.length-1].name().name);
      newContext = true;
    } else if(newContext) {
      line = line.substring(line.indexOf("[")+1, line.indexOf("]"));
      line = line.replace(/['"]+/g,'');
      var actionsArray = line.split(",");
      var adaptation = createBehavioralAdaptation(actionsArray);
      //console.log(adaptation.toString());
      BA = Trait({
        'drive': adaptation
      });
      contexts[contexts.length-1].adapt(car, BA);
      newContext = false;
    }
  }
  run();
});

function createBehavioralAdaptation(actions) {
  var funBody = "";
  for(var i=0; i<actions.length; i++) {
    funBody += "car." + actions[i] + "();\n";
  }
  return function() {
    eval(funBody);
  };
}

function run() {
  var index = 0;
  var change = true;

  setInterval(function() {
    console.log("index: " + index + " - " + contexts[index].isActive());
    car.drive();
  }, 500);

  setInterval(function() {
    if(change) {
      index = Math.floor(Math.random()*(contexts.length-0)) + 0;
      change = false;
      contexts[index].activate();
      //console.log("Activating index: " + index + " - " + contexts[index].isActive());
    }
  }, 600);

  setInterval(function() {
//  console.log("Deactivating index: " + index + " - " + contexts[index].isActive());
    contexts[index].deactivate();
    change = true;
  }, 800);
}
