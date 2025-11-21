import React from "react";
import { ArrowLeft } from "lucide-react";
import { useApp } from "../context/AppContext";
import aiLogo from "../assets/ai_logo.png";

const ChatHeader = ({ isConnected, chatName = "Yordamchi tipratikon" }) => {
    const { isDark } = useApp();

    return (
        <div
            className={`${
                isDark
                    ? "bg-[#010D01] border-gray-700"
                    : "bg-white border-gray-200"
            } border-b px-4 py-3 rounded-b-[10px] shadow-sm ${
                isDark ? "shadow-white/10" : "shadow-gray-200"
            }`}
        >
            <div className="max-w-4xl mx-auto flex items-center gap-3">
                {/* Back button */}
                <button
                    className={`flex-shrink-0 p-1 rounded-full ${
                        isDark ? "hover:bg-gray-800" : "hover:bg-gray-100"
                    } transition-colors`}
                    onClick={() => window.history.back()}
                >
                    <ArrowLeft
                        className={`w-6 h-6 ${
                            isDark ? "text-white" : "text-gray-900"
                        }`}
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
                        className={`${
                            isDark ? "text-white" : "text-gray-900"
                        } font-semibold text-lg`}
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
