const net = require('net');
const packetHandler = require('./../data/packetHandler');
const {Connection} = require('./../types/Connection');
const game = require('./../server/game');
const config = require('./../server/config');

const server = net.createServer((c)=>{
    game.last_connection_id++
    const id = String(game.last_connection_id)
    const con = new Connection(c);
    game.connections.set(id,con);
    c.on('data',d=>{
        packetHandler(con,d,id);
    })
    c.on('error',()=>{})
})

server.listen(config.port,config.host,()=>{
    console.log(`Zexl listening on ${config.host}:${config.port}`)
})