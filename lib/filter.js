const {readVarInt,writeVarInt} = require('./../data/varInt')
const {StatusRespone} = require('./../lib/status')
const {LoginSuccess,LoginPluginResponse,Login} = require('./../lib/login')
const {PlayerInfoUpdate} = require('./../lib/playerinfo')
const {knownPacks} = require('./../lib/packs')
const Packet = require('./../data/packet')
const game = require('./../server/game')

function Handshake(packet,id){
    if(game.connections.get(id).state==""){
        switch (packet.data[packet.data.length-2]+packet.data[packet.data.length-1]) {
            case "01":
                return StatusRespone(packet,id)
            case "02":
            case "03":
                game.connections.get(id).state = "login"
                return ""
            default:
                return ""
        }
    }else if(game.connections.get(id).state=="login" && packet.data.length>32){
        return LoginSuccess(packet,id)
    }else if(game.connections.get(id).state=="play"){
        return PlayerInfoUpdate(packet,id)
    }else{
        return ""
    }
}

function Acknowledg(packet,id){
    if(game.connections.get(id).state=="login"){
        return knownPacks(packet,id)
    }else if(game.connections.get(id).state=="configuration"){
        return Login(packet,id)
    }
}

function PluginChannels(packet,id){
    if(game.connections.get(id).state=="login"){
        return LoginPluginResponse(packet,id)
    }else{
        return ""
    }
}

module.exports.Handshake = Handshake
module.exports.Acknowledg = Acknowledg
module.exports.PluginChannels = PluginChannels