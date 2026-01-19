import React from "react";
import { ArrowLeft } from "lucide-react";
import { useApp } from "../context/AppContext";
import aiLogo from "../assets/ai_logo.png";

const ChatHeader = ({
    isConnected,
    isConnecting,
    chatName = "Yordamchi tipratikon",
}) => {
    const { isDark } = useApp();

    const goBack = () => {
        console.log("🔙 Back button clicked");

        if (window.AndroidChat && window.AndroidChat.onBackFromWeb) {
            console.log("📱 Calling Android app back function");
            window.AndroidChat.onBackFromWeb();
        } else {
            console.log("🌐 Using browser back (fallback)");
            window.history.back();
        }
    };

    return (
        <header
            className="px-4 py-3 rounded-b-[10px]"
            style={{
                backgroundColor: "var(--background-color)",
                borderBottom: isDark
                    ? "1px solid #374151"
                    : "1px solid #e5e7eb",
                boxShadow: isDark
                    ? "0 2px 4px rgba(0, 0, 0, 0.3)"
                    : "0 2px 4px rgba(0, 0, 0, 0.08)",
            }}
            role="banner"
        >
            <div className="max-w-4xl mx-auto flex items-center gap-3">
                {/* Back button */}
                <button
                    className={`flex-shrink-0 p-2 rounded-lg ${
                        isDark ? "bg-[#1F1F1F]" : "bg-[#F3F4F7]"
                    } transition-colors`}
                    onClick={goBack}
                    aria-label="Orqaga qaytish"
                >
                    <ArrowLeft
                        className="w-4 h-4"
                        style={{ color: "var(--text-color)" }}
                        aria-hidden="true"
                    />
                </button>

                {/* Avatar */}
                <div
                    className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0"
                    role="img"
                    aria-label="AI avatar"
                >
                    <img
                        src={aiLogo}
                        alt="Yordamchi Tikoratikon AI"
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* Chat info */}
                <div className="flex-1">
                    <h1
                        className="font-semibold text-lg"
                        style={{ color: "var(--text-color)" }}
                    >
                        {chatName}
                    </h1>
                    <p
                        className={`text-xs ${
                            isConnecting
                                ? "text-green-500"
                                : isConnected
                                  ? "text-green-500"
                                  : "text-green-500"
                        }`}
                        role="status"
                        aria-live="polite"
                    >
                        {isConnecting
                            ? "Connecting"
                            : isConnected
                              ? "Online"
                              : "Disconnected"}
                    </p>
                </div>
            </div>
        </header>
    );
};

export default ChatHeader;
