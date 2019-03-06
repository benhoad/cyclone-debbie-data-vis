//----define global variables----

//data is the varaible we'll store the massive array of data points in
let data;
//scale is the variable we'll use to scale up the lengths of the lines (literally a scalar to a vector)
let scale = 40;

//this function runs when the page is loaded and ready to start doing stuff - if it runs too early then the "canvas" object might not exist when it tries to do stuff with it
(function() {
  //in the html the id of the canvas element is also set as "canvas"
  let canvas = document.getElementById("canvas");
  // canvases have "contexts"; we'll be getting the 2d plane to work on.
  let context = canvas.getContext("2d");

  // resize the canvas to fill browser window dynamically - listen for resizing of the window, when people click on the edges to physically resize it.
  window.addEventListener("resize", resizeCanvas, false);

  function resizeCanvas() {
    //double the resolution of the canvas object so it looks nicer on retina screens
    canvas.width = window.innerWidth * 2;
    canvas.height = window.innerHeight * 2;
    //call the function below called "readTextFile" and give it the argument "./data.csv" - which './' means look in the same directory of this js file.
    readTextFile("./data.csv");
  }
  //call the function for the first time - all subsequent times will be when the window is resized.
  resizeCanvas();
})();

/*
 *
 *
 *
 *  The three mains functions:
 *  readTextFile - get the data from the csv file
 *  processData - turn the raw text returned from readTextFile into a useful array
 *  displayData - turn the array into white lines on a page.
 *
 *
 *
 */

//define the function to read the text file.
function readTextFile(file) {
  //this part will probably be different in python - but might still require some kind of  file request so you can keep the data and code separate.

  //make variable "rawFile" be a simple xml http request
  let rawFile = new XMLHttpRequest();
  //set the xml http request to be a "GET" request - GET is just one of the main types of request for the web.
  //"file" in this case is the "./data.csv" that was given to the function when it was called.
  rawFile.open("GET", file, true);

  //listen for changes in the file request; like when it's done reading the file:
  rawFile.onreadystatechange = function() {
    //again probably won't need to worry about this given python doesn't run from a web server normally. (not counting Django - which is like Python's version of Rails)
    if (rawFile.readyState === 4) {
      if (rawFile.status === 200 || rawFile.status == 0) {
        //get the plain string/text of that file and process it using the "processData" function we've defined below
        processData(rawFile.responseText);
      }
    }
  };
  //trigger the request - the stuff above doesn't execute until this "rawFile" variable returns some activity.
  rawFile.send(null);
}

function processData(csv) {
  //"allTextLines" becomes an array where each item in the array is a row, the string uses special chars ("\r\n" or "\n") to denote a new line or carriage return (named after returning the carriage of a typewriter back to the start - *type type type DING! sliiiiiiide*)
  let allTextLines = csv.split(/\r\n|\n/);
  //create an empty array
  let lines = [];
  //create a for loop that goes through all of the items in allTextLines (or each row of the data set)
  for (let i = 0; i < allTextLines.length; i++) {
    //each line will be a string like "12,0.04,270" which to be useful needs to be split into an array, so each row/item will end up being something like ['12', '0.04', '270'] << still as strings but that's fine for now.
    lines.push(allTextLines[i].split(","));
    //push() is a function that just adds whatever you give it to the end of an array, i.e. if i have an array that's;   numbers = [1,2,3] and i say numbers.push(4), it'll now be [1,2,3,4]
  }

  //set global variable "data" to be the same as what we've just created in lines.
  data = lines;
  //don't need to do this is python but i've just created a setTimeout, which literally waits for 1000 milliseconds before continuing to give the browser a breather.
  setTimeout(function() {
    displayData();
  }, 1000);
}

function displayData() {
  //get the total length of the data set - number of rows will be like 100K
  let length = data.length;

  //get the canvas object
  let c = document.getElementById("canvas");

  //get the canvas object's 2d context
  let ctx = c.getContext("2d");

  //set scale to be pretty for retina screens
  ctx.scale(2, 2);

  //all this stuff is just for drawing - get the browser window's width/height
  let totalHeight = window.innerHeight;
  let totalWidth = window.innerWidth;
  // this line should be height *2 /2, times two for the double scale but then divide two so the line sits in the middle of the screen.
  let height = totalHeight;
  let width = totalWidth * 2;

  //log out the first line just to make sure the data is no malformed.
  console.log(data[0]);

  //go through the entire data set
  for (let [index, datum] of data.entries()) {
    //only for every 1 in 10 compute it - anything more and it might have a shit fit, python might handle this better.
    if (index % 10 == 1) {
      //temporarily store the left/x position
      let pos = (width / length) * parseFloat(index);
      //store the length the line will be.
      let lineHeight = parseFloat(datum[1]) * scale;
      //move line to origin, so it rotates about itself. - annoying but necesary for canvas drawing.
      ctx.translate(pos + 0.5, height);
      //rotate based on the wind direction which is the 3rd field remember array's indexes start at 0 so 3rd is [2] - rotate function is in radians and the line starts pointing down so i add 180 degrees to correct it at the top.
      ctx.rotate(((parseFloat(datum[2]) + 180) * Math.PI) / 180);
      //move line back to start after it's been rotated.
      ctx.translate(-pos + 0.5, -height);

      //set the color of the line (technically i'm drawing rectangles of width 1)
      ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
      // draw the rectangle
      ctx.fillRect(pos, height, 1, lineHeight);

      //reset the transforms you've performed above so that the next line starts fresh - transforms technically continue so if you don't reset the transform matrix it'll give weird results as each new lines will inheret the transformtion of the lines before it.
      ctx.resetTransform();
      // console.log("xpos:", ((width/length)*parseFloat(index)));
    }
  }

  //console log done to show that it hasn't shit the bed.
  console.log("done");
}
