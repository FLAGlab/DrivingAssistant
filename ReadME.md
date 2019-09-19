# Car Overtaking 

This repository is **work in progress**, its purpose it to try out techniques to teaching a car to drive from previous manual drives.

### What is this repository for? ###

* Car driving (Initial learning car actions)
* Analysis of car actions (Looking at the cvs files)

### Folder Layout
The experiments in the repository have an additional implementation where they uses pre-learned qvalues.
1.	Car_Different_Speeds
    * Car_Different_Speeds_PreLearn
2.	Car_Different_Speeds_SpeedLimits
    * Car_Different_Speeds_SpeedLimits_PreLearn
3.	Car_Reward_For_At_Limit
    * Car_Reward_For_At_Limit_PreLearn

There is a folder for analysing results.

In each experiment folder there are 3 files
*	Main.html		(the HTML markup)
*	Car_diffSpeeds_JS.js	(the javascript that runs the entire thing)
*	Qlearning2.js 		(the library)
There is also a results folder that I used to store the output results and the qvalues

### Running and Output
To run any of the 6 experiments you need to open the main.html file in a web browser. 
It will run on start. 
It is usually let run for about 200 / 300 cars.
As it runs it will output some results in csv format to the <textarea>  box on the screen. 
To save this, click the ‘Output CSV to new Window’ button and copy the contents of the new window to a text editor and save as .csv

Sample output is: 
Time, Current State,Next State, Lane [L/R], Current Speed, Time To Collision, Action , Reward , QValue 308,speed=20-40TimeToCollision=0,speed=0-20TimeToCollision=0,left,20,0,slow down,0,0


To get output the qvalues in JSON format click the ‘Output QValues’ button or
open the console and type
document.getElementById('log').value = JSON.stringify(learner.qvalues); 

This will dump the qvalues in JSON format to a second <textarea> 
These can be made more readable by using jsonprettyprint.com
Sample output is:
~~~~
"speed=40-60TimeToCollision=1": {
    "1": 0,
    "2": 0,
    "3": 107.0404069703,
    "4": -10,
    "5": 0
  } 
~~~~
 
To store this data so that it can be used and read by the bot:
*	Open a text file and type: data = 
*	Then copy and paste the JSON that was output in the browser textbox.
*	Then Save it as qvalues_X.json  where X is the speed of the other cars (more later)
~~~~ 
data = {
  "speed=20-40TimeToCollision=0": {
    "1": 0,
    "2": -10,
    "3": 0,
    "4": 0,
    "5": 28.943730322149
  }, 
~~~~

At all times there will be a percentage output of how many cars have been generated and how many it has crashed into as well as an integer showing how many ‘steps’ have been taken.
