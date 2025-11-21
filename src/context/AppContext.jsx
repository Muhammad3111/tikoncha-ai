import React, { createContext, useContext, useState, useEffect } from "react";

const AppContext = createContext();

export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error("useApp must be used within AppProvider");
    }
    return context;
};

export const AppProvider = ({ children }) => {
    const [token, setToken] = useState(null);
    const [chatId, setChatId] = useState(null);
    const [chatTitle, setChatTitle] = useState("Yordamchi Tiparatikon");
    const [theme, setTheme] = useState("dark");
    const [fontSize, setFontSize] = useState(14);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        console.log(
            "📱 AppContext initialized, waiting for data from mobile app..."
        );

        // Mobile appdan postMessage orqali ma'lumotlarni qabul qilish
        const handleMessage = (event) => {
            try {
                const data =
                    typeof event.data === "string"
                        ? JSON.parse(event.data)
                        : event.data;

                console.log("📱 Received message from mobile app:", data);

                // Token
                if (data.token) {
                    setToken(
                        data.token.startsWith("Bearer ")
                            ? data.token
                            : `Bearer ${data.token}`
                    );
                }

                // Chat ID
                if (data.chatId) {
                    setChatId(data.chatId);
                }

                // Chat Title
                if (data.chatTitle) {
                    setChatTitle(data.chatTitle);
                }

                // Theme
                if (data.theme) {
                    setTheme(data.theme);
                }

                // Font Size
                if (data.fontSize) {
                    setFontSize(parseInt(data.fontSize));
                }

                // Barcha ma'lumotlar bir vaqtda kelishi mumkin
                if (data.type === "init" || data.type === "config") {
                    if (data.token)
                        setToken(
                            data.token.startsWith("Bearer ")
                                ? data.token
                                : `Bearer ${data.token}`
                        );
                    if (data.chatId) setChatId(data.chatId);
                    if (data.chatTitle) setChatTitle(data.chatTitle);
                    if (data.theme) setTheme(data.theme);
                    if (data.fontSize) setFontSize(parseInt(data.fontSize));

                    // Ma'lumotlar kelganda ready qilish
                    setIsReady(true);
                    console.log("✅ App initialized with data from mobile app");
                }
            } catch (error) {
                console.error("Error parsing message from mobile app:", error);
            }
        };

        // Window message listener
        window.addEventListener("message", handleMessage);

        // Mobile app ga ready signal yuborish
        if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(
                JSON.stringify({
                    type: "ready",
                    message: "WebView is ready",
                })
            );
        }

        // Bir oz kutib, agar ma'lumot kelmasa ready qilish (timeout)
        // 2 soniya kutamiz - agar ma'lumot kelmasa ham ready qilamiz
        const readyTimeout = setTimeout(() => {
            setIsReady(true);
            if (!token || !chatId) {
                console.warn(
                    "⚠️ Ready timeout reached without receiving data from mobile app"
                );
            } else {
                console.log("✅ Ready timeout reached with data");
            }
        }, 2000);

        return () => {
            window.removeEventListener("message", handleMessage);
            clearTimeout(readyTimeout);
        };
    }, []);

    // Font size ni CSS variable sifatida o'rnatish
    useEffect(() => {
        document.documentElement.style.setProperty(
            "--base-font-size",
            `${fontSize}px`
        );
    }, [fontSize]);

    const value = {
        token,
        chatId,
        chatTitle,
        theme,
        fontSize,
        isReady,
        isDark: theme === "dark",
        setToken,
        setChatId,
        setChatTitle,
        setTheme,
        setFontSize,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
