const {readVarInt} = require('./../../types/Data')

const StatusRequest = {
    id: 0x00,
    c: class{
        constructor(){
            this.id = StatusRequest.id;
        }
        toHex(){
            
        }
    },
    f: function(hex){
        return new this.c()
    }
}

module.exports = StatusRequest;