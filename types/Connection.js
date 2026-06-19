const ConnectionState = {
    Handshaking: 'handshaking',
    Status: 'status',
    Login: 'login',
    Configuration: 'configuration',
    Play: 'play',
}

class Connection{
    constructor(c){
        this.c = c;
        this.state = ConnectionState.Handshaking;
    }
    send(data){
        console.log(data)
        this.c.write(Buffer.from(data,'hex'));
    }
    close(){
        this.c.destroy();
    }
}

module.exports.Connection = Connection;
module.exports.ConnectionState = ConnectionState;