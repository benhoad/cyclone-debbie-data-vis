//----define global variables----

//data is the varaible to store array of data points in
let data;
//exaggerated scalar vector of the wind gust lengths
let scale = 30;

(function() {
 
  let canvas = document.getElementById("canvas");

  // resizes the canvas to fill browser window dynamically
  window.addEventListener("resize", resizeCanvas);

  function resizeCanvas() {
    //double resolution of the canvas object for retina screens
    canvas.width = window.innerWidth * 2;
    canvas.height = window.innerHeight * 2;
    
    readTextFile("./data.csv");
  }
  
  resizeCanvas();
})();


//function to read text file
function readTextFile(file) {
  
  //make variable "rawFile" be a simple xml http request
  let rawFile = new XMLHttpRequest();
  //set the xml http request to be a "GET" request
  rawFile.open("GET", file, true);

  //listen for changes in the file request; when it's done reading the file:
  rawFile.onreadystatechange = function() {
    if (rawFile.readyState === 4) {
      if (rawFile.status === 200 || rawFile.status == 0) {
        //get the plain string/text of that file and process it using the "processData" function defined below
        processData(rawFile.responseText);
      }
    }
  };
  rawFile.send(null);
}


function processData(csv) {
  //"allTextLines" becomes an array where each item in the array is a row. The string uses special chars ("\r\n" or "\n") to denote a new line or carriage return
  let allTextLines = csv.split(/\r\n|\n/);
  //create an empty array
  let lines = [];
  //create a for loop that goes through each row of the data set
  for (let i = 0; i < allTextLines.length; i++) {
    lines.push(allTextLines[i].split(","));
  }
  data = lines;
  setTimeout(function() {
    displayData();
  }, 1000);
}

function displayData() {
  let length = data.length;

  //get the canvas object
  let c = document.getElementById("canvas");

  //get the canvas object's 2d context
  let ctx = c.getContext("2d");

  //set scale to be double resolution for retina screens
  ctx.scale(2, 2);

  //for drawing - set the browser window's width/height
  let totalHeight = window.innerHeight;
  let totalWidth = window.innerWidth;
  let height = totalHeight;
  let width = totalWidth * 2;

  //log out the first line just to make sure the data is no malformed
  console.log(data[0]);

  //go through the entire data set
  for (let [index, datum] of data.entries()) {
    //only every 1 in 10 data will be computed with the modulus command % 10 (10,000 data points)
    if (index % 10 == 1) {
      //temporarily store the left/x position
      let pos = (width / length) * parseFloat(index);
      //store the length the line
      let lineHeight = parseFloat(datum[1]) * scale;
      //move line to origin, so it rotates about itself - necesary for canvas drawing
      ctx.translate(pos + 0.5, height);
      //rotate based on the wind direction which is the 3rd field remember array's position [2] - rotate function is in radians and the line starts pointing down so i add 180 degrees to correct it at the top.
      ctx.rotate(((parseFloat(datum[2])) * Math.PI) / 180);
      //move line back to start after being rotated
      ctx.translate(-pos + 0.5, -height);

      //set the color of the line
      let hue = 100 + parseFloat(datum[1]) * 18;
      if (hue >360){hue = 360};
      ctx.fillStyle = "hsla(" + hue +", 70%, 50%, 0.4)";
      // draw the wind line (which is actually a thin rectangle)
      ctx.fillRect(pos, height, 1, lineHeight);

      //reset the transforms performed above so that the next line starts fresh
      ctx.resetTransform();
    }
  }
  console.log("done");
}
