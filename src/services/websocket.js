import {
    getWebSocketUrl,
    PING_INTERVAL,
    RECONNECT_DELAY,
    MAX_RECONNECT_ATTEMPTS,
} from "../config";

class WebSocketService {
    constructor() {
        this.ws = null;
        this.listeners = new Map();
        this.reconnectAttempts = 0;
        this.pingInterval = null;
        this.isConnected = false;
        this.shouldReconnect = true;
    }

    connect(token) {
        // If already connected, return existing connection
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            console.log("Already connected, reusing connection");
            return Promise.resolve();
        }

        // Close existing connection if any
        if (this.ws) {
            this.ws.close();
        }

        return new Promise((resolve, reject) => {
            try {
                const url = getWebSocketUrl(token);
                this.ws = new WebSocket(url);

                this.ws.onopen = () => {
                    console.log("WebSocket connected");
                    this.isConnected = true;
                    this.reconnectAttempts = 0;
                    this.startPing();
                    this.emit("connection_status", { connected: true });
                    resolve();
                };

                this.ws.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event.data);
                        console.log("📨 Received:", data);

                        // Emit event based on type
                        if (data.type) {
                            console.log(`🎯 Emitting event: ${data.type}`);
                            this.emit(data.type, data);
                        }

                        // Emit general message event
                        this.emit("message", data);
                    } catch (error) {
                        console.error("Error parsing message:", error);
                    }
                };

                this.ws.onerror = (error) => {
                    console.error("WebSocket error:", error);
                    this.emit("error", error);
                    reject(error);
                };

                this.ws.onclose = (event) => {
                    console.log("WebSocket disconnected", {
                        code: event.code,
                        reason: event.reason,
                        wasClean: event.wasClean,
                    });
                    this.isConnected = false;
                    this.stopPing();
                    this.emit("connection_status", { connected: false });

                    if (
                        this.shouldReconnect &&
                        this.reconnectAttempts < MAX_RECONNECT_ATTEMPTS
                    ) {
                        this.reconnect(token);
                    }
                };
            } catch (error) {
                reject(error);
            }
        });
    }

    reconnect(token) {
        this.reconnectAttempts++;
        console.log(
            `Reconnecting... Attempt ${this.reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS}`
        );

        setTimeout(() => {
            this.connect(token).catch(console.error);
        }, RECONNECT_DELAY);
    }

    disconnect() {
        this.shouldReconnect = false;
        this.stopPing();
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }

    startPing() {
        this.stopPing();
        this.pingInterval = setInterval(() => {
            this.send({ type: "ping", payload: {} });
        }, PING_INTERVAL);
    }

    stopPing() {
        if (this.pingInterval) {
            clearInterval(this.pingInterval);
            this.pingInterval = null;
        }
    }

    send(data) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(data));
            console.log("📤 Sent:", data);
            return true;
        } else {
            console.error("❌ WebSocket is not connected");
            return false;
        }
    }

    // Event listener methods
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    off(event, callback) {
        if (this.listeners.has(event)) {
            const callbacks = this.listeners.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    emit(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach((callback) => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in ${event} listener:`, error);
                }
            });
        }
    }

    // Message operations
    sendMessage(
        chatId,
        text,
        type = "TEXT",
        attachmentUrl = null,
        clientMsgId = null
    ) {
        const payload = {
            chat_id: chatId,
            type,
            text,
        };

        if (attachmentUrl) {
            payload.attachment_url = attachmentUrl;
        }

        if (clientMsgId) {
            payload.client_msg_id = clientMsgId;
        }

        return this.send({
            type: "send_message",
            payload,
        });
    }

    editMessage(messageId, text) {
        return this.send({
            type: "edit_message",
            payload: {
                message_id: messageId,
                text,
            },
        });
    }

    markAsRead(chatId, messageId) {
        return this.send({
            type: "read",
            payload: {
                chat_id: chatId,
                message_id: messageId,
            },
        });
    }

    markAsUnread(chatId, messageId) {
        return this.send({
            type: "unread",
            payload: {
                chat_id: chatId,
                message_id: messageId,
            },
        });
    }
}

// Singleton instance
const wsService = new WebSocketService();
export default wsService;
