// Chat API xizmatlari
const BASE_URL = ""; // Base URL bo'sh, chunki relative path ishlatamiz

/**
 * Chat history ni olish
 * @param {string} chatId - Chat ID
 * @param {string} token - Bearer token
 * @param {number} limit - Xabarlar soni (default: 50)
 * @returns {Promise<Object>} API response
 */
export const getChatHistory = async (chatId, token, limit = 50) => {
    try {
        console.log("📋 Loading chat history:", { chatId, limit });

        const url = `/chat/messages?chat_id=${encodeURIComponent(
            chatId
        )}&limit=${limit}`;

        const response = await fetch(url, {
            method: "GET",
            headers: {
                Authorization: token.startsWith("Bearer ")
                    ? token
                    : `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("✅ Chat history loaded:", data);

        return data;
    } catch (error) {
        console.error("❌ Error loading chat history:", error);
        throw error;
    }
};

/**
 * API dan kelgan xabarni Message komponenti uchun formatga o'tkazish
 * @param {Object} apiMessage - API dan kelgan xabar
 * @returns {Object} Formatted message
 */
export const formatMessageFromApi = (apiMessage) => {
    return {
        id: apiMessage.id,
        text: apiMessage.text,
        timestamp: new Date(apiMessage.created_at).toISOString(),
        isOwn: apiMessage.is_mine,
        sender: {
            id: apiMessage.sender_id,
            name: apiMessage.sender_name,
            avatar: apiMessage.sender_avatar,
        },
        type: apiMessage.type,
        attachment_url: apiMessage.attachment_url,
        reply_to_id: apiMessage.reply_to_id,
        client_msg_id: apiMessage.client_msg_id,
        is_read: apiMessage.is_read,
        edited_at: apiMessage.edited_at,
        deleted_at: apiMessage.deleted_at,
    };
};

/**
 * API xabarlar ro'yxatini formatga o'tkazish
 * @param {Array} apiMessages - API dan kelgan xabarlar
 * @returns {Array} Formatted messages
 */
export const formatMessagesFromApi = (apiMessages) => {
    if (!Array.isArray(apiMessages)) {
        console.warn("⚠️ API messages is not an array:", apiMessages);
        return [];
    }

    return apiMessages.map(formatMessageFromApi);
};
