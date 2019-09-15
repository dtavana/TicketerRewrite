const config = require('../config.json');

const configToProcess = () => {
    for(let entry of Object.entries(config)) {
        console.log(`Assigning process.env.${entry[0]} to ${entry[1]}`);
        process.env[entry[0]] = entry[1];
    }
};

module.exports = configToProcess();