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