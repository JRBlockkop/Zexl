
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
6: function(module, exports, __require) {
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
            text: "Hello zexl!"
        }
    },
    last_connection_id: -1,
    connections: new Map(),
    players: [],
    seed: 0,
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
7: function(module, exports, __require) {
const {readVarInt,writeVarInt} = __require(2)
const {StatusRespone} = __require(4)
const game = __require(6)

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
}
,
1: function(module, exports, __require) {
const {readVarInt,writeVarInt} = __require(2)
const Packet = __require(3)
const {PingRespone} = __require(4)
const {Handshake} = __require(7)

const Packets = new Map(
    [
        [0,Handshake],
        [1,PingRespone]
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
8: function(module, exports, __require) {
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
const State = __require(8)
const game = __require(6)

const HOST = '0.0.0.0'
const PORT = 25565

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

server.listen(PORT,HOST,()=>{
    console.log(`zexl listening on ${HOST}:${PORT}`)
})
}

});
