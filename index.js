/**
 * Eksi-Debe-Api
 */

const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const jsdom = require('jsdom');
const loading =  require('loading-cli');
const PORT = 3000;
const app = express();

const eksiBaseUrl = 'https://eksisozluk.com';


/**
 * Endpoint to fetch debe datas of SourTimes/ekSi
 */
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
                res.send(debes);
                getDebeEntriesWithDetails(debes);
            }
        });
    
    });

})

function getDebeEntriesWithDetails(debeMetaLogs){
    
    console.log(debeMetaLogs);

    if(debeMetaLogs.length > 0){

        debeMetaLogs.forEach((debeMetaLog, index) => {
            setTimeout(() => {
                console.log(debeMetaLog.title);
                axios.get(eksiBaseUrl+debeMetaLog.uri).then((response) => {
                    debeHtml = response.data;

                    /**
                     * @todo Burada eristigimiz html icerikteki author, content, saat bilgilerini bir ustteki debeMetaLogs
                     * degiskeniyle merge edip dongu sonunda genel bir debe JSON verini hazirlamayi hedefliyoruz
                     */
                    console.log(debeHtml);
                    let debe = cheerio.load(debeHtml);

                    // let debeContent = {};
                    // debeContent.entry = debe.find('.content-expanded').text();
                    // debeContent.author = debe.find('a.entry-author').text();

                })
            }, 7000*index)
        })

    }
}

app.listen(PORT, () => {
    const load = loading(`ekSi-Debe Running.. Port: ${PORT}`).start()
})