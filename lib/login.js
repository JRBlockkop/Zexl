const crypto = require('crypto')
const {readVarInt,writeVarInt} = require('./../data/varInt')
const {TInt,TByte,TString,TDouble,TFloat} = require('./../data/types')
const Packet = require('./../data/packet')
const config = require('./../server/config')
const game = require('./../server/game')

function LoginSuccess(packet,id){
    game.connections.get(id).username = Buffer.from(packet.data.slice(2,packet.data.length-32),"hex").toString()
    game.connections.get(id).uuid = packet.data.slice(packet.data.length-32)
    console.log()
    if(config.velocity.enabled){
        return [new Packet(
            0x04,
            writeVarInt(6)+ //random numbers
            TString('velocity:player_info')+
            '02'
        )]
    }else{
        return [new Packet(
            0x02,
            `${packet.data.slice(packet.data.length-32)}${packet.data.slice(0,packet.data.length-32)}00`
        )]
    }
}

function LoginPluginResponse(packet,id){
    console.log([packet.data])
    let [v1,l1] = readVarInt(packet.data)
    let mainbody = packet.data.slice(l1*2+2)
    const hmac = mainbody.slice(0, 64 );mainbody = mainbody.slice( 64 +2)
    const data = mainbody;
    let [v2,l2] = readVarInt(mainbody)
    const ip = mainbody.slice(2*l2, 2*(v2+l2) );mainbody = mainbody.slice( 2*(v2+l2) )
    const uuid = mainbody.slice(0, 32 );mainbody = mainbody.slice( 32 )
    let [v3,l3] = readVarInt(mainbody)
    const name = mainbody.slice(2*l3, 2*(v3+l3) );mainbody = mainbody.slice( 2*(v3+l3))

    let key,value;

    if(mainbody.slice(0,2)=="01"){
        mainbody = mainbody.slice( 2 );
        let [v4,l4] = readVarInt(mainbody)
        key = mainbody.slice(2*l4, 2*(v4+l4) );mainbody = mainbody.slice( 2*(v4+l4) )
        let [v5,l5] = readVarInt(mainbody)
        value = mainbody.slice(2*l5, 2*(v5+l5) );mainbody = mainbody.slice( 2*(v5+l5) )

        let gameprofile = JSON.parse(atob(Buffer.from(value, 'hex')))
        console.log(gameprofile)
    }

    game.connections.get(id).ip = Buffer.from(name,'hex').toString();
    game.connections.get(id).username = Buffer.from(name,'hex').toString();
    game.connections.get(id).uuid = uuid;

    return [new Packet(
        0x02,
        `${game.connections.get(id).uuid}${TString(game.connections.get(id).username)}01${TString('textures')}${TString(Buffer.from(value, 'hex'))}00`
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
module.exports.LoginPluginResponse = LoginPluginResponse
module.exports.Login = Login