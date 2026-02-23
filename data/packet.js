const {readVarInt,writeVarInt} = require('./../data/varInt')
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