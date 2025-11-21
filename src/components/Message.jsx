import React from "react";
import { Loader2 } from "lucide-react";
import MarkdownRenderer from "./MarkdownRenderer";
import { useApp } from "../context/AppContext";

const Message = ({ message, isStreaming = false, isOwn = false }) => {
    const isLoading = message?.isLoading || false;
    const { isDark } = useApp();
    return (
        <div
            className={`flex ${
                isOwn ? "justify-end" : "justify-start"
            } mb-4 px-4 animate-fadeIn`}
        >
            <div
                className={`${
                    isOwn
                        ? "max-w-[85%] sm:max-w-[75%] md:max-w-[65%] order-2"
                        : "w-full order-1"
                }`}
            >
                {/* Message bubble */}
                <div
                    className={`rounded-2xl px-4 py-3 shadow-lg ${
                        isOwn ? "rounded-br-sm" : "rounded-bl-sm"
                    }`}
                    style={{
                        backgroundColor: "var(--text-input-color)",
                        color: isDark ? "#FFFFFF" : "#000000",
                    }}
                >
                    <div>
                        {isStreaming ? (
                            <div className="flex items-start gap-2">
                                <MarkdownRenderer content={message.text} />
                                <div className="mt-1 flex-shrink-0">
                                    <div className="w-1.5 h-4 bg-white/70 animate-pulse rounded" />
                                </div>
                            </div>
                        ) : (
                            <MarkdownRenderer
                                content={message.text || message}
                            />
                        )}

                        {/* Timestamp inside message bubble */}
                        {message?.created_at && !isLoading && (
                            <div
                                className={`text-xs text-green-600 mt-2 ${
                                    isOwn ? "text-right" : "text-left"
                                }`}
                            >
                                {new Date(
                                    message.created_at
                                ).toLocaleTimeString("en-US", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Loading indicator below message */}
                {isLoading && (
                    <div className="flex items-center gap-2 mt-2 ml-2">
                        <Loader2 className="w-3 h-3 animate-spin text-gray-400" />
                        <span className="text-xs text-gray-500">
                            Sending...
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Message;
