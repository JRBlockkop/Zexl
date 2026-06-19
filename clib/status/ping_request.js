const {readVarInt} = require('./../../types/Data')

const PingRequest = {
    id: 0x01,
    c: class{
        constructor(Timestamp){
            this.id = PingRequest.id;
            this.Timestamp = Timestamp;
        }
        toHex(){
            
        }
    },
    f: function(hex){
        return new this.c(hex)
    }
}

module.exports = PingRequest;