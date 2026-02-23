const {readVarInt,writeVarInt} = require('./../data/varInt')
const {StatusRespone} = require('./../lib/status')
const game = require('./../server/game')

function Handshake(packet,id){
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
}

module.exports.Handshake = Handshake