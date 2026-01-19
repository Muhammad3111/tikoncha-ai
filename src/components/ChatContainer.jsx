import React, { useEffect, useRef } from "react";
import Message from "./Message";
import DateSeparator from "./DateSeparator";
import aiLogo from "../assets/ai_logo.png";

const ChatContainer = ({
    messages,
    streamingMessage,
    isLoadingHistory = false,
}) => {
    const containerRef = useRef(null);
    const messagesEndRef = useRef(null);
    const isInitialLoadRef = useRef(true);
    const prevMessagesLengthRef = useRef(0);

    // Scroll to bottom
    const scrollToBottom = (instant = false) => {
        if (instant) {
            messagesEndRef.current?.scrollIntoView({ behavior: "instant" });
        } else {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    };

    // Initial load va yangi xabarlar uchun scroll
    useEffect(() => {
        if (isInitialLoadRef.current && messages.length > 0) {
            setTimeout(() => {
                scrollToBottom(true);
            }, 50);
            isInitialLoadRef.current = false;
            prevMessagesLengthRef.current = messages.length;
            return;
        }

        if (messages.length > prevMessagesLengthRef.current) {
            scrollToBottom(false);
        }
        prevMessagesLengthRef.current = messages.length;
    }, [messages]);

    // Streaming paytida scroll
    useEffect(() => {
        if (streamingMessage) {
            scrollToBottom(false);
        }
    }, [streamingMessage]);

    return (
        <main
            ref={containerRef}
            className="flex-1 overflow-y-auto py-4 pb-32 min-h-0"
            style={{
                backgroundColor: "var(--background-color)",
                flexShrink: 1,
                flexGrow: 1,
            }}
            role="log"
            aria-live="polite"
            aria-label="Chat xabarlari"
        >
            <div className="max-w-4xl mx-auto">
                {/* History loading indicator */}
                {isLoadingHistory && (
                    <div
                        className="flex justify-center py-8"
                        role="status"
                        aria-live="polite"
                    >
                        <div className="flex items-center gap-3">
                            <div
                                className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin"
                                aria-hidden="true"
                            ></div>
                            <span
                                className="text-sm"
                                style={{ color: "var(--text-secondary)" }}
                            >
                                Xabarlar yuklanmoqda...
                            </span>
                        </div>
                    </div>
                )}

                {messages.length === 0 &&
                    !streamingMessage &&
                    !isLoadingHistory && (
                        <div className="flex flex-col items-center justify-center h-full text-center px-4 py-20">
                            <div className="w-20 h-20 rounded-full overflow-hidden mb-6 shadow-lg">
                                <img
                                    src={aiLogo}
                                    alt="Yordamchi Tikoratikon"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <h2
                                className="text-2xl font-bold mb-2"
                                style={{ color: "var(--text-color)" }}
                            >
                                Suhbatni boshlang
                            </h2>
                            <p
                                className="max-w-md"
                                style={{ color: "var(--text-secondary)" }}
                            >
                                Xabar yuboring va Yordamchi Tikoratikon sizga
                                yordam beradi. Savollaringizga javob berish,
                                rasmlarni tahlil qilish, audio transkripsiya va
                                boshqa ko'p narsalar.
                            </p>
                        </div>
                    )}

                {/* Render all messages */}
                {messages.map((message, index) => {
                    const isOwn =
                        message.is_mine ||
                        message.isOptimistic ||
                        message.isOwn;

                    const shouldShowDateSeparator = () => {
                        if (index === 0) return true;

                        const currentDate = new Date(message.created_at);
                        const previousDate = new Date(
                            messages[index - 1].created_at,
                        );

                        return (
                            currentDate.toDateString() !==
                            previousDate.toDateString()
                        );
                    };

                    return (
                        <React.Fragment key={message.id || index}>
                            {shouldShowDateSeparator() && (
                                <DateSeparator date={message.created_at} />
                            )}
                            <Message message={message} isOwn={isOwn} />
                        </React.Fragment>
                    );
                })}

                {/* Streaming message */}
                {streamingMessage && (
                    <Message
                        message={streamingMessage}
                        isStreaming={true}
                        isOwn={false}
                    />
                )}

                {/* Scroll anchor */}
                <div ref={messagesEndRef} aria-hidden="true" />
            </div>
        </main>
    );
};

export default ChatContainer;
