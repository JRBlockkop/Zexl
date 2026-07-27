const {Connection,ConnectionState} = require('./../types/Connection');
const {readVarInt,writeVarInt} = require('./../types/Data')
const Packet = require('./../types/Packet');
const clib = require('./../clib/index');
const slib = require('./../slib/index');

const HandshakingPackets = {
    [clib.handshaking.Intention.id]: clib.handshaking.Intention,
}

const StatusPackets = {
    [clib.status.StatusRequest.id]: clib.status.StatusRequest,
    [clib.status.PingRequest.id]: clib.status.PingRequest,
}

function packetSlicer(hexstr){
    let list = []
    let idx=0
    let [l,v] = readVarInt(hexstr)
    list.push(hexstr.slice(idx,2*l+2))
    idx+=2*l+2
    list.push(hexstr.slice(idx))
    return list
}

function packetHandler(con,d,id){
    const hex = d.toString('hex')
    const mypackets = packetSlicer(hex)
    mypackets.forEach(myhex => {
        try{
            const packet = Packet.from(myhex)
            console.log("[Zexl]","PacketId=",packet.id);
            let data;
            switch (con.state) {
                case ConnectionState.Handshaking:
                    data = HandshakingPackets[packet.id].f(packet.data);
                    if(packet.id == clib.handshaking.Intention.id){
                        if(data.Intent == 1){
                            con.state = String(ConnectionState.Status);
                        }
                        if(data.Intent == 2){
                            con.state = String(ConnectionState.Login);
                        }
                    }
                    break;
                case ConnectionState.Status:
                    data = StatusPackets[packet.id].f(packet.data);
                    if(packet.id == clib.status.StatusRequest.id){
                        const JSONResponse = {
                            version: {
                                name: "Zexl-1.21.11",
                                protocol: 774
                            },
                            players: {
                                max: 20,
                                online: 0,
                                sample: []
                            },
                            description: {
                                text: "Hello Zexl!"
                            },
                            favicon: "data:image/png;base64,<data>",
                            enforcesSecureChat: false
                        }

                        const [id,hex] = new slib.status.StatusResponse.c(JSON.stringify(JSONResponse)).toHex()

                        con.send(   
                            new Packet(
                                id,
                                hex
                            ).toHex()
                        )
                    }
                    if(packet.id == clib.status.PingRequest.id){
                        const [id,hex] = new slib.status.PingResponse.c(data.Timestamp).toHex()

                        con.send(
                            new Packet(
                                id,
                                hex
                            ).toHex()
                        )
                    }
                    break;
                case ConnectionState.Login:
                    console.log("[Zexl]","LoginStart");
                    break;
            }
        } catch(e){con.close();console.log(e)}
    });
}

module.exports = packetHandler;