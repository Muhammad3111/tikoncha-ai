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
            } mb-4 px-4 ${!isStreaming ? "animate-fadeIn" : ""}`}
        >
            <div
                className={`${
                    isOwn
                        ? "max-w-[85%] sm:max-w-[75%] md:max-w-[65%] order-2"
                        : "max-w-full order-1"
                }`}
            >
                {/* Message bubble */}
                <div
                    className={`rounded-2xl ${
                        isOwn
                            ? "rounded-br-sm px-3 py-2 shadow-lg"
                            : "rounded-bl-sm !bg-transparent"
                    }`}
                    style={{
                        backgroundColor: "var(--text-input-color)",
                        color: "var(--text-color)",
                    }}
                >
                    <div className="min-w-0 w-full">
                        {isStreaming ? (
                            <div className="w-full">
                                <MarkdownRenderer
                                    content={message.text}
                                    isStreaming={true}
                                />
                                <div className="mt-2 flex items-center gap-2">
                                    <div className="w-1.5 h-4 bg-green-500/70 animate-pulse rounded" />
                                    <span className="text-xs text-green-500/70">
                                        Yozilmoqda...
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <MarkdownRenderer
                                content={message.text || message}
                                isStreaming={false}
                            />
                        )}

                        {/* Timestamp inside message bubble */}
                        {message?.created_at && !isLoading && (
                            <div
                                className={`text-xs text-green-600 mt-1 ${
                                    isOwn ? "text-right" : "text-left"
                                }`}
                            >
                                {new Date(
                                    message.created_at
                                ).toLocaleTimeString("en-US", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: false,
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
