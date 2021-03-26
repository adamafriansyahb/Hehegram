const moment = require('moment');

const formatMessage = (username, text) => {
    return {
        username,
        text,
        time: moment().format('HH:mm')
    }
}

module.exports = formatMessage;