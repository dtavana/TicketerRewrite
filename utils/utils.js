module.exports = {
    cleanMessages: async(cleanmessages) => {
        if(clean) {
            for(let message of messages) {
                message.delete();
            }
        }  
    }
}