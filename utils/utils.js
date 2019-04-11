module.exports = {
    cleanMessages: async(clean, messages) => {
        if(clean) {
            for(let message of messages) {
                message.delete();
            }
        }  
    }
}