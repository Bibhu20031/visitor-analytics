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

function getFilteredStats(filter) {
  const pagesVisited = {};
  let totalToday = 0;
  let activeCount = 0;

  Object.values(sessions).forEach((session) => {
    const lastSeenDate = new Date(session.lastSeen).toDateString();
    const today = new Date().toDateString();

    const matchCountry = !filter.country || session.country === filter.country;
    const matchPage = !filter.page || session.journey.includes(filter.page);

    if (matchCountry && matchPage) {
      if (lastSeenDate === today) totalToday++;
      activeCount++;

      session.journey.forEach((p) => {
        if (!filter.page || p === filter.page) {
          pagesVisited[p] = (pagesVisited[p] || 0) + 1;
        }
      });
    }
  });

  return {
    totalActive: activeCount,
    totalToday,
    pagesVisited
  };
}

function getFilteredSessions(filter) {
  return Object.entries(sessions)
    .filter(([_, session]) => {
      const matchCountry = !filter.country || session.country === filter.country;
      const matchPage = !filter.page || session.journey.includes(filter.page);
      return matchCountry && matchPage;
    })
    .map(([sessionId, session]) => ({
      sessionId,
      currentPage: session.journey[session.journey.length - 1],
      journey: session.journey,
      duration: Number(((new Date(session.lastSeen) - new Date(session.startTime)) / 1000).toFixed(1)),
      country: session.country
    }));
}

module.exports={
    addEvent,
    getStats,
    getSessions,
    getFilteredStats,
    getFilteredSessions
};