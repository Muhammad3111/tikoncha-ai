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
            // Message ni darhol tozalamaymiz, loading tugaganida tozalanadi
        }
    };

    // Loading tugaganda message ni tozalash
    useEffect(() => {
        if (!isSending && message.trim()) {
            // Agar loading tugagan bo'lsa va message bor bo'lsa, tozalash
            setMessage("");
            // Reset textarea height
            if (textareaRef.current) {
                textareaRef.current.style.height = "auto";
            }
        }
    }, [isSending]);

    const handleKeyDown = (e) => {
        // Mobile WebView da Enter bosilganda abzas tashlash
        // Xabar faqat button orqali yuboriladi
        if (e.key === "Enter") {
            // Enter = yangi qator (abzas)
            // Xabar yuborish uchun button ishlatiladi
            return; // Default behavior - yangi qator qo'shish
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
        <div className="fixed bottom-0 left-0 right-0 z-50 border-gray-700/50">
            <form onSubmit={handleSubmit} className="p-4">
                <div className="max-w-4xl mx-auto">
                    {/* Message input container */}
                    <div
                        className={`relative ${
                            isMultiLine ? "rounded-3xl" : "rounded-full"
                        } flex items-center gap-2 px-4 py-1 transition-all shadow-lg`}
                        style={{
                            backgroundColor: "var(--text-input-color)",
                            boxShadow: "var(--text-input-color)",
                        }}
                    >
                        {/* Plus button (chap tomonda, input ichida) - hozircha disabled */}
                        <button
                            type="button"
                            className="flex-shrink-0 w-6 h-6 rounded-lg bg-gray-500 transition-colors opacity-50 cursor-not-allowed flex items-center justify-center focus:outline-none"
                            disabled={true}
                            title="Tez orada..."
                            aria-label="Fayl yuklash (tez orada)"
                        >
                            <Plus
                                className="w-4 h-4 text-white"
                                aria-hidden="true"
                            />
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
                            className="flex-1 px-2 py-2 bg-transparent placeholder-[#AFAFAF] resize-none outline-none focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed max-h-[150px] overflow-y-auto border-none text-sm"
                            style={{
                                color: "var(--text-color)",
                                minHeight: "36px",
                            }}
                            aria-label="Xabar matni"
                            aria-describedby="message-hint"
                        />

                        {/* Send button (faqat message bor bo'lganda yoki loading paytida) */}
                        {(hasMessage || isSending) && (
                            <button
                                type="submit"
                                disabled={!hasMessage || disabled}
                                className="flex-shrink-0 w-6 h-6 rounded-lg transition-all hover:brightness-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg focus:outline-none"
                                style={{
                                    backgroundColor: "var(--primary-color)",
                                }}
                                aria-label={
                                    isSending
                                        ? "Yuborilmoqda..."
                                        : "Xabar yuborish"
                                }
                            >
                                {isSending ? (
                                    <Loader2
                                        className="w-4 h-4 text-white animate-spin"
                                        aria-hidden="true"
                                    />
                                ) : (
                                    <ArrowUp
                                        className="w-4 h-4 text-white"
                                        aria-hidden="true"
                                    />
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
