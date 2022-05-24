const express = require('express');
const bot = require('./bot');
//const songBot = require('./songBot.js');
const app = express();

app.get('/',async(req,res)=>{
    console.log("caught / req, calling bot...")
    const response = await bot()
    console.log("got bot response, send response...")
    res.send(response);
    console.log("end...")
});

const PORT = process.env.PORT || 3000;

app.listen(PORT,(err)=>{
    if(err) throw err;
    console.log(`Listening on port ${PORT}... `)
})