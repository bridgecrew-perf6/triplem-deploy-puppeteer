const puppeteer = require('puppeteer');
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const bot = async() =>{
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
}
    
    count += 1
        //console.log("Loop count: " + count)
        await sleep(3000);
    } while (count < repeat)
    
    await browser.close();
    return str;
};
//test commit
module.exports = bot;