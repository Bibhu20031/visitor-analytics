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

            //todo
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