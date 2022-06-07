# CNC Plotter

A Simple Server for CNC Plotter

## G Code Logic

The G Code Logic is not mine, but I have downloaded it from [here](https://github.com/Stypox/plotter)

## Server

The server recieves either an image or a pre-set of shapes from the mobile application, then if it recieved a pre-set of shapes, it will send the shapes to the ESP, otherwise it will compile the image into G Code and then sends that G Code to the ESP. The ESP in turn will send the G Code to the CNC Plotter.
