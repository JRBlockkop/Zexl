const {readVarInt,writeVarInt} = require('./../data/varInt')
const {TInt,TByte,TString,TDouble,TFloat} = require('./../data/types')
const Packet = require('./../data/packet')
const game = require('./../server/game')

function PlayerInfoUpdate(packet,id){
    const packets = [
        new Packet(
            0x26,
            '0d'+
            TFloat(0)
        ),
        new Packet(
            0x5c,
            writeVarInt(0)+
            writeVarInt(0)
        )
    ]
    return packets;
}

module.exports.PlayerInfoUpdate = PlayerInfoUpdate