const {readVarInt,writeVarInt} = require('./../data/varInt')
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