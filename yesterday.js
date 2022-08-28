const getYesterday = function getYesterday(){
    let todayTimeStamp = new Date().valueOf();
    todayTimeStamp = todayTimeStamp;
    yesterdayTimestamp = todayTimeStamp - ((60*60*24)*1000);
    yesterdaySQLFormat = new Date(yesterdayTimestamp).toISOString().slice(0,10).replace('T', ' ');
    return yesterdaySQLFormat + '.json';
}

module.exports = {
    getYesterday: getYesterday
}