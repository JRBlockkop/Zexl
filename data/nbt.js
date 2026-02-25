const NbtTag = {
    TagCompound: function(name,arr){
        const namel = (name.length.toString(16).length % 2==0) ? name.length.toString(16) : '0'+name.length.toString(16)
        const namebuf = Buffer.from(name).toString('hex')
        return `0a00${namel}${namebuf}${arr.join('')}00`
    },
    NetCompound: function(arr){
        return `0a${arr.join('')}00`
    },
    String: function(name,str){
        const namel = (name.length.toString(16).length % 2==0) ? name.length.toString(16) : '0'+name.length.toString(16)
        const strl = (str.length.toString(16).length % 2==0) ? str.length.toString(16) : '0'+str.length.toString(16)
        const namebuf = Buffer.from(name).toString('hex')
        const strbuf = Buffer.from(str).toString('hex')
        return `0800${namel}${namebuf}00${strl}${strbuf}`
    },
    Double: function(name,val){
        const namel = (name.length.toString(16).length % 2==0) ? name.length.toString(16) : '0'+name.length.toString(16)
        const namebuf = Buffer.from(name).toString('hex')
        const buf = Buffer.allocUnsafe(8)
        buf.writeDoubleBE(val,0)
        return `0600${namel}${namebuf}${buf.toString("hex")}`
    },
    Byte: function(name,val){
        const namel = (name.length.toString(16).length % 2==0) ? name.length.toString(16) : '0'+name.length.toString(16)
        const namebuf = Buffer.from(name).toString('hex')
        return `0100${namel}${namebuf}0${val}`
    },
    Float: function(name,val){
        const namel = (name.length.toString(16).length % 2==0) ? name.length.toString(16) : '0'+name.length.toString(16)
        const namebuf = Buffer.from(name).toString('hex')
        const buf = Buffer.allocUnsafe(4)
        buf.writeFloatBE(val, 0)
        return `0500${namel}${namebuf}${buf.toString("hex")}`
    },
    Int: function(name,val){
        const namel = (name.length.toString(16).length % 2==0) ? name.length.toString(16) : '0'+name.length.toString(16)
        const namebuf = Buffer.from(name).toString('hex')
        const buf = Buffer.allocUnsafe(4)
        buf.writeInt32BE(val, 0)
        return `0300${namel}${namebuf}${buf.toString("hex")}`
    }
}

module.exports = NbtTag