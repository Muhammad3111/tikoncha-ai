import React from "react";
import { ArrowLeft } from "lucide-react";
import { useApp } from "../context/AppContext";
import aiLogo from "../assets/ai_logo.png";

const ChatHeader = ({ isConnected, chatName = "Yordamchi tipratikon" }) => {
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
        <div
            className="border-b border-gray-700 px-4 py-3 rounded-b-[10px] shadow-sm shadow-white/10"
            style={{ backgroundColor: "var(--background-color)" }}
        >
            <div className="max-w-4xl mx-auto flex items-center gap-3">
                {/* Back button */}
                <button
                    className={`flex-shrink-0 p-1 rounded-full ${
                        isDark ? "hover:bg-gray-800" : "hover:bg-gray-100"
                    } transition-colors`}
                    onClick={goBack}
                >
                    <ArrowLeft
                        className="w-6 h-6"
                        style={{ color: "var(--text-color)" }}
                    />
                </button>

                {/* Avatar */}
                <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                    <img
                        src={aiLogo}
                        alt="AI Logo"
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
                    <p className="text-green-500 text-xs">Online</p>
                </div>
            </div>
        </div>
    );
};

export default ChatHeader;
