const config = require('./../server/config')

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
            text: config.motd
        }
    },
    tab_list_header: "",
    tab_list_footer: "",
    last_connection_id: -1,
    connections: new Map(),
    players: [],
    seed: config.seed,
    world: null,
}

module.exports = game