import { Loader2 } from "lucide-react";
import MarkdownRenderer from "./MarkdownRenderer";

const Message = ({ message, isStreaming = false, isOwn = false }) => {
    const isLoading = message?.isLoading || false;
    return (
        <article
            className={`flex ${
                isOwn ? "justify-end" : "justify-start"
            } mb-4 px-4 ${!isStreaming ? "animate-fadeIn" : ""}`}
            role="article"
            aria-label={isOwn ? "Sizning xabaringiz" : "Bot javobi"}
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
                        <MarkdownRenderer
                            content={message.text || message}
                            isStreaming={isStreaming}
                        />
                        {isStreaming && (
                            <span className="inline-block w-1 h-4 bg-green-500 animate-pulse ml-0.5 align-middle" />
                        )}

                        {/* Timestamp inside message bubble */}
                        {message?.created_at && !isLoading && (
                            <div
                                className={`text-xs text-green-600 mt-1 ${
                                    isOwn ? "text-right" : "text-left"
                                }`}
                            >
                                {new Date(
                                    message.created_at,
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
                    <div
                        className="flex items-center gap-2 mt-2 ml-2"
                        role="status"
                        aria-live="polite"
                    >
                        <Loader2
                            className="w-3 h-3 animate-spin text-gray-400"
                            aria-hidden="true"
                        />
                        <span className="text-xs text-gray-500">
                            Sending...
                        </span>
                    </div>
                )}
            </div>
        </article>
    );
};

export default Message;
