const clib = {
    handshaking: {
        'Intention': require('./handshaking/intention'),
    },
    status: {
        'StatusRequest': require('./status/status_request'),
        'PingRequest': require('./status/ping_request'),
    },
}

module.exports = clib;