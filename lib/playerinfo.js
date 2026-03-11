const {readVarInt,writeVarInt} = require('./../data/varInt')
const {TInt,TByte,TString,TDouble,TFloat} = require('./../data/types')
const Packet = require('./../data/packet')
const game = require('./../server/game')
const nbt = require('./../data/nbt')

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
        ),
        new Packet(
            0x44,
            writeVarInt(0x01|0x08|0x10)+
            writeVarInt(1)+
            game.connections.get(id).uuid+
            TString(game.connections.get(id).username)+
            '00'+

            '01'+

            writeVarInt(1)
        ),
        new Packet(
            0x78,
            nbt.NetCompound([
                nbt.String("text",game.tab_list_header),
            ])+
            nbt.NetCompound([
                nbt.String("text",game.tab_list_footer),
            ])
        )
    ]
    return packets;
}

module.exports.PlayerInfoUpdate = PlayerInfoUpdate