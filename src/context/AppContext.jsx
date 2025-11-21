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

        // URL parametrlarini tekshirish (HTTP headerlar o'rniga)
        const urlParams = new URLSearchParams(window.location.search);
        const urlToken = urlParams.get("token");
        const urlChatId = urlParams.get("chatId");
        const urlChatTitle = urlParams.get("chatTitle");
        const urlTheme = urlParams.get("theme");
        const urlFontSize = urlParams.get("fontSize");

        // Agar URL parametrlar mavjud bo'lsa
        if (urlToken || urlChatId) {
            console.group(
                "🔗 URL parametrlardan ma'lumotlar (Header o'rniga):"
            );
            console.log(
                "Token:",
                urlToken ? `${urlToken.substring(0, 20)}...` : "Yo'q"
            );
            console.log("Chat ID:", urlChatId || "Yo'q");
            console.log("Chat Title:", urlChatTitle || "Yo'q");
            console.log("Theme:", urlTheme || "Yo'q");
            console.log("Font Size:", urlFontSize || "Yo'q");
            console.groupEnd();

            // URL parametrlardan state ni yangilash
            if (urlToken) {
                setToken(
                    urlToken.startsWith("Bearer ")
                        ? urlToken
                        : `Bearer ${urlToken}`
                );
            }
            if (urlChatId) setChatId(urlChatId);
            if (urlChatTitle) setChatTitle(decodeURIComponent(urlChatTitle));
            if (urlTheme) setTheme(urlTheme);
            if (urlFontSize) setFontSize(parseInt(urlFontSize));

            setIsReady(true);
            console.log(
                "✅ App initialized with URL parameters (instead of headers)"
            );
        }

        // Mobile appdan postMessage orqali ma'lumotlarni qabul qilish
        const handleMessage = (event) => {
            try {
                const data =
                    typeof event.data === "string"
                        ? JSON.parse(event.data)
                        : event.data;

                console.log("📱 Received message from mobile app:", data);

                // Kelgan ma'lumotlarni batafsil console ga chiqarish
                console.group("🔍 WebView dan kelgan ma'lumotlar:");
                console.log("Type:", data.type);
                console.log(
                    "Token:",
                    data.token ? `${data.token.substring(0, 20)}...` : "Yo'q"
                );
                console.log("Chat ID:", data.chatId || "Yo'q");
                console.log("Chat Title:", data.chatTitle || "Yo'q");
                console.log("Theme:", data.theme || "Yo'q");
                console.log("Font Size:", data.fontSize || "Yo'q");
                console.log(
                    "Barcha ma'lumotlar:",
                    JSON.stringify(data, null, 2)
                );
                console.groupEnd();

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
