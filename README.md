# msplotty
distributed producer consumer visualizer

Mlotty is a general purpose, language agnostic, grid visualizer. It was originally designed to visualize warehouses but it is simple enough to visualize any producer consumer system.

### How to use
Plotty reads in from `stdin` and dumps the information on browser using websockets. You can use any program to feed it information using Unix pipes. The program just needs to print the command to `stdout`.
