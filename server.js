const express = require('express');
//const bot = require('./bot');
//const songBot = require('./songBot.js');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.get('/',async(req,res)=>{
    
    res.sendFile(__dirname + '/index.html');

    console.log("caught / req, calling bot...")
    const response = await bot()
    //console.log("got bot response, send response...")
    //res.send(response);
    //console.log("end...")
    
    
});



io.on('connection', (socket) => {
    console.log('a user connected');
    io.emit('chat message', 'Hi!');
    socket.on('disconnect', () => {
        console.log('user disconnected');
      });
  });

  io.on('connection', (socket) => {
    socket.on('chat message', (msg) => {
      console.log('message: ' + msg);
      
    });
  });

  io.on('connection', (socket) => {
    socket.on('chat message', (msg) => {
      io.emit('chat message', msg);
    });
  });

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`listening on *:${PORT}`);
  });

/*
app.listen(PORT,(err)=>{
    if(err) throw err;
    console.log(`Listening on port ${PORT}... `)
})
*/

const puppeteer = require('puppeteer');
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function bot() {
    console.log(`bot started`);
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox']
    });
    console.log(`browser started`);
    const page = await browser.newPage();
    //await page.goto('https://google.com', {
    //    waitUntil: 'networkidle2'
    //});
    
    console.log(`new page started`);
    await page.goto('https://mytuner-radio.com/radio/triple-m-country-449782/'
    //, 
    //{
    //    waitUntil: 'networkidle2'
    //}
    );
    
    console.log(`page loaded`);
    var songLogged = ''
    var artistLogged = ''
    const repeat = 1000000
    var count = 0

    do {
    const songName = await page.$("span[class='song-name']")
    //obtain text
    const songNameText = await (await songName.getProperty('textContent')).jsonValue()
    //console.log("Obtained text is: " + songNameText)
    const artistName = await page.$("span[class='artist-name']")
    //obtain text
    const artistNameText = await (await artistName.getProperty('textContent')).jsonValue()
    
    if (songNameText != songLogged) {
        
    var today = new Date();
    var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    var dateTime = date + ' ' + time;
    console.log(dateTime);
    console.log("Song: " + songNameText);
    console.log("Artist: " + artistNameText);
    console.log("----------------------------------");
    var str = "<br>" + dateTime + ", " + songNameText + ", " + artistNameText + ";"
    songLogged = songNameText
    artistLogged = artistNameText
    //document.getElementById("songLog").innerHTML += str;
    io.emit('chat message', str);
}
    
    count += 1
        //console.log("Loop count: " + count)
        await sleep(3000);
    } while (count < repeat)
    
    await browser.close();
    return str;
};