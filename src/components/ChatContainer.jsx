import React, { useEffect, useRef } from "react";
import Message from "./Message";
import DateSeparator from "./DateSeparator";
import aiLogo from "../assets/ai_logo.png";

const ChatContainer = ({
    messages,
    streamingMessage,
    isLoadingHistory = false,
}) => {
    const messagesEndRef = useRef(null);
    const containerRef = useRef(null);
    const isInitialLoadRef = useRef(true);
    const prevMessagesLengthRef = useRef(0);

    // Scroll to bottom - instant for initial load, smooth for new messages
    const scrollToBottom = (instant = false) => {
        if (instant) {
            // Darhol eng oxiriga o'tish (scroll animatsiyasiz)
            messagesEndRef.current?.scrollIntoView({ behavior: "instant" });
        } else {
            // Yangi xabarlar uchun smooth scroll
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    };

    useEffect(() => {
        // Birinchi marta yuklanganda yoki history yuklanganda - darhol oxiriga
        if (isInitialLoadRef.current && messages.length > 0) {
            // Kichik delay - DOM to'liq renderlanishi uchun
            setTimeout(() => {
                scrollToBottom(true); // instant scroll
            }, 50);
            isInitialLoadRef.current = false;
            prevMessagesLengthRef.current = messages.length;
            return;
        }

        // Yangi xabar qo'shilganda - smooth scroll
        if (messages.length > prevMessagesLengthRef.current) {
            scrollToBottom(false); // smooth scroll
        }
        prevMessagesLengthRef.current = messages.length;
    }, [messages]);

    // Streaming paytida smooth scroll
    useEffect(() => {
        if (streamingMessage) {
            scrollToBottom(false);
        }
    }, [streamingMessage]);

    return (
        <div
            ref={containerRef}
            className="flex-1 overflow-y-auto py-4 pb-32 min-h-0"
            style={{
                backgroundColor: "var(--background-color)",
                flexShrink: 1,
                flexGrow: 1,
            }}
        >
            <div className="max-w-4xl mx-auto">
                {/* History loading indicator */}
                {isLoadingHistory && (
                    <div className="flex justify-center py-8">
                        <div className="flex items-center gap-3">
                            <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
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

                {messages.map((message, index) => {
                    // User xabari: is_mine yoki isOptimistic yoki isOwn (API dan kelgan)
                    const isOwn =
                        message.is_mine ||
                        message.isOptimistic ||
                        message.isOwn;

                    // Sana separator kerakmi tekshirish
                    const shouldShowDateSeparator = () => {
                        if (index === 0) return true; // Birinchi xabar uchun har doim

                        const currentDate = new Date(message.created_at);
                        const previousDate = new Date(
                            messages[index - 1].created_at
                        );

                        // Kun farqi bor bo'lsa separator ko'rsatish
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

                {streamingMessage && (
                    <Message
                        message={streamingMessage}
                        isStreaming={true}
                        isOwn={false}
                    />
                )}

                <div ref={messagesEndRef} />
            </div>
        </div>
    );
};

export default ChatContainer;
