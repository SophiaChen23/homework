var express = require('express');
var app = express();
//
// app.get('/', function(req, res) {
//     console.log("The Node server on port 5000 is now running");
//     res.send("Home Page");
// });
app.get(['/', '/:content'], function(req,res){
    var content = req.params.content;
    if (content == null || content.length == 0 || content === "" || content === "/" || req.url ==="/") {
        console.log("The Node server on port 5000 is now running")
        res.send("Home Page");
    } else if (req.params.content === content) {
        console.log("The Node server on port 5000 is now running")
        res.send(content + " Page");
    } else {
        console.log("invlid, request");
        res.send("Invalid request");
    }

});


app.listen(5000);
