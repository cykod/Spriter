var fs = require('fs'),
    util = require('util'),
    path = require('path'),
    mkdirp = require('mkdirp'),
    Canvas = require('canvas'),
    Image = Canvas.Image,
    Futures = require('futures'),
    Join = Futures.join;

var maxSpriteWidth = 2048;
  
function spriter(options) {
  var sourceDirectories = options.sourceDirectories,
      imageDestination = options.imageDestination || '.',
      dataDestination = options.dataDestination || '.';

  var fileLists = sourceDirectories.reduce(function(lists, directory) {
    lists[directory] = fs.readdirSync(directory);
    return lists;
  }, {});
  var rowData = {},
      // Load all the images
      join = loadImages(fileLists,rowData);
 
  // Wait for the all images to load
  join.when(function() {
    // Get the dimensions of the output sprite map
    var dimensions = calculateSize(rowData),
        canvas = new Canvas(dimensions.width, dimensions.height);

    // Draw the images to the canvas and return the JSON data
    var jsonOutput = drawImages(rowData,canvas);

    // Create non-existent target directories recursively, if needed
    mkdirp.sync(path.resolve(imageDestination));
    mkdirp.sync(path.resolve(dataDestination));

    // Write out both the sprites.png and sprites.json files
    var imageTarget = path.resolve(imageDestination,"sprites.png"),
        dataTarget = path.resolve(dataDestination,"sprites.json");
    fs.writeFileSync(imageTarget,canvas.toBuffer());
    fs.writeFileSync(dataTarget,JSON.stringify(jsonOutput));
    util.print("Wrote sprites.png and sprites.json\n");
  });
  
}

function loadImages(fileLists,rowData) {
  var fileRegex = /^(.*?)([0-9]+)\.[a-zA-Z]{3}$/,
      join = Join();

  Object.keys(fileLists).forEach(function(directory) {
    var files = fileLists[directory];
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

          img.src = path.resolve(directory, file);

          rowData[rowName] = rowData[rowName] || [];
          rowData[rowName].push([fileNum,img]);
        }
      })(files[i]);
    }
  });

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
    totalHeight += firstImage.height * rows + 1;
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
        curY += Math.ceil(rowHeight); 
      }
    }

    return jsonOutput;

}



// Make the spriter method available
module.exports = spriter;
