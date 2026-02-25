const crypto = require('crypto')
const {readVarInt,writeVarInt} = require('./../data/varInt')
const {TInt,TByte,TString,TDouble,TFloat} = require('./../data/types')
const Packet = require('./../data/packet')
const game = require('./../server/game')

function LoginSuccess(packet,id){
    game.connections.get(id).username = Buffer.from(packet.data.slice(2,packet.data.length-32),"hex").toString()
    game.connections.get(id).uuid = packet.data.slice(packet.data.length-32)
    return [new Packet(
        0x02,
        `${packet.data.slice(packet.data.length-32)}${packet.data.slice(0,packet.data.length-32)}00`
    )]
}
function Login(packet,id){
    game.connections.get(id).state = "play"
    const hash = crypto.createHash("sha256")
    hash.update(Buffer.from(TInt(game.seed),"hex"))
    return [
        new Packet(
            0x30,
            TInt(52)+
            '00'+
            '01'+TString('minecraft:overworld')+
            writeVarInt(game.status.players.max)+
            writeVarInt(5)+
            writeVarInt(3)+
            '00'+
            '01'+
            '00'+
            writeVarInt(0)+
            TString('minecraft:overworld')+
            hash.digest("hex").slice(0,16)+
            '01'+
            TByte(-1)+
            '00'+
            '00'+
            '00'+
            writeVarInt(0)+
            writeVarInt(63)+
            '00'
        ),
        new Packet(
            0x46,
            writeVarInt(11)+
            TDouble(0)+
            TDouble(128)+
            TDouble(0)+

            TDouble(0)+
            TDouble(0)+
            TDouble(0)+

            TFloat(0)+
            TFloat(0)+
            
            '00000000'
        )
    ]
}

module.exports.LoginSuccess = LoginSuccess
module.exports.Login = Login