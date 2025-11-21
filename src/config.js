// WebSocket konfiguratsiyasi
export const WS_URL_TEMPLATE = "wss://api.tikoncha.uz/chat/ws?token={JWT}";

// WebSocket URL yaratish
export const getWebSocketUrl = (token) => {
    if (!token) {
        console.error("Token is required for WebSocket connection");
        return null;
    }

    // Agar token "Bearer " bilan boshlansa, uni olib tashlash
    const cleanToken = token.startsWith("Bearer ") ? token.substring(7) : token;

    return WS_URL_TEMPLATE.replace("{JWT}", cleanToken);
};

// Ping interval (30 soniya)
export const PING_INTERVAL = 30000;

// Reconnect settings
export const RECONNECT_DELAY = 3000;
export const MAX_RECONNECT_ATTEMPTS = 5;
