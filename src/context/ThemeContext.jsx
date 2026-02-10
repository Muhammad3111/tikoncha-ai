import React, { createContext, useContext, useState, useEffect } from "react";
import { logForAndroid, toSerializableError } from "../utils/mobileLogger";

const ThemeContext = createContext();

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme must be used within ThemeProvider");
    }
    return context;
};

export const ThemeProvider = ({ children }) => {
    const [isDark, setIsDark] = useState(true); // Default dark mode

    useEffect(() => {
        // Mobile ilovadan theme message qabul qilish
        const handleMessage = (event) => {
            try {
                const data =
                    typeof event.data === "string"
                        ? JSON.parse(event.data)
                        : event.data;

                if (data.type === "theme") {
                    setIsDark(data.isDark);
                    logForAndroid("log", "Theme changed", {
                        isDark: Boolean(data.isDark),
                        theme: data.isDark ? "dark" : "light",
                    });
                }
            } catch (error) {
                logForAndroid("error", "Error parsing theme message", {
                    error: toSerializableError(error),
                    payload: event.data,
                });
            }
        };

        // Window message listener
        window.addEventListener("message", handleMessage);

        // Android WebView uchun
        if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(
                JSON.stringify({
                    type: "ready",
                    message: "WebView ready for theme updates",
                })
            );
        }

        return () => {
            window.removeEventListener("message", handleMessage);
        };
    }, []);

    // Theme o'zgartirish funksiyasi (test uchun)
    const toggleTheme = () => {
        setIsDark((prev) => !prev);
    };

    const value = {
        isDark,
        theme: isDark ? "dark" : "light",
        toggleTheme,
    };

    return (
        <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
    );
};
