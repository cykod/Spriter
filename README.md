

Installing
----------

Clone the repo, make sure you have node installed and then run:
  
    npm install

Until it's packaged up, run the following command from the repo's directory:

    npm link

Or if you have node installed globally

    sudo npm link

To put the `spriter` script in your local bin directory.


Running
-------

if you have a directory called assets that has all your individual image frames, run:

    spriter assets/

This will generate a sprites.json and sprites.png file that can be loaded into Quintus.

asset files should share an initial root and then end in incrementing numbers, e.g.:

    mario01.png
    mario02.png
    mario03.png
    luigi01.png
    luigi02.png
   
Running spriter on a directory with those files will generate a sprite sheet with 2 sprites, mario and luigi,
and 3 mario frames and 2 luigi frames.

Advanced Usage
--------------

You may specify multiple source directories, as well as target directories for `sprites.png` and `sprites.json`.

    spriter <source_dir>... [-d <data_target_dir>] [-i <images_target_dir>]
    
Options:

* `-d`:  Precedes name of directory where `sprites.json` will be placed.

* `-i`:  Precedes name of directory where `sprites.png` will be placed.

Examples:

    spriter project/assets_dir1 project/more_assets ../some_other_dir
    spriter -i project/images project/assets -d project/data
    spriter -d project/data project/assets_1 project/assets_2
    spriter src/images -i dist/images -d dist/data

Arguments may be specified in any order. The target directories also don't need to exist yet. Parent directories will be created recursively as needed.
