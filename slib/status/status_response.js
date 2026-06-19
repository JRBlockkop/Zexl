const {readVarInt,TString} = require('./../../types/Data')

const StatusResponse = {
    id: 0x00,
    c: class{
        constructor(JSONResponse){
            this.id = StatusResponse.id;
            this.JSONResponse = JSONResponse;
        }
        toHex(){
            return [
                this.id,
                TString(this.JSONResponse),
            ]
        }
    },
    f: function(hex){
        let mainbody = String(hex);
        let [v1,l1] = readVarInt(mainbody);
        const JSONResponse =  Buffer.from(mainbody.slice(2*l1,2*(v1+l1)),'hex').toString();mainbody = mainbody.slice(2*(v1+l1))
        return new this.c(JSONResponse)
    }
}

module.exports = StatusResponse;