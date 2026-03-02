const {TInt,TByte,TString,TDouble,TFloat} = require('./../data/types')
const {readVarInt,writeVarInt} = require('./../data/varInt')
const Packet = require('../data/packet')
const game = require('./../server/game')
const NbtTag = require('./../data/nbt')


function ChatClientCommand(packet,id){
    const username = game.connections.get(id).username
    const [length,offset] = readVarInt(packet.data)
    const message = Buffer.from(packet.data.slice(2*offset,(offset+length)*2),"hex").toString()
    console.log(`${username}: /${message}`)
    switch (message) {
        case "restart":
            setTimeout(()=>{process.exit(11)},500)
            return [
                new Packet(
                    0x20,
                    NbtTag.NetCompound([
                        NbtTag.String("text","Restarting"),
                    ])
                )
            ]
        default:
            return ""
    }
}

function ChatClientMessage(packet,id){
    const username = game.connections.get(id).username
    const [length,offset] = readVarInt(packet.data)
    const message = Buffer.from(packet.data.slice(2*offset,(offset+length)*2),"hex").toString()
    console.log(`<${username}> ${message}`)
    return [
        new Packet(
            0x77,
            NbtTag.NetCompound([
                NbtTag.String("text",`<${username}> ${message}`),
            ])+'00'
        )
    ]
}

module.exports.ChatClientCommand = ChatClientCommand
module.exports.ChatClientMessage = ChatClientMessage