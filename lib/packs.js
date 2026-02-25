const Packet = require('./../data/packet')
const {TString} = require('./../data/types')
const game = require('./../server/game')

function knownPacks(packet,id){
    game.connections.get(id).state = "configuration"
    return [
        new Packet(
            0x0E,
            '01'+TString('minecraft')+TString('core')+TString('1.21.11')
        ),
        new Packet(
            0x01,
            TString('minecraft:brand')+
            TString('Zexl')
        ),
    ]
}

module.exports.knownPacks = knownPacks