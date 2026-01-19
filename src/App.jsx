import { useState, useEffect, useCallback } from "react";
import { useWebSocket } from "./hooks/useWebSocket";
import { useApp } from "./context/AppContext";
import { getChatHistory, formatMessagesFromApi } from "./services/chatApi";
import ChatHeader from "./components/ChatHeader";
import ChatContainer from "./components/ChatContainer";
import ChatInput from "./components/ChatInput";

function App() {
    const { token, chatId, chatTitle, isDark, isReady } = useApp();
    const {
        isConnected,
        isConnecting,
        messages,
        streamingMessage,
        isSending,
        sendMessage,
        setInitialMessages,
    } = useWebSocket(token, chatId);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const [historyLoaded, setHistoryLoaded] = useState(false);

    // Chat history ni yuklas
    const loadChatHistory = useCallback(async () => {
        if (!token || !chatId || isLoadingHistory) {
            return;
        }

        setIsLoadingHistory(true);
        try {
            const response = await getChatHistory(chatId, token, 50);

            if (response.success && response.data && response.data.items) {
                const formattedMessages = formatMessagesFromApi(
                    response.data.items,
                );

                // History xabarlarini WebSocket messages ga o'rnatish
                setInitialMessages(formattedMessages);

                setHistoryLoaded(true);
            }
        } catch (error) {
            // Silent error handling
        } finally {
            setIsLoadingHistory(false);
        }
    }, [token, chatId, setInitialMessages]);

    // Token va chatId tayyor bo'lganda history ni yuklash
    useEffect(() => {
        if (isReady && token && chatId && !isLoadingHistory) {
            loadChatHistory();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isReady, token, chatId]); // loadChatHistory intentionally omitted to prevent infinite loop

    // Agar token yoki chatId yo'q bo'lsa, loading ko'rsatish
    if (!isReady || !token || !chatId) {
        return (
            <div
                className={`h-screen flex items-center justify-center ${
                    isDark ? "bg-[#010D01]" : "bg-[#F5F7F5]"
                }`}
                style={{
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
