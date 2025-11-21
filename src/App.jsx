import React, { useState } from "react";
import { useWebSocket } from "./hooks/useWebSocket";
import { useApp } from "./context/AppContext";
import ChatHeader from "./components/ChatHeader";
import ChatContainer from "./components/ChatContainer";
import ChatInput from "./components/ChatInput";
import ErrorBanner from "./components/ErrorBanner";

function App() {
    const { token, chatId, chatTitle, isDark, isReady } = useApp();
    const {
        isConnected,
        messages,
        streamingMessage,
        error,
        isSending,
        sendMessage,
    } = useWebSocket(token);

    const [showError, setShowError] = useState(true);

    console.log("💬 Current Chat ID:", chatId);
    console.log("🎨 Theme:", isDark ? "dark" : "light");
    console.log("🔑 Token:", token ? "Set" : "Not set");
    console.log("📱 App Ready:", isReady);

    // Agar token yoki chatId yo'q bo'lsa, loading ko'rsatish
    if (!isReady || !token || !chatId) {
        return (
            <div
                className={`h-screen flex items-center justify-center ${
                    isDark
                        ? "bg-[#010D01] text-white"
                        : "bg-[#F5F7F4] text-gray-900"
                }`}
            >
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-lg">Yuklanmoqda...</p>
                </div>
            </div>
        );
    }

    const handleSendMessage = (text) => {
        console.log("📝 Sending message to chat:", chatId, "Text:", text);
        sendMessage(chatId, text);
    };

    return (
        <div
            className={`h-screen flex flex-col ${
                isDark
                    ? "bg-[#010D01] text-white"
                    : "bg-[#F5F7F4] text-gray-900"
            }`}
        >
            {/* Header */}
            <ChatHeader isConnected={isConnected} chatName={chatTitle} />

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
