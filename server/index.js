const net = require('net')
const packetHandler = require('./../data/packetHandler')
const State = require('./../data/state')
const game = require('./../server/game')
const config = require('./../server/config')

const server = net.createServer((c)=>{
    game.last_connection_id++
    const id = String(game.last_connection_id)
    game.connections.set(id,new State())
    c.on('data',d=>{
        packetHandler(c,d,id)
    })
    c.on('error',()=>{})
})

console.log('Starting the zexl server')

server.listen(config.port,config.host,()=>{
    console.log(`zexl listening on ${config.host}:${config.port}`)
})