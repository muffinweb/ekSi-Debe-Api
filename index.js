/**
 * Eksi-Debe-Api
 */

const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const jsdom = require('jsdom');
const PORT = 3000;
const app = express();

app.get('/debe', (req,res) => {

    /** Get Debe Content */
    axios.get('https://eksisozluk.com/debe').then((response) => {

        //Request Response <xml/html>
        const html = response.data;

        //Load xml/Html content to cheerio instance
        const $ = cheerio.load(html);

        //Array that debes are detected
        let debes = [];

        //Detected Debes Length
        let debesLength = $('nav#partial-index ul li').length;

        //Get Essential data in loop
        $('nav#partial-index ul li').each((i, elem) => {
            let debe = {};
            debe.title = $(elem).find('span').text();
            debe.uri = $(elem).find('a').attr('href');
            debes.push(debe);

            if(i == (debesLength-1)){
                console.log(debes);
                res.send(debes);
            }
        });
    
    });

})

app.listen(PORT, () => {
    console.log('ek$i-Debe-API is runningx');
})