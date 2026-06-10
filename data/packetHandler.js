const {Connection,ConnectionState} = require('./../types/Connection');
const clib = require('./../clib/index');

const HandshakingPackets = {
    [clib.handshaking.Intention.id]: clib.handshaking.Intention.c, 
}

function packetHandler(con,d,id){
    if(ConnectionState.Handshaking == con.state){
        HandshakingPackets[]
    }
}

module.exports = packetHandler;