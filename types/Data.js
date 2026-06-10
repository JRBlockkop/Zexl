const SEGMENT_BITS = 0x7F;
const CONTINUE_BIT = 0x80;

function readVarInt(hexString) {
    let value = 0;
    let position = 0;
    let byteIndex = 0;

    try{
        const bytes = hexString.match(/.{2}/g).map(byte => parseInt(byte, 16));
    
        while (true) {
            const currentByte = bytes[byteIndex];
            byteIndex++;

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
    let hexString = '';

    while (true) {
        if ((value & ~SEGMENT_BITS) === 0) {
            hexString += value.toString(16).padStart(2, '0'); // Convert to hex and pad to 2 characters
            return hexString;
        }

        hexString += ((value & SEGMENT_BITS) | CONTINUE_BIT).toString(16).padStart(2, '0');

        value >>>= 7;
    }
}

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

module.exports.readVarInt = readVarInt;
module.exports.writeVarInt = writeVarInt;
module.exports.TString = TString;
module.exports.TInt = TInt;
module.exports.TInt64 = TInt64;
module.exports.TInt16 = TInt16;
module.exports.TDouble = TDouble;
module.exports.TFloat = TFloat;
module.exports.TByte = TByte;
module.exports.PArray = PArray;