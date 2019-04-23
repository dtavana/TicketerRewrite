module.exports = {
    cleanMessages: async(clean, messages) => {
        if(clean) {
            for(let message of messages) {
                try {
                    message.delete();
                }
                catch {}
                
            }
        }  
    }
};