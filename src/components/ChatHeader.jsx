import React from "react";
import { ArrowLeft } from "lucide-react";
import { useApp } from "../context/AppContext";
import aiLogo from "../assets/ai_logo.png";
import { logForAndroid } from "../utils/mobileLogger";

const ChatHeader = ({
    isConnected,
    isConnecting,
    chatName = "Yordamchi tipratikon",
}) => {
    const { isDark } = useApp();

    const goBack = () => {
        logForAndroid("log", "Back button clicked", null);

        if (window.AndroidJson && window.AndroidJson.onWebBackPressed) {
            logForAndroid("log", "Calling Android app back function", null);
            window.AndroidJson.onWebBackPressed();
        } else {
            logForAndroid("log", "Using browser back fallback", null);
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
                    className="flex-shrink-0 p-2 rounded-lg transition-colors"
                    style={{ backgroundColor: "var(--text-input-color)" }}
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
                        className="text-xs"
                        style={{ color: "var(--primary-color)" }}
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
