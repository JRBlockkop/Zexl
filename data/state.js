class State{
    constructor(c){
        this.c = c;
    }
    ip=null
    uuid=null
    username=null
    ProtocolVersion=null
    Intent=null
    state=""
    spawnChunksSend=false
}
module.exports = State