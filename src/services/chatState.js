// Track active conversation globally to prevent duplicate notifications
let activeConversationId = null;

export const setActiveConversation = (id) => { 
    activeConversationId = id; 
};

export const getActiveConversation = () => activeConversationId;
