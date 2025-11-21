import React, { useState, useRef, useEffect } from "react";
import { ArrowUp, Loader2, Plus } from "lucide-react";
import { useApp } from "../context/AppContext";

const ChatInput = ({ onSend, isSending, disabled }) => {
    const { isDark } = useApp();
    const [message, setMessage] = useState("");
    const textareaRef = useRef(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (message.trim() && !isSending && !disabled) {
            onSend(message);
            setMessage("");
            // Reset textarea height
            if (textareaRef.current) {
                textareaRef.current.style.height = "auto";
            }
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height =
                Math.min(textareaRef.current.scrollHeight, 150) + "px";
        }
    }, [message]);

    const hasMessage = message.trim().length > 0;
    const isMultiLine = message.includes("\n") || message.length > 50;

    return (
        <div
            className={`fixed bottom-0 left-0 right-0 z-50 ${
                isDark
                    ? "border-gray-700/50 bg-[#010D01]/80"
                    : "border-gray-200/50 bg-[#F5F7F4]/80"
            } backdrop-blur-md`}
        >
            <form onSubmit={handleSubmit} className="p-4">
                <div className="max-w-4xl mx-auto">
                    {/* Message input container */}
                    <div
                        className={`relative ${
                            isDark ? "bg-[#1F1F1F]" : "bg-gray-100"
                        } ${
                            isMultiLine ? "rounded-3xl" : "rounded-full"
                        } flex items-center gap-2 px-3 py-2 transition-all`}
                    >
                        {/* Plus button (chap tomonda, input ichida) */}
                        <button
                            type="button"
                            className="flex-shrink-0 w-9 h-9 rounded-full bg-green-600 hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center focus:outline-none"
                            disabled={disabled || isSending}
                            title="Attach file"
                        >
                            <Plus className="w-5 h-5 text-white" />
                        </button>

                        {/* Textarea */}
                        <textarea
                            ref={textareaRef}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Xabar yozish"
                            disabled={disabled || isSending}
                            rows={1}
                            className={`flex-1 px-2 py-2 bg-transparent placeholder-[#AFAFAF] ${
                                isDark ? "text-white" : "text-[#1A1A1A]"
                            } resize-none outline-none focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed max-h-[150px] overflow-y-auto border-none`}
                            style={{ minHeight: "36px" }}
                        />

                        {/* Send button (o'ng tomonda, input ichida, faqat matn bo'lganda) */}
                        {hasMessage && (
                            <button
                                type="submit"
                                disabled={isSending || disabled}
                                className="flex-shrink-0 w-9 h-9 rounded-full bg-green-600 hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg focus:outline-none"
                            >
                                {isSending ? (
                                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                                ) : (
                                    <ArrowUp className="w-5 h-5 text-white" />
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </form>
        </div>
    );
};

export default ChatInput;
