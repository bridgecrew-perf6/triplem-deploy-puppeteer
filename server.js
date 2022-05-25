'use strict';
//added buildpack
const express = require('express');
//const bot = require('./bot');
//const songBot = require('./songBot.js');
//const app = express();
const http = require('http');
//const server = http.createServer(app);
//const { Server } = require("socket.io");
//const io = new Server(server);

//const express = app;
const socketIO = require('socket.io');

//const PORT = process.env.PORT || 3000;
const INDEX = '/index.html';
const querystring = require('querystring');
const request = require("request");

const PORT = process.env.PORT || 3000;

const { Pool, Client } = require('pg')
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'testdb',
  password: 'password',
  port: 5432,
})

/*
server.listen(PORT, () => {
    console.log(`listening on *:${PORT}`);
  });
*/

const app = express()
  .get('/', async (req, res) => {
    res.sendFile(__dirname + '/index.html');
    console.log("caught / req, calling bot...")
    const response = await bot()
    //console.log("got bot response, send response...")
    //res.send(response);
    //console.log("end...")
  })
  //.use((req, res) => res.sendFile(INDEX, { root: __dirname }))
  .listen(PORT, () => console.log(`Listening on ${PORT}`))
  ;

const io = socketIO(app);

io.on('connection', (socket) => {
  console.log('Client connected');
  socket.on('disconnect', () => console.log('Client disconnected'));
});

setInterval(() => io.emit('time', new Date().toTimeString()), 1000);


/*
app.get('/',async(req,res)=>{
      res.sendFile(__dirname + '/index.html');
    console.log("caught / req, calling bot...")
    const response = await bot()
    //console.log("got bot response, send response...")
    //res.send(response);
    //console.log("end...")
});
*/


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
  //await page.goto('https://mytuner-radio.com/radio/triple-m-country-449782/'
  await page.goto('https://www.triplem.com.au/country'
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
  let dataElement = "p[class='Paragraph__ParagraphBase-sc-1un50nq-0 Paragraph__MultiLineEllipsisBase-sc-1un50nq-1 Paragraph__MultiLineEllipsis-sc-1un50nq-3 bhvhXQ']"

  do {
    const songName = await page.$(dataElement)
    //obtain text
    const text = await (await songName.getProperty('textContent')).jsonValue();
    const substrings = text.split(' - ');
    const songNameText = substrings[1]
    //console.log("Obtained text is: " + songNameText)
    //const artistName = ''//await page.$("span[class='artist-name']")
    //obtain text
    const artistNameText = substrings[0]

    if (songNameText != songLogged) {

      var today = new Date();
      var dateTime = today.toLocaleString('en-AU', { timeZone: 'Australia/Melbourne' });
      //var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
      //var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
      //var dateTime = date + ' ' + time;
      console.log(dateTime);
      console.log("Song: " + songNameText);
      console.log("Artist: " + artistNameText);
      console.log("----------------------------------");
      var str = dateTime + ", " + songNameText + ", " + artistNameText + ";"
      songLogged = songNameText
      artistLogged = artistNameText
      //document.getElementById("songLog").innerHTML += str;
      io.emit('chat message', str);
      //let queryString = "insert into tracks(timestamp, song, artist)VALUES(" + dateTime + "," + songNameText + "," + artistNameText + ")";
      const insertSQL = `
            insert into tracksNew (timePlayed, song, artist)
            VALUES($1, $2, $3);
            `;
      pool.query(insertSQL, [dateTime, songNameText, artistNameText]);
      const baseUrl = `https://docs.google.com/forms/d/e/1FAIpQLSfTC6W0U2iJpn7I-UxhnP3hnmWPAvjrWHQFhqfOKxRJBQgHNA/formResponse?usp=pp_url&entry.`
      const urlToSend = baseUrl + `${querystring.stringify({1109149267:dateTime})}&entry.${querystring.stringify({1800149853:songNameText})}&entry.${querystring.stringify({1153594467:artistNameText})}&submit=Submit`
      //console.log(urlToSend);
      sendToSheets(urlToSend);
      //let gUrl = new URL('https://docs.google.com/forms/d/e/1FAIpQLSfTC6W0U2iJpn7I-UxhnP3hnmWPAvjrWHQFhqfOKxRJBQgHNA/viewform?usp=pp_url&entry.1109149267=25/05/2022,+1:47:22+pm&entry.1800149853=Coming+Home&entry.1153594467=Keith+Urban+feat.+Julia+Michaels');
      //let params = new URLSearchParams(gUrl.search);
      

    }
    //console.log(`browser is connected?: ${browser.isConnected()}`);
    count += 1
    //console.log("Loop count: " + count)
    await sleep(3000);
  } while (count < repeat)

  await browser.close();
  return str;
};

function sendToSheets(url){

request.get(url,function(error,response,body){
           if(error){
                 //console.log(error);
           }else{
                 //console.log(response);
         }
});
};