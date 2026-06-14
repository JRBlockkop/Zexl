const {readVarInt} = require('./../../types/Data')

const Intention = {
    id: 0x00,
    c: class{
        constructor(ProtocolVersion,ServerAddress,ServerPort,Intent){
            this.id = Intention.id;
            this.ProtocolVersion = ProtocolVersion;
            this.ServerAddress = ServerAddress;
            this.ServerPort = ServerPort;
            this.Intent = Intent;
        }
        toHex(){
            
        }
    },
    f: function(hex){
        let mainbody = String(hex);
        let [ProtocolVersion,l1] = readVarInt(mainbody);
        mainbody = mainbody.slice(l1*2);
        let [v2,l2] = readVarInt(mainbody);
        const ServerAddress =  Buffer.from(mainbody.slice(2*l2,2*(v2+l2)),'hex').toString();mainbody = mainbody.slice(2*(v2+l2))
        const ServerPort = Number('0x'+mainbody.slice(0, 4 ));mainbody = mainbody.slice( 4 )
        let [Intent,_] = readVarInt(mainbody)
        return new this.c(ProtocolVersion,ServerAddress,ServerPort,Intent)
    }
}

module.exports = Intention;