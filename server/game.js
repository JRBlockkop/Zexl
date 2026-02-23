const game = {
    status: {
        version:{
            name: "1.21.11",
            protocol: 774
        },
        players: {
            max: 20,
            online: 0,
            sample:[]
        },
        description: {
            text: "Hello zexl!"
        }
    },
    last_connection_id: -1,
    connections: new Map(),
    players: [],
    seed: 0,
    world: null,
}

module.exports = game