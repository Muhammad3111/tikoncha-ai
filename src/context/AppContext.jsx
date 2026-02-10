import React, { createContext, useContext, useState, useEffect } from "react";

const AppContext = createContext();
const CUSTOM_COLORS = {
    primary: "#C3955B",
    darkBackground: "#130D00",
    lightBackground: "#F1EEE2",
};

const parseBoolean = (value) => {
    if (typeof value === "boolean") return value;

    if (typeof value === "string") {
        const normalized = value.trim().toLowerCase();
        if (normalized === "true") return true;
        if (normalized === "false") return false;
    }

    return null;
};

const logMobileMessage = (label, payload) => {
    console.debug(`[Mobile Debug] ${label}:`, payload);
};

export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error("useApp must be used within AppProvider");
    }
    return context;
};

export const AppProvider = ({ children }) => {
    const [token, setToken] = useState("");
    const [chatId, setChatId] = useState("");
    const [chatTitle, setChatTitle] = useState("Yordamchi Tiparatikon");
    const [theme, setTheme] = useState("dark");
    const [fontSize, setFontSize] = useState(14);
    const [useParentColors, setUseParentColors] = useState(false);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        // URL parametrlarini tekshirish (HTTP headerlar o'rniga)
        const urlParams = new URLSearchParams(window.location.search);
        const urlToken = urlParams.get("token");
        const urlChatId = urlParams.get("chatId");
        const urlChatTitle = urlParams.get("chatTitle");
        const urlTheme = urlParams.get("theme");
        const urlFontSize = urlParams.get("fontSize");
        const urlParent = urlParams.get("parent");
        const parsedUrlParent = parseBoolean(urlParent);

        // Agar URL parametrlar mavjud bo'lsa
        if (urlToken || urlChatId || parsedUrlParent !== null) {
            // URL parametrlardan state ni yangilash
            if (urlToken) {
                setToken(
                    urlToken.startsWith("Bearer ")
                        ? urlToken
                        : `Bearer ${urlToken}`,
                );
            }
            if (urlChatId) setChatId(urlChatId);
            if (urlChatTitle) setChatTitle(decodeURIComponent(urlChatTitle));
            if (urlTheme) setTheme(urlTheme);
            if (urlFontSize) setFontSize(parseInt(urlFontSize));
            if (parsedUrlParent !== null) setUseParentColors(parsedUrlParent);

            setIsReady(true);
        }

        // Mobile appdan postMessage orqali ma'lumotlarni qabul qilish
        const handleMessage = (event) => {
            logMobileMessage("Raw message", event.data);

            try {
                const data =
                    typeof event.data === "string"
                        ? JSON.parse(event.data)
                        : event.data;

                logMobileMessage("Parsed JSON", data);

                if (!data || typeof data !== "object") {
                    logMobileMessage(
                        "Ignored (payload object emas)",
                        data,
                    );
                    return;
                }

                // Token
                if (data.token) {
                    setToken(
                        data.token.startsWith("Bearer ")
                            ? data.token
                            : `Bearer ${data.token}`,
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

                // Parent color control (true/false)
                if (Object.prototype.hasOwnProperty.call(data, "parent")) {
                    const parsedParent = parseBoolean(data.parent);
                    if (parsedParent !== null) {
                        setUseParentColors(parsedParent);
                    }
                }

                // Barcha ma'lumotlar bir vaqtda kelishi mumkin
                if (data.type === "init" || data.type === "config") {
                    // Ma'lumotlar kelganda ready qilish
                    setIsReady(true);
                }
            } catch (error) {
                console.error("Error parsing message from mobile app:", error);
                logMobileMessage("Parse failed payload", event.data);
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
                }),
            );
        }

        // Bir oz kutib, agar ma'lumot kelmasa ready qilish (timeout)
        // 2 soniya kutamiz - agar ma'lumot kelmasa ham ready qilamiz
        const readyTimeout = setTimeout(() => {
            setIsReady(true);
        }, 2000);

        return () => {
            window.removeEventListener("message", handleMessage);
            clearTimeout(readyTimeout);
        };
    }, []);

    // Font size va theme ranglarini CSS variable sifatida o'rnatish
    useEffect(() => {
        document.documentElement.style.setProperty(
            "--base-font-size",
            `${fontSize}px`,
        );
    }, [fontSize]);

    // Theme ranglarini o'rnatish
    useEffect(() => {
        const root = document.documentElement;
        root.setAttribute("data-theme", theme);

        if (theme === "dark") {
            // Dark theme ranglari
            root.style.setProperty(
                "--text-input-color",
                useParentColors ? "#22170D" : "#1F1F1F",
            );
            root.style.setProperty(
                "--background-color",
                useParentColors
                    ? CUSTOM_COLORS.darkBackground
                    : "#010D01",
            );
            root.style.setProperty("--text-color", "#FFFFFF");
            root.style.setProperty(
                "--text-secondary",
                useParentColors ? "#D3C2A9" : "#CCCCCC",
            );
        } else {
            // Light theme ranglari
            root.style.setProperty("--text-input-color", "#FFFFFF");
            root.style.setProperty(
                "--background-color",
                useParentColors
                    ? CUSTOM_COLORS.lightBackground
                    : "#F5F7F5",
            );
            root.style.setProperty("--text-color", "#000000");
            root.style.setProperty(
                "--text-secondary",
                useParentColors ? "#5A4A38" : "#666666",
            );
        }

        root.style.setProperty(
            "--primary-color",
            useParentColors ? CUSTOM_COLORS.primary : "#16A34A",
        );
        root.style.setProperty(
            "--primary-color-hover",
            useParentColors ? "#AB7F4B" : "#15803D",
        );
    }, [theme, useParentColors]);

    const value = {
        token,
        chatId,
        chatTitle,
        theme,
        fontSize,
        isReady,
        isDark: theme === "dark",
        useParentColors,
        setToken,
        setChatId,
        setChatTitle,
        setTheme,
        setFontSize,
        setUseParentColors,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
