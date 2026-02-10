import React from "react";
import { ArrowLeft } from "lucide-react";
import { useApp } from "../context/AppContext";
import aiLogo from "../assets/ai_logo.png";
import { logForAndroid } from "../utils/mobileLogger";

const ChatHeader = ({
    isConnected,
    isConnecting,
    chatName = "Yordamchi tipratikon",
}) => {
    const { isDark } = useApp();

    const notifyNativeBack = () => {
        const payload = {
            type: "back",
            action: "close_webview",
            source: "chat_header",
            ts: Date.now(),
        };
        const serializedPayload = JSON.stringify(payload);

        // Matches Android Kotlin bridge:
        // addJavascriptInterface(AndroidJsonBridge(...), "AndroidJson")
        // @JavascriptInterface fun backPressed()
        if (window.AndroidJson) {
            try {
                const backPressedType = typeof window.AndroidJson.backPressed;
                logForAndroid("debug", "Android bridge detected", {
                    backPressedType,
                });

                if (backPressedType !== "undefined") {
                    window.AndroidJson.backPressed();
                    return true;
                }

                logForAndroid(
                    "warn",
                    "AndroidJson.backPressed not exposed by WebView bridge",
                    null,
                );
            } catch (error) {
                logForAndroid("error", "Android back bridge error", error);
            }
        }

        // iOS WKWebView explicit handler (if app exposes it)
        if (
            window.webkit &&
            window.webkit.messageHandlers &&
            window.webkit.messageHandlers.onWebBackPressed &&
            typeof window.webkit.messageHandlers.onWebBackPressed.postMessage ===
                "function"
        ) {
            window.webkit.messageHandlers.onWebBackPressed.postMessage(payload);
            return true;
        }

        // React Native WebView bridge
        if (
            window.ReactNativeWebView &&
            typeof window.ReactNativeWebView.postMessage === "function"
        ) {
            window.ReactNativeWebView.postMessage(serializedPayload);
            return true;
        }

        // iOS RN fallback: sometimes exposed through WebKit message handler.
        if (
            window.webkit &&
            window.webkit.messageHandlers &&
            window.webkit.messageHandlers.ReactNativeWebView &&
            typeof window.webkit.messageHandlers.ReactNativeWebView.postMessage ===
                "function"
        ) {
            window.webkit.messageHandlers.ReactNativeWebView.postMessage(
                serializedPayload,
            );
            return true;
        }

        return false;
    };

    const goBack = () => {
        logForAndroid("log", "Back button clicked", null);

        const handledByNative = notifyNativeBack();
        if (handledByNative) {
            logForAndroid("log", "Back handled by native bridge", null);
            return;
        }

        if (window.history.length > 1) {
            logForAndroid("log", "Using browser back fallback", null);
            window.history.back();
        } else {
            logForAndroid("warn", "No native back bridge and no history", null);
        }
    };

    return (
        <header
            className="px-4 py-3 rounded-b-[10px]"
            style={{
                backgroundColor: "var(--background-color)",
                borderBottom: isDark
                    ? "1px solid #374151"
                    : "1px solid #e5e7eb",
                boxShadow: isDark
                    ? "0 2px 4px rgba(0, 0, 0, 0.3)"
                    : "0 2px 4px rgba(0, 0, 0, 0.08)",
            }}
            role="banner"
        >
            <div className="max-w-4xl mx-auto flex items-center gap-3">
                {/* Back button */}
                <button
                    className="flex-shrink-0 p-2 rounded-lg transition-colors"
                    style={{ backgroundColor: "var(--text-input-color)" }}
                    onClick={goBack}
                    aria-label="Orqaga qaytish"
                >
                    <ArrowLeft
                        className="w-4 h-4"
                        style={{ color: "var(--text-color)" }}
                        aria-hidden="true"
                    />
                </button>

                {/* Avatar */}
                <div
                    className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0"
                    role="img"
                    aria-label="AI avatar"
                >
                    <img
                        src={aiLogo}
                        alt="Yordamchi Tikoratikon AI"
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
                    <p
                        className="text-xs"
                        style={{ color: "var(--primary-color)" }}
                        role="status"
                        aria-live="polite"
                    >
                        {isConnecting
                            ? "Connecting"
                            : isConnected
                              ? "Online"
                              : "Disconnected"}
                    </p>
                </div>
            </div>
        </header>
    );
};

export default ChatHeader;
