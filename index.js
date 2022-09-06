/**
 * Eksi-Debe-Api
 */

const axios = require('axios');
const cheerio = require('cheerio');
const loading =  require('loading-cli');
const fs = require('fs');

const { getYesterday } = require('./yesterday');

const tooMuchRequestPreventerInterval = 7000;

//An Counter to fetch entries one by one
let dispatchIndex = 0;

const eksiBaseUrl = 'https://eksisozluk.com';


/**
 * Endpoint to fetch debe datas of SourTimes/ekSi
 */

(async function(){
    const loading = loading('ek$i-Debe Data is scanning..').start();
    let result = prepareDebes();
    loading.succeed(result);
})()

/** Get Debe Content */

async function prepareDebes(){
    return new Promise((resolve, reject) => {
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
                    getDebeEntriesWithDetailsDispatch(debes, resolve)
                }
            });

        });
    })
}

async function getDebeEntriesWithDetailsDispatch(debeMetaLogs, resolve){
    
    console.log(debeMetaLogs);

    if(debeMetaLogs.length > 0){
        getDebeEntriesWithDetailsAction(debeMetaLogs, resolve);
    }
}

async function getDebeEntriesWithDetailsAction(debeMetaLogs, resolve){
    if(debeMetaLogs.length == dispatchIndex){

        fs.writeFile(getYesterday(), JSON.stringify(debeMetaLogs), function(err){

            if(err){
                console.error("Error occured while DebeLog creating..\n");
                console.log(err);
            }else{
                resolve("Debelog successfully created");
            }

        })

    }else{
        setTimeout(() => {


            axios.get(eksiBaseUrl+debeMetaLogs[dispatchIndex].uri).then((response) => {
                debeHtml = response.data;
        
                /**
                 * @todo Burada eristigimiz html icerikteki author, content, saat bilgilerini bir ustteki debeMetaLogs
                 * degiskeniyle merge edip dongu sonunda genel bir debe JSON verini hazirlamayi hedefliyoruz
                 */
                
                let debeCheerio = cheerio.load(debeHtml);
                //console.log(debeCheerio);

                //Burada tekil DEBE icerigini degiskenlere atayip akabinde
                // debeMetaLogs'un ilgili indisine uyguluyoruz

                let debeEntry = {};
                let entryContent = debeCheerio('.content').text();
                let author = debeCheerio('.entry-author').text(); 
                let date = debeCheerio('.entry-date').text();
                let entryId = debeCheerio('li[data-author]').attr('data-id');
                let favoriteCount = debeCheerio('li[data-author]').attr('data-favorite-count');

                debeEntry.entryContent = entryContent;
                debeEntry.author = author;
                debeEntry.date = date;
                debeEntry.entryId = entryId;
                debeEntry.favoriteCount = favoriteCount;

                Object.assign(debeMetaLogs[dispatchIndex], debeEntry);

                dispatchIndex++;

                //Recursive
                getDebeEntriesWithDetailsAction(debeMetaLogs);

            })
        }, tooMuchRequestPreventerInterval)
    }
}