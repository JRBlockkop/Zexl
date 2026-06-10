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
        this.c.write(data);
    }
}

module.exports.Connection = Connection;
module.exports.ConnectionState = ConnectionState;