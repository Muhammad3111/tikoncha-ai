import { useState, useEffect, useCallback, useRef } from "react";
import wsService from "../services/websocket";

export const useWebSocket = (token) => {
    const [isConnected, setIsConnected] = useState(false);
    const [messages, setMessages] = useState([]);
    const [streamingMessage, setStreamingMessage] = useState(null);
    const [error, setError] = useState(null);
    const [isSending, setIsSending] = useState(false);

    const streamBufferRef = useRef("");
    const currentStreamIdRef = useRef(null);
    const pendingMessageIdRef = useRef(null);
    const sendTimeoutRef = useRef(null);
    const isStreamingRef = useRef(false);
    const streamTimeoutRef = useRef(null);

    useEffect(() => {
        if (!token || token === "") {
            setError("Iltimos sizda kirish malumotlari borligini tekshiring");
            return;
        }

        console.log("🔄 useWebSocket effect running");

        // Connection status listener
        const handleConnectionStatus = ({ connected }) => {
            console.log("📡 Connection status changed:", connected);
            setIsConnected(connected);
            if (!connected) {
                setError("Disconnected from server");
            } else {
                setError(null);
            }
        };

        // Pong listener
        const handlePong = () => {
            console.log("Pong received - connection alive");
        };

        // Message created listener
        const handleMessageCreated = ({ data }) => {
            const message = data.message;
            console.log("✅ Message created:", message);
            console.log("   Is mine:", message.is_mine);

            // Agar bot xabari bo'lsa va streaming bo'layotgan bo'lsa,
            // streaming o'chirib, final xabarni qo'shamiz
            if (!message.is_mine && isStreamingRef.current) {
                console.log(
                    "   Bot message after stream - clearing stream and adding final message"
                );

                // Clear stream timeout
                if (streamTimeoutRef.current) {
                    clearTimeout(streamTimeoutRef.current);
                    streamTimeoutRef.current = null;
                }

                streamBufferRef.current = "";
                setStreamingMessage(null);
                isStreamingRef.current = false;
            }

            setMessages((prev) => {
                // Remove optimistic messages
                const filtered = prev.filter((m) => !m.isOptimistic);

                // Agar xabar allaqachon mavjud bo'lsa, yangilaymiz
                const exists = filtered.some((m) => m.id === message.id);
                if (exists) {
                    return filtered.map((m) =>
                        m.id === message.id ? message : m
                    );
                }

                // Yangi xabarni qo'shamiz
                return [...filtered, message];
            });

            // User xabari uchun loading o'chirish
            if (message.is_mine) {
                setIsSending(false);
                pendingMessageIdRef.current = null;

                if (sendTimeoutRef.current) {
                    clearTimeout(sendTimeoutRef.current);
                    sendTimeoutRef.current = null;
                }
            }
        };

        // Message stream listener (bot responses)
        const handleMessageStream = ({ data }) => {
            const delta = data.delta;
            console.log("📥 Stream delta:", delta);

            // Agar yangi streaming boshlanayotgan bo'lsa, bufferni tozalash
            if (!isStreamingRef.current) {
                console.log("🆕 New stream started, clearing buffer");
                streamBufferRef.current = "";
                isStreamingRef.current = true;
            }

            // Deltani bufferga qo'shish
            streamBufferRef.current += delta;

            // Darhol ko'rsatish (typing effect harfma-harf bo'ladi)
            setStreamingMessage({
                text: streamBufferRef.current,
                isStreaming: true,
            });
        };

        // Message updated listener (ignore - biz message_created ishlatamiz)
        const handleMessageUpdated = ({ data }) => {
            console.log(
                "🔄 Message updated - IGNORED (using message_created instead)"
            );
            // Bu eventni ignore qilamiz, chunki message_created ishlatamiz
        };

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
        wsService.connect(token).catch((err) => {
            setError("Failed to connect: " + err.message);
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
                clientMsgId
            );

            if (!success) {
                setError("Failed to send message");
                setIsSending(false);
                pendingMessageIdRef.current = null;
                // Remove optimistic message
                setMessages((prev) => prev.filter((m) => m.id !== clientMsgId));
                return;
            }

            // Set timeout - if no response in 10 seconds, clear loading
            sendTimeoutRef.current = setTimeout(() => {
                console.warn("No response from server after 10 seconds");
                setIsSending(false);
                pendingMessageIdRef.current = null;

                // Update optimistic message to show it was sent but no confirmation
                setMessages((prev) =>
                    prev.map((m) =>
                        m.id === clientMsgId
                            ? { ...m, isLoading: false, isOptimistic: false }
                            : m
                    )
                );
            }, 10000);
        },
        []
    );

    const editMessage = useCallback((messageId, text) => {
        wsService.editMessage(messageId, text);
    }, []);

    const markAsRead = useCallback((chatId, messageId) => {
        wsService.markAsRead(chatId, messageId);
    }, []);

    // History xabarlarini o'rnatish funksiyasi
    const setInitialMessages = useCallback((historyMessages) => {
        console.log(
            "📋 Setting initial messages from history:",
            historyMessages.length
        );
        setMessages(historyMessages);
    }, []);

    return {
        isConnected,
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
