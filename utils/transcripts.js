const fs = require('fs');
require('dotenv').config();

module.exports = {
    createTranscript: async(guild, ticketName, messageHistory) => {
        let fileName = `${guild.id}_${ticketName}.html`;
        let filePath = process.env.TICKET_DIR + fileName;
        let header = "<!DOCTYPE html>\n<html>\n<title>Ticketer Transcript</title>\n<head>\n<style type='text/css'>\nbody { background-color: #36393F; }\n.container { color: white; border: 2px solid #B03B3F; background-color: #2F3136; border-radius: 5px; padding: 20px; margin: 10px 0; }\n.edited { background-color: #f49b42; }\n.deleted { background-color: #8c2424; }\n.darker { border-color: #ccc; background-color: #ddd; }\n.container::after { content: \"\"; clear: both; display: table; }\n.container img { float: left; max-width: 60px; width: 100%; margin-right: 20px; border-radius: 50%; }\n.container img.right { float: right; margin-left: 20px; margin-right: 0; }\n.time-right { color: white !important; float: right; color: #aaa; }\n.time-left { color: white !important; float: left; color: #999; }\n</style>\n</head>\n<body>";
        let data = header;
        let skip = 0;
        messageHistory.forEach(message => {
            if(skip < 2) {
                skip++;
                return;
            }
            if(message.system) return;
            if(message.embeds.length > 0) {
                data += `<div class='container'> ${message.author.tag} <img src ='${message.author.avatarURL()}' alt='Missing Avatar'> <p>**EMBED**</p> <span class='time-right'>${message.createdAt.toUTCString()} UTC</span></div>`;
            }
            else {
                data += `<div class='container'> ${message.author.tag} <img src ='${message.author.avatarURL()}' alt='Missing Avatar'> <p>${message.cleanContent}</p> <span class='time-right'>${message.createdAt.toUTCString()} UTC</span></div>`;
            }
        });
        data += "</body>\n</html>";
        await fs.writeFile(filePath, data, (err) => {
            if(err) console.log(err);
        }); 
        return filePath;
    },
    deleteTranscript: async(filePath) => {
        await fs.unlink(filePath, (err) => { if(err) console.log(err); });
    }
}
