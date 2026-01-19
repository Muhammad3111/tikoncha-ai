import { useState, useEffect, useCallback, useRef } from "react";
import { flushSync } from "react-dom";
import wsService from "../services/websocket";

export const useWebSocket = (token, chatId) => {
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [messages, setMessages] = useState([]);
    const [streamingMessage, setStreamingMessage] = useState(null);
    const [error, setError] = useState(null);
    const [isSending, setIsSending] = useState(false);

    const streamBufferRef = useRef("");
    const currentStreamIdRef = useRef(null);
    const pendingMessageIdRef = useRef(null);
    const pendingChatIdRef = useRef(null);
    const sendTimeoutRef = useRef(null);
    const isStreamingRef = useRef(false);
    const streamTimeoutRef = useRef(null);
    const currentChatIdRef = useRef(chatId);

    useEffect(() => {
        currentChatIdRef.current = chatId;
    }, [chatId]);

    useEffect(() => {
        if (!token || token === "") {
            setError("Iltimos sizda kirish malumotlari borligini tekshiring");
            return;
        }

        // Connection status listener
        const handleConnectionStatus = ({ connected }) => {
            setIsConnected(connected);
            setIsConnecting(false); // Stop connecting when status changes
            if (!connected) {
                setError(null); // Remove toast error
            } else {
                setError(null);
            }
        };

        // Pong listener
        const handlePong = () => {};

        const isMessageForCurrentChat = (message) => {
            const messageChatId = message?.chat_id || message?.chatId;
            const currentChatId = currentChatIdRef.current;
            if (
                messageChatId &&
                currentChatId &&
                messageChatId !== currentChatId
            ) {
                return false;
            }
            return true;
        };

        // Pending final message - streaming tugaguncha saqlab turish
        const pendingFinalMessageRef = { current: null };

        // Message created listener
        const handleMessageCreated = ({ data }) => {
            const message = data.message;

            if (!isMessageForCurrentChat(message)) {
                return;
            }

            // Bot xabari kelganda streaming ni to'xtatish
            if (!message.is_mine) {
                // Streaming ni tozalash
                streamBufferRef.current = "";
                setStreamingMessage(null);
                isStreamingRef.current = false;

                // Loading o'chirish
                setIsSending(false);
                pendingMessageIdRef.current = null;
                pendingChatIdRef.current = null;

                if (sendTimeoutRef.current) {
                    clearTimeout(sendTimeoutRef.current);
                    sendTimeoutRef.current = null;
                }
            }

            // Xabarni qo'shish
            setMessages((prev) => {
                const filtered = prev.filter((m) => !m.isOptimistic);
                const exists = filtered.some((m) => m.id === message.id);
                if (exists) {
                    return filtered.map((m) =>
                        m.id === message.id ? message : m,
                    );
                }
                return [...filtered, message];
            });
        };

        // Message stream listener (bot responses)
        const handleMessageStream = ({ data }) => {
            const currentChatId = currentChatIdRef.current;
            const pendingChatId = pendingChatIdRef.current;
            if (
                !pendingChatId ||
                !currentChatId ||
                pendingChatId !== currentChatId
            ) {
                return;
            }

            const delta = data.delta;

            // Agar yangi streaming boshlanayotgan bo'lsa, bufferni tozalash
            if (!isStreamingRef.current) {
                streamBufferRef.current = "";
                isStreamingRef.current = true;
            }

            // Deltani bufferga qo'shish
            streamBufferRef.current += delta;

            // flushSync - React batching ni bypass qiladi
            // Har bir delta uchun ALOHIDA render majburlanadi
            flushSync(() => {
                setStreamingMessage({
                    text: streamBufferRef.current,
                    isStreaming: true,
                });
            });
        };

        // Message updated listener (ignore)
        const handleMessageUpdated = () => {};

        // Error listener
        const handleError = ({ error: errorMsg }) => {
            setError(errorMsg);
            setIsSending(false);
        };

        // Register listeners
        wsService.on("connection_status", handleConnectionStatus);
        wsService.on("pong", handlePong);
        wsService.on("message_created", handleMessageCreated);
        wsService.on("message_stream", handleMessageStream);
        wsService.on("message_updated", handleMessageUpdated);
        wsService.on("error", handleError);

        // Connect
        setIsConnecting(true);
        wsService.connect(token).catch((err) => {
            setError("Failed to connect: " + err.message);
            setIsConnecting(false);
        });

        // Cleanup
        return () => {
            wsService.off("connection_status", handleConnectionStatus);
            wsService.off("pong", handlePong);
            wsService.off("message_created", handleMessageCreated);
            wsService.off("message_stream", handleMessageStream);
            wsService.off("message_updated", handleMessageUpdated);
            wsService.off("error", handleError);

            // Clear timeouts on unmount
            if (sendTimeoutRef.current) {
                clearTimeout(sendTimeoutRef.current);
            }
            if (streamTimeoutRef.current) {
                clearTimeout(streamTimeoutRef.current);
            }
        };
    }, [token]);

    const sendMessage = useCallback(
        (chatId, text, type = "TEXT", attachmentUrl = null) => {
            if (!text.trim() && !attachmentUrl) return;

            // Clear previous streaming state
            streamBufferRef.current = "";
            setStreamingMessage(null);
            isStreamingRef.current = false;

            setIsSending(true);

            const clientMsgId = `client_${Date.now()}`;
            pendingMessageIdRef.current = clientMsgId;
            pendingChatIdRef.current = chatId;

            // Add optimistic message
            const optimisticMessage = {
                id: clientMsgId,
                text,
                type,
                sender_id: "me",
                created_at: new Date().toISOString(),
                isOptimistic: true,
                isLoading: true,
            };

            setMessages((prev) => [...prev, optimisticMessage]);

            const success = wsService.sendMessage(
                chatId,
                text,
                type,
                attachmentUrl,
                clientMsgId,
            );

            if (!success) {
                setError("Failed to send message");
                setIsSending(false);
                pendingMessageIdRef.current = null;
                pendingChatIdRef.current = null;
                // Remove optimistic message
                setMessages((prev) => prev.filter((m) => m.id !== clientMsgId));
                return;
            }

            // Set timeout - minimum 2 seconds loading, then check for response
            sendTimeoutRef.current = setTimeout(() => {
                setIsSending(false);
                pendingMessageIdRef.current = null;
                pendingChatIdRef.current = null;

                // Update optimistic message to show it was sent but no confirmation
                setMessages((prev) =>
                    prev.map((m) =>
                        m.id === clientMsgId
                            ? { ...m, isLoading: false, isOptimistic: false }
                            : m,
                    ),
                );
            }, 2000);
        },
        [],
    );

    const editMessage = useCallback((messageId, text) => {
        wsService.editMessage(messageId, text);
    }, []);

    const markAsRead = useCallback((chatId, messageId) => {
        wsService.markAsRead(chatId, messageId);
    }, []);

    // History xabarlarini o'rnatish funksiyasi
    const setInitialMessages = useCallback((historyMessages) => {
        setMessages(historyMessages);
    }, []);

    return {
        isConnected,
        isConnecting,
        messages,
        streamingMessage,
        error,
        isSending,
        sendMessage,
        editMessage,
        markAsRead,
        setInitialMessages,
    };
};
