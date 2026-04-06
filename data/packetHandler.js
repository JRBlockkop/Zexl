const {readVarInt,writeVarInt} = require('./../data/varInt')
const Packet = require('./../data/packet')
const {PingRespone} = require('./../lib/status')
const {Handshake,Acknowledg,PluginChannels} = require('./../lib/filter')
const {ChatClientCommand,ChatClientMessage} = require('./../lib/chat')
const {RegistryData} = require('./../lib/registrydata')

const Packets = new Map(
    [
        [0,Handshake],
        [1,PingRespone],
        [2,PluginChannels],
        [3,Acknowledg],
        [6,ChatClientCommand],
        [7,RegistryData],
        [8,ChatClientMessage],
        [12,()=>{return ""}], // TickEnd

        [29,()=>{return ""}], // move_player_pos
        [30,()=>{return ""}], // move_player_pos_rot
        [31,()=>{return ""}], // move_player_rot
    ]
)

function packetSlicer(hexstr){
    let list = []
    let idx=0
    let [l,v] = readVarInt(hexstr)
    list.push(hexstr.slice(idx,2*l+2))
    idx+=2*l+2
    list.push(hexstr.slice(idx))
    return list
}

function packetHandler(c,d,id){
    const hex = d.toString('hex')
    const mypackets = packetSlicer(hex)
    mypackets.forEach(myhex => {
    const mypacket = Packet.from(myhex)
        if(Packets.has(mypacket.id)){
            const responePackets = Packets.get(mypacket.id)(mypacket,id)
            if(responePackets!=""){
                responePackets.forEach((pack,i)=>{
                    c.write(
                        Buffer.from(
                            pack.toHex(),
                            'hex'
                        )
                    )
                })
            }
        }else{
            console.log(`Unkown packet: ${mypacket.id}`)
        }
    });
}
module.exports = packetHandler