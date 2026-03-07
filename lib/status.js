const {readVarInt,writeVarInt} = require('./../data/varInt')
const {TString} = require('./../data/types')
const Packet = require('./../data/packet')
const game = require('./../server/game')

function StatusRespone(packet,id){
    const str = TString(JSON.stringify(game.status))
    return [new Packet(
        0x00,
        str
    )]
}

function PingRespone(packet,id){
    return [packet]
}

module.exports.StatusRespone = StatusRespone

module.exports.PingRespone = PingRespone
