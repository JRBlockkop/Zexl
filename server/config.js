const fs = require('fs')

try{
    const config = JSON.parse(fs.readFileSync('./config.json').toString())
    module.exports = config
}catch(e){
    console.error('Error parsing config.json')
}