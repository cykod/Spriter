var fs = require('fs'),
    util = require('util'),
    Canvas = require('canvas'),
    Image = Canvas.Image,
    Futures = require('futures'),
    Join = Futures.join;

var maxSpriteWidth = 2048;
  
function spriter(directory) { 
  var files = fs.readdirSync(directory),
      rowData = {},
      // Load all the images
      join = loadImages(directory,files,rowData);
 
  // Wait for the all images to load
  join.when(function() {
    // Get the dimensions of the output sprite map
    var dimensions = calculateSize(rowData),
        canvas = new Canvas(dimensions.width, dimensions.height);

    // Draw the images to the canvas and return the JSON data
    var jsonOutput = drawImages(rowData,canvas);

    // Write out both the sprites.png and sprites.json files
    fs.writeFileSync("./sprites.png",canvas.toBuffer());
    fs.writeFileSync("./sprites.json",JSON.stringify(jsonOutput));
    util.print("Wrote sprites.png and sprites.json\n");
  });
  
}

function loadImages(directory,files,rowData) {
  var fileRegex = /^(.*?)([0-9]+)\.[a-zA-Z]{3}$/,
      join = Join();

  for(var i=0;i<files.length;i++) {
    (function(file) {
      var results = file.match(fileRegex),
          img = new Image();

      if(results) {
        var rowName = results[1],
            fileNum = parseInt(results[2],10);

        img.onload = join.add();
        img.onerror = function() { 
          util.print("Error loading: " + file + "\n"); process.exit(1); 
        }

        img.src = directory.replace(/\/$/,"") + "/" + file;

        rowData[rowName] = rowData[rowName] || [];
        rowData[rowName].push([fileNum,img]);
      }
    })(files[i]);
  }

  return join;

}

function calculateSize(rowData) {
  var maxWidth = 0,
      totalHeight = 0;

  for(var spriteName in rowData) {
    // Order by ascending number
    var row = rowData[spriteName],
    firstImage = row[0][1],
    width = firstImage.width * row.length,
    rows = 1;

    if(width > maxSpriteWidth) {
      rows = Math.ceil(width / maxSpriteWidth);
      width = maxSpriteWidth;
    }

    maxWidth = Math.max(width,maxWidth);
    totalHeight += firstImage.height * rows + 2;
  }

  return { width: maxWidth, height: totalHeight };
}

function drawImages(rowData,canvas) {
    var ctx = canvas.getContext('2d'),
        curY = 0,
        jsonOutput = {};

    for(var spriteName in rowData) {
      // Order by ascending number
      var row = rowData[spriteName].sort(function(a,b) { return a[0] - b[0]; }),
          firstImage = row[0][1],
          imageWidth = firstImage.width,
          rowHeight = firstImage.height,
          rowWidth = Math.min(imageWidth * row.length, maxSpriteWidth),
          cols = Math.floor(rowWidth / imageWidth),
          rows = Math.ceil(row.length / cols);

          console.log(spriteName + " " + cols + " " + rows);

      curY++; 

      jsonOutput[spriteName] = { sx: 0, sy: curY, cols: cols,
                                 tilew: imageWidth, tileh: rowHeight, 
                                 frames: row.length };

      for(var i =0;i<rows;i++) {
        for(var k=0;k<cols;k++) {
          if(row[k+i*cols])  {
            ctx.drawImage(row[k + i*cols ][1],k*imageWidth,curY);
          }
        }
        curY += Math.ceil(rowHeight) + 1; 
      }
    }

    return jsonOutput;

}



// Make the spriter method available
module.exports = spriter;
