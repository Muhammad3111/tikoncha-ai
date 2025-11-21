import React, { useEffect, useRef } from "react";
import Message from "./Message";
import aiLogo from "../assets/ai_logo.png";

const ChatContainer = ({ messages, streamingMessage }) => {
    const messagesEndRef = useRef(null);
    const containerRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, streamingMessage]);

    return (
        <div
            ref={containerRef}
            className="flex-1 overflow-y-auto bg-[#F5F7F4] dark:bg-[#010D01] py-4 pb-32"
        >
            <div className="max-w-4xl mx-auto">
                {messages.length === 0 && !streamingMessage && (
                    <div className="flex flex-col items-center justify-center h-full text-center px-4 py-20">
                        <div className="w-20 h-20 rounded-full overflow-hidden mb-6 shadow-lg">
                            <img
                                src={aiLogo}
                                alt="Yordamchi Tikoratikon"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            Suhbatni boshlang
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 max-w-md">
                            Xabar yuboring va Yordamchi Tikoratikon sizga yordam
                            beradi. Savollaringizga javob berish, rasmlarni
                            tahlil qilish, audio transkripsiya va boshqa ko'p
                            narsalar.
                        </p>
                    </div>
                )}

                {messages.map((message, index) => {
                    // User xabari: is_mine yoki isOptimistic
                    const isOwn = message.is_mine || message.isOptimistic;
                    return (
                        <Message
                            key={message.id || index}
                            message={message}
                            isOwn={isOwn}
                        />
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
