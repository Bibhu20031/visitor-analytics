const store = require('../store/store.js');

const {broadcastEvent} = require('../websocket/socket.js');

exports.handleEvent = (req,res)=>{
    const event = req.body;
    if(!event || !event.sessionId || !event.type || !event.timestamp || !event.page){
        return res.status(400).json({message: 'Invalid event format'});
    }

    store.addEvent(event);

    broadcastEvent({
        type:'visiter_update',
        data:{
            event,
            stats:store.getStats()
        }
    });

    broadcastEvent({
        type:'session_activity',
        data:{
            sessionId: event.sessionId,
            currentPage: event.page,
            journey:store.getSessions().find(s=> s.sessionId === event.sessionId)?.journey || [],
            duration:store.getSessions().find(s=> s.sessionId === event.sessionId)?.duration || 0
        }
    });

    res.status(200).json({message:"Event received and processed"});
};

exports.getSummary=(req,res)=>{
    res.status(200).json(store.getStats());
};

exports.getSessions= (req,res)=>{
    res.status(200).json(store.getSessions());
}