
(function(modules) {
  const cache = {};

  function __require(id) {
    if (cache[id]) return cache[id].exports;

    const module = { exports: {} };
    cache[id] = module;

    modules[id](module, module.exports, __require);

    return module.exports;
  }

  __require(0);
})({

2: function(module, exports, __require) {
const SEGMENT_BITS = 0x7F;
const CONTINUE_BIT = 0x80;

function readVarInt(hexString) {
    let value = 0;
    let position = 0;
    let byteIndex = 0;

    // Convert the hex string into an array of bytes
    try{
        const bytes = hexString.match(/.{2}/g).map(byte => parseInt(byte, 16));
    
        while (true) {
            const currentByte = bytes[byteIndex];
            byteIndex++;

            // Ensure we have enough bytes in the input string
            if (currentByte === undefined) {
                throw new Error("Hex string is too short");
            }

            value |= (currentByte & SEGMENT_BITS) << position;

            if ((currentByte & CONTINUE_BIT) === 0) break;

            position += 7;

            if (position >= 32) {
                throw new Error("VarInt is too big");
            }
        }
    }catch(e){}
    return [value,byteIndex];
}


function writeVarInt(value) {
    let hexString = ''; // String to accumulate hex bytes

    while (true) {
        // If the value fits within the segment size, write the byte and stop
        if ((value & ~SEGMENT_BITS) === 0) {
            hexString += value.toString(16).padStart(2, '0'); // Convert to hex and pad to 2 characters
            return hexString;
        }

        // Otherwise, write a byte with the continuation bit set
        hexString += ((value & SEGMENT_BITS) | CONTINUE_BIT).toString(16).padStart(2, '0');

        // Unsigned right shift (shift by 7)
        value >>>= 7;
    }
}


module.exports.readVarInt = readVarInt
module.exports.writeVarInt = writeVarInt
}
,
3: function(module, exports, __require) {
const {readVarInt,writeVarInt} = __require(2)
class Packet{
    constructor(id,data){
        this.id = id
        this.data = data
        this.length = (writeVarInt(id).length+data.length)/2
    }
    toHex(){
        return writeVarInt(this.length)+writeVarInt(this.id)+this.data;
    }
}

Packet.from = (hexString)=>{
    let [l,v1] = readVarInt(hexString)
    let [id,v2] = readVarInt(hexString.slice(2*v1))
    return new Packet(id,hexString.slice(2*(v1+v2)))
}


module.exports = Packet
}
,
5: function(module, exports, __require) {
const {readVarInt,writeVarInt} = __require(2)
function TString(str){
    return writeVarInt(str.length)+
        Buffer.from(str).toString('hex')
}
function TInt(val){
    const buf = Buffer.allocUnsafe(4)
    buf.writeInt32BE(val, 0)
    return buf.toString("hex")
}
function TInt64(val) {
    const buf = Buffer.allocUnsafe(8);
    buf.writeBigUInt64BE(BigInt(val), 0);
    return buf.toString("hex");
}
function TInt16(val) {
    const buf = Buffer.allocUnsafe(2);
    buf.writeUInt16BE(val, 0);
    return buf.toString("hex");
}
function TDouble(val) {
    const buf = Buffer.allocUnsafe(8);
    buf.writeDoubleBE(val, 0);
    return buf.toString('hex');
}
function TFloat(val) {
    const buf = Buffer.allocUnsafe(4);
    buf.writeFloatBE(val, 0);
    return buf.toString('hex');
  }
function TByte(val){
    const buf = Buffer.alloc(1);
    buf.writeInt8(val, 0);
    return buf.toString("hex")
}
function PArray(arr){
    return writeVarInt(arr.length)+arr.join('');
}

module.exports.TString = TString
module.exports.TInt = TInt
module.exports.TInt64 = TInt64
module.exports.TInt16 = TInt16
module.exports.TDouble = TDouble
module.exports.TFloat = TFloat
module.exports.TByte = TByte
module.exports.PArray = PArray
}
,
7: function(module, exports, __require) {
const fs = require('fs')

try{
    const config = JSON.parse(fs.readFileSync('./config.json').toString())
    module.exports = config
}catch(e){
    console.error('Error parsing config.json')
}
}
,
6: function(module, exports, __require) {
const config = __require(7)

const game = {
    status: {
        version:{
            name: "1.21.11",
            protocol: 774
        },
        players: {
            max: 20,
            online: 0,
            sample:[]
        },
        description: {
            text: config.motd
        }
    },
    tab_list_header: "",
    tab_list_footer: "",
    last_connection_id: -1,
    connections: new Map(),
    players: [],
    seed: config.seed,
    world: null,
}

module.exports = game
}
,
4: function(module, exports, __require) {
const {readVarInt,writeVarInt} = __require(2)
const {TString} = __require(5)
const Packet = __require(3)
const game = __require(6)

function StatusRespone(packet,id){
    const str = TString(JSON.stringify(game.status))
    return [new Packet(
        0,
        str
    )]
}

function PingRespone(packet,id){
    return [packet]
}

module.exports.StatusRespone = StatusRespone
module.exports.PingRespone = PingRespone
}
,
9: function(module, exports, __require) {
const crypto = require('crypto')
const {readVarInt,writeVarInt} = __require(2)
const {TInt,TByte,TString,TDouble,TFloat} = __require(5)
const Packet = __require(3)
const game = __require(6)

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
}
,
11: function(module, exports, __require) {
const NbtTag = {
    TagCompound: function(name,arr){
        const namel = (name.length.toString(16).length % 2==0) ? name.length.toString(16) : '0'+name.length.toString(16)
        const namebuf = Buffer.from(name).toString('hex')
        return `0a00${namel}${namebuf}${arr.join('')}00`
    },
    NetCompound: function(arr){
        return `0a${arr.join('')}00`
    },
    String: function(name,str){
        const namel = (name.length.toString(16).length % 2==0) ? name.length.toString(16) : '0'+name.length.toString(16)
        const strl = (str.length.toString(16).length % 2==0) ? str.length.toString(16) : '0'+str.length.toString(16)
        const namebuf = Buffer.from(name).toString('hex')
        const strbuf = Buffer.from(str).toString('hex')
        return `0800${namel}${namebuf}00${strl}${strbuf}`
    },
    Double: function(name,val){
        const namel = (name.length.toString(16).length % 2==0) ? name.length.toString(16) : '0'+name.length.toString(16)
        const namebuf = Buffer.from(name).toString('hex')
        const buf = Buffer.allocUnsafe(8)
        buf.writeDoubleBE(val,0)
        return `0600${namel}${namebuf}${buf.toString("hex")}`
    },
    Byte: function(name,val){
        const namel = (name.length.toString(16).length % 2==0) ? name.length.toString(16) : '0'+name.length.toString(16)
        const namebuf = Buffer.from(name).toString('hex')
        return `0100${namel}${namebuf}0${val}`
    },
    Float: function(name,val){
        const namel = (name.length.toString(16).length % 2==0) ? name.length.toString(16) : '0'+name.length.toString(16)
        const namebuf = Buffer.from(name).toString('hex')
        const buf = Buffer.allocUnsafe(4)
        buf.writeFloatBE(val, 0)
        return `0500${namel}${namebuf}${buf.toString("hex")}`
    },
    Int: function(name,val){
        const namel = (name.length.toString(16).length % 2==0) ? name.length.toString(16) : '0'+name.length.toString(16)
        const namebuf = Buffer.from(name).toString('hex')
        const buf = Buffer.allocUnsafe(4)
        buf.writeInt32BE(val, 0)
        return `0300${namel}${namebuf}${buf.toString("hex")}`
    }
}

module.exports = NbtTag
}
,
10: function(module, exports, __require) {
const {readVarInt,writeVarInt} = __require(2)
const {TInt,TByte,TString,TDouble,TFloat} = __require(5)
const Packet = __require(3)
const game = __require(6)
const nbt = __require(11)

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
}
,
12: function(module, exports, __require) {
const Packet = __require(3)
const {TString} = __require(5)
const game = __require(6)

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
}
,
8: function(module, exports, __require) {
const {readVarInt,writeVarInt} = __require(2)
const {StatusRespone} = __require(4)
const {LoginSuccess,Login} = __require(9)
const {PlayerInfoUpdate} = __require(10)
const {knownPacks} = __require(12)
const Packet = __require(3)
const game = __require(6)

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

module.exports.Handshake = Handshake
module.exports.Acknowledg = Acknowledg
}
,
13: function(module, exports, __require) {
const {TInt,TByte,TString,TDouble,TFloat} = __require(5)
const {readVarInt,writeVarInt} = __require(2)
const Packet = __require(3)
const game = __require(6)
const NbtTag = __require(11)


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
}
,
14: function(module, exports, __require) {
const {TString} = __require(5)
const Packet = __require(3)
const NbtTag = __require(11)

function RegistryData(packet,id){
    return [
        new Packet( //0
            0x07,
            TString('minecraft:painting_variant')+
            '01'+
            TString('minecraft:meditative')+'00'
        ),
        new Packet( //1
            0x07,
            TString('minecraft:worldgen/biome')+
            '01'+
            TString('minecraft:plains')+'00'
        ),
        new Packet( //2
            0x07,
            TString('minecraft:damage_type')+
            '19'+
            TString('minecraft:cactus')+'00'+
            TString('minecraft:campfire')+'00'+
            TString('minecraft:cramming')+'00'+
            TString('minecraft:dragon_breath')+'00'+
            TString('minecraft:drown')+'00'+
            TString('minecraft:dry_out')+'00'+
            TString('minecraft:ender_pearl')+'00'+
            TString('minecraft:fall')+'00'+
            TString('minecraft:fly_into_wall')+'00'+
            TString('minecraft:freeze')+'00'+
            TString('minecraft:generic')+'00'+
            TString('minecraft:generic_kill')+'00'+
            TString('minecraft:hot_floor')+'00'+
            TString('minecraft:in_fire')+'00'+
            TString('minecraft:in_wall')+'00'+
            TString('minecraft:lava')+'00'+
            TString('minecraft:lightning_bolt')+'00'+
            TString('minecraft:magic')+'00'+
            TString('minecraft:on_fire')+'00'+
            TString('minecraft:out_of_world')+'00'+
            TString('minecraft:outside_border')+'00'+
            TString('minecraft:stalagmite')+'00'+
            TString('minecraft:starve')+'00'+
            TString('minecraft:sweet_berry_bush')+'00'+
            TString('minecraft:wither')+'00'
        ),
        new Packet( //3
            0x07,
            TString('minecraft:dimension_type')+
            '01'+
            TString('minecraft:overworld')+'01'+
            NbtTag.NetCompound([
                NbtTag.Double("coordinate_scale",1),
                NbtTag.Byte("has_skylight",1),
                NbtTag.Byte("has_ceiling",0),
                NbtTag.Float("ambient_light",0),
                NbtTag.Int("monster_spawn_block_light_limit",0),
                NbtTag.Int("monster_spawn_light_level",0),

                NbtTag.Int("logical_height",128),
                NbtTag.Int("min_y",0),
                NbtTag.Int("height",128),
                NbtTag.String("infiniburn","#infiniburn_overworld"),
                NbtTag.String("skybox","overworld"),
                NbtTag.String("cardinal_light","default"),
                //NbtTag.String("timelines","#minecraft:in_overworld")
            ])
        ),
        new Packet( //4
            0x07,
            TString('minecraft:frog_variant')+
            '03'+
            TString('minecraft:temperate')+'00'+
            TString('minecraft:warm')+'00'+
            TString('minecraft:cold')+'00'
        ),
        new Packet( //5
            0x07,
            TString('minecraft:chicken_variant')+
            '03'+
            TString('minecraft:temperate')+'00'+
            TString('minecraft:warm')+'00'+
            TString('minecraft:cold')+'00'
        ),
        new Packet( //6
            0x07,
            TString('minecraft:cow_variant')+
            '03'+
            TString('minecraft:temperate')+'00'+
            TString('minecraft:warm')+'00'+
            TString('minecraft:cold')+'00'
        ),
        new Packet( //7
            0x07,
            TString('minecraft:pig_variant')+
            '03'+
            TString('minecraft:temperate')+'00'+
            TString('minecraft:warm')+'00'+
            TString('minecraft:cold')+'00'
        ),
        new Packet( //8
            0x07,
            TString('minecraft:wolf_variant')+
            '01'+
            TString('minecraft:pale')+'00'
        ),
        new Packet( //9
            0x07,
            TString('minecraft:zombie_nautilus_variant')+
            '01'+
            TString('minecraft:temperate')+'00'
        ),
        new Packet( //10
            0x07,
            TString("minecraft:cat_variant") +
            '01'+
            TString("minecraft:tabby") + "00"
        ),
        new Packet( //11
            0x07,
            TString("minecraft:wolf_sound_variant") +
            '01'+
            TString("minecraft:classic") + "00"
        ),
        new Packet( //12
            0x03,
            ""
        )
    ]
}

module.exports.RegistryData = RegistryData
}
,
1: function(module, exports, __require) {
const {readVarInt,writeVarInt} = __require(2)
const Packet = __require(3)
const {PingRespone} = __require(4)
const {Handshake,Acknowledg} = __require(8)
const {ChatClientCommand,ChatClientMessage} = __require(13)
const {RegistryData} = __require(14)

const Packets = new Map(
    [
        [0,Handshake],
        [1,PingRespone],
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
}
,
15: function(module, exports, __require) {
class State{
    constructor(){
        
    }
    uuid=null
    username=null
    ProtocolVersion=null
    Intent=null
    state=""
    spawnChunksSend=false
}
module.exports = State
}
,
0: function(module, exports, __require) {
const net = require('net')
const packetHandler = __require(1)
const State = __require(15)
const game = __require(6)
const config = __require(7)

const server = net.createServer((c)=>{
    game.last_connection_id++
    const id = String(game.last_connection_id)
    game.connections.set(id,new State())
    c.on('data',d=>{
        packetHandler(c,d,id)
    })
    c.on('error',()=>{})
})

console.log('Starting the zexl server')

server.listen(config.port,config.host,()=>{
    console.log(`zexl listening on ${config.host}:${config.port}`)
})
}

});
