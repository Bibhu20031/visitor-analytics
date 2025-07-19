const sessions = {};

const stats = {
    totalToday:0,
    totalActive:0,
    pagesVisited:{}
};

function addEvent(event){
    const {sessionId, page, type, timestamp, country} = event;

    if(!sessions[sessionId]){
        stats.totalToday+=1;
        stats.totalActive+=1;
        sessions[sessionId]= {
            journey:[],
            country,
            startTime:timestamp,
            lastSeen: timestamp
        };
    }

    if(type === 'pageview'){
        sessions[sessionId].journey.push(page);
        sessions[sessionId].lastSeen = timestamp;

        if(!stats.pagesVisited[page]){
            stats.pagesVisited[page] = 0;
            stats.pagesVisited[page]++;
        }

        if(type === 'session_end'){
            delete sessions[sessionId];
            stats.totalActive= Math.max(stats.totalActive-1,0);
        }
    }
}

function getStats(){
    return{
        totalToday: stats.totalToday,
        totalActive: stats.totalActive,
        pagesVisited: stats.pagesVisited
    };
}

function getSessions(){
    return Object.entries(sessions).map(([sessionId, session]) =>({
        sessionId,
        currentPage: session.journey[session.journey.length - 1],
        journey:session.journey,
        duration: Math.floor( (new Date (session.lastSeen) - new Date(session.startTime))/1000).toFixed(1),
        country:session.country
    }));
}

module.exports={
    addEvent,
    getStats,
    getSessions
};