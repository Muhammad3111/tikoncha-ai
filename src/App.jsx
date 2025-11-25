import React, { useState, useEffect, useCallback } from "react";
import { useWebSocket } from "./hooks/useWebSocket";
import { useApp } from "./context/AppContext";
import { getChatHistory, formatMessagesFromApi } from "./services/chatApi";
import ChatHeader from "./components/ChatHeader";
import ChatContainer from "./components/ChatContainer";
import ChatInput from "./components/ChatInput";
import ErrorBanner from "./components/ErrorBanner";

function App() {
    const { token, chatId, chatTitle, isDark, isReady } = useApp();
    const {
        isConnected,
        isConnecting,
        messages,
        streamingMessage,
        error,
        isSending,
        sendMessage,
        setInitialMessages,
    } = useWebSocket(token);

    const [showError, setShowError] = useState(true);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const [historyLoaded, setHistoryLoaded] = useState(false);

    console.log("💬 Current Chat ID:", chatId);
    console.log("🎨 Theme:", isDark ? "dark" : "light");
    console.log("🔑 Token:", token ? "Set" : "Not set");
    console.log("📱 App Ready:", isReady);
    console.log("📊 History Loaded:", historyLoaded);
    console.log("⏳ Loading History:", isLoadingHistory);
    console.log("📝 Messages Count:", messages.length);

    // Chat history ni yuklash
    const loadChatHistory = useCallback(async () => {
        if (!token || !chatId || isLoadingHistory) {
            return;
        }

        setIsLoadingHistory(true);
        try {
            console.log("📋 Loading chat history for:", chatId);
            const response = await getChatHistory(chatId, token, 50);

            if (response.success && response.data && response.data.items) {
                const formattedMessages = formatMessagesFromApi(
                    response.data.items
                );
                console.log(
                    "✅ History loaded, messages count:",
                    formattedMessages.length
                );

                // History xabarlarini WebSocket messages ga o'rnatish
                setInitialMessages(formattedMessages);

                setHistoryLoaded(true);
            } else {
                console.warn("⚠️ Invalid history response:", response);
            }
        } catch (error) {
            console.error("❌ Failed to load chat history:", error);
        } finally {
            setIsLoadingHistory(false);
        }
    }, [token, chatId, setInitialMessages]);

    // Token va chatId tayyor bo'lganda history ni yuklash
    useEffect(() => {
        if (isReady && token && chatId && !isLoadingHistory) {
            console.log("🔄 Starting to load chat history...");
            loadChatHistory();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isReady, token, chatId]); // loadChatHistory intentionally omitted to prevent infinite loop

    // Agar token yoki chatId yo'q bo'lsa, loading ko'rsatish
    if (!isReady || !token || !chatId) {
        return (
            <div
                className="h-screen flex items-center justify-center"
                style={{
                    backgroundColor: "var(--background-color)",
                    color: "var(--text-color)",
                }}
            >
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-lg">Yuklanmoqda...</p>
                </div>
            </div>
        );
    }

    const handleSendMessage = (text) => {
        console.log(" Sending message to chat:", chatId, "Text:", text);
        sendMessage(chatId, text);
    };

    return (
        <div
            className="h-screen flex flex-col overflow-hidden"
            style={{
                backgroundColor: "var(--background-color)",
                color: "var(--text-color)",
                minHeight: "100vh",
                maxHeight: "100vh",
            }}
        >
            {/* Header */}
            <ChatHeader
                isConnected={isConnected}
                isConnecting={isConnecting}
                chatName={chatTitle}
            />

            {/* Error Banner */}
            {error && showError && (
                <ErrorBanner
                    error={error}
                    onClose={() => setShowError(false)}
                />
            )}

            {/* Messages Container */}
            <ChatContainer
                messages={messages}
                streamingMessage={streamingMessage}
                isLoadingHistory={isLoadingHistory}
            />

            {/* Input */}
            <ChatInput
                onSend={handleSendMessage}
                isSending={isSending}
                disabled={!isConnected}
            />
        </div>
    );
}

export default App;
