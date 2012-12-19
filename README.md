

Installing
----------

Until it's packaged up, run the following command from the repo's directory:

    npm link

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
