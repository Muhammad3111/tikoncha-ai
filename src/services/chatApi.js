// Chat API xizmatlari
const BASE_URL = "https://api.tikoncha.uz"; // Tikoncha API base URL

/**
 * Chat history ni olish
 * @param {string} chatId - Chat ID
 * @param {string} token - Bearer token
 * @param {number} limit - Xabarlar soni (default: 50)
 * @returns {Promise<Object>} API response
 */
export const getChatHistory = async (chatId, token, limit = 50) => {
    try {
        const url = `${BASE_URL}/chat/messages?chat_id=${encodeURIComponent(
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

        return data;
    } catch (error) {
        console.error("❌ Error loading chat history:", error);
        throw error;
    }
};

/**
 * API dan kelgan xabarni React komponentlar uchun formatga o'tkazish
 * @param {Object} apiMessage - API dan kelgan xabar
 * @returns {Object} React komponent uchun format
 */
export const formatMessageFromApi = (apiMessage) => {
    // sender_name ga qarab message positioning
    const isBot = apiMessage.sender_name === "bot";

    return {
        id: apiMessage.id,
        text: apiMessage.text,
        created_at: apiMessage.created_at,
        isLoading: false,
        isOptimistic: false,
        // Bot bo'lsa chap tomonda (isOwn: false), aks holda o'ng tomonda (isOwn: true)
        isOwn: !isBot,
        sender_name: apiMessage.sender_name,
        sender_avatar: apiMessage.sender_avatar,
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
