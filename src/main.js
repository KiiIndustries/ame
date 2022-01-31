console.log("Hello World!");

// First let's create the Canvas and Context the user will
// interact with
const Canvas  = document.createElement("CANVAS");
Canvas.width  = 100;
Canvas.Height = 100;
const Context = Canvas.getContext("2d");
// Then we can go ahead and add them to the document.
document.body.appendChild(Canvas);
// Now let's see if it's there
Context.fillRect(10,10,80,80);