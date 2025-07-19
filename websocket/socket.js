const store = require('../store/store.js')
let wssGlobal= null;

function setupSockets(wss){
    wssGlobal=wss;

    wss.on('connection',(ws)=>{
        console.log('Dashboard connected');

        broadcastEvent({
            type:'user_connected',
            totalDashboards:wss.clients.size,
            connectedAt: new Date().toISOString()
        });

        ws.on('message',(message)=>{
            const msg= JSON.parse(message);
            console.log('Dashboard:',msg);

            if(msg.type === 'request_detailed_stats'){
                const filter = msg.filter || {};
                const filteredStats = store.getFilteredStats(filter);
                const filteredSessions= store.getFilteredSessions(filter);

                ws.send(JSON.stringify({
                    type:'visitor_update',
                    data:{
                        event:null,
                        stats: filteredStats
                    }
                }));

                filteredSessions.forEach((session)=>{
                    ws.send(JSON.stringify({
                        type:'session_activity',
                        data: session
                    }));
                });
            }

            if(msg.type === 'track_dashboard_action'){
                console.log('Dashboard', msg);
            }
        });

        ws.on('close',()=>{
            broadcastEvent({
                type:'user_disconnected',
                data:{
                    totalDashboards:wss.clients.size -1
                }
            });
        });
    });
}

function broadcastEvent(data){
    if(!wssGlobal) return;

    const json= JSON.stringify(data);
    wssGlobal.clients.forEach((client)=>{
        if(client.readyState === 1){
            client.send(json);
        }
    });
}

module.exports= setupSockets;
module.exports.broadcastEvent = broadcastEvent;