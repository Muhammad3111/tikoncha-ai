import React, { useEffect, useRef, useMemo } from "react";
import { useApp } from "../context/AppContext";
import "katex/dist/katex.min.css";
import "highlight.js/styles/atom-one-dark.css";
import { marked } from "marked";
import hljs from "highlight.js";
import katex from "katex";

// Window obyektiga qo'shish
if (typeof window !== "undefined") {
    window.marked = marked;
    window.hljs = hljs;
}

const MarkdownRenderer = ({ content, isStreaming = false }) => {
    const containerRef = useRef(null);
    const { isDark } = useApp();

    // Buzilgan KaTeX HTML teglarini tozalash (code va jadvallarni himoya qilgan holda)
    const cleanBrokenKatex = (text) => {
        if (!text) return text;

        // Himoyalangan bloklar
        const protectedBlocks = [];

        // Fenced code blocks (```...```)
        text = text.replace(/```[\s\S]*?```/g, (match) => {
            protectedBlocks.push(match);
            return `__PROTECTED_${protectedBlocks.length - 1}__`;
        });

        // Inline code (`...`)
        text = text.replace(/`[^`]+`/g, (match) => {
            protectedBlocks.push(match);
            return `__PROTECTED_${protectedBlocks.length - 1}__`;
        });

        // Jadvallarni himoya qilish (| bilan boshlanadigan qatorlar)
        text = text.replace(/(\|[^\n]+\|(\n|$))+/g, (match) => {
            protectedBlocks.push(match);
            return `__PROTECTED_${protectedBlocks.length - 1}__`;
        });

        // 1. KaTeX xatolarini tozalash
        text = text.replace(/\\?[′'`]?inmathmodeatposition[^′'`\s\n"<]*/gi, "");
        text = text.replace(
            /in\s*math\s*mode\s*at\s*position\s*\d+[^\n"<]*/gi,
            ""
        );
        text = text.replace(
            /ParseError:\s*KaTeX\s*parse\s*error:[^\n"<]*/gi,
            ""
        );
        text = text.replace(/Can't use function[^\n"<]*/gi, "");

        // 2. Buzilgan KaTeX HTML teglarini tozalash
        text = text.replace(
            /<span[^>]*class="katex-error"[^>]*>[^<]*<\/span>/gi,
            ""
        );
        text = text.replace(
            /<span[^>]*style="color:#cc0000"[^>]*>[^<]*<\/span>/gi,
            ""
        );

        // 3. Buzilgan belgilarni tozalash
        text = text.replace(/\\̲/g, "\\");
        text = text.replace(/−/g, "-");

        // 4. Takroriy matnlarni tozalash
        text = text.replace(/(\d+\.\s*\*\*[^*]+\*\*[^0-9]*?)(\1)+/gi, "$1");
        text = text.replace(/([a-zA-Z]\([^)]+\))\1+/g, "$1");
        text = text.replace(/([A-Z]{1,3}=[A-Z]{1,3})\1+/g, "$1");

        // Himoyalangan bloklarni qaytarish
        protectedBlocks.forEach((block, i) => {
            text = text.replace(`__PROTECTED_${i}__`, block);
        });

        return text;
    };

    // Matematik formulalarni KaTeX bilan render qilish (string sifatida)
    const renderMathInText = (text) => {
        if (!text) return text;

        // Himoyalangan bloklar (code va jadvallar)
        const protectedBlocks = [];

        // Fenced code blocks (```...```)
        text = text.replace(/```[\s\S]*?```/g, (match) => {
            protectedBlocks.push(match);
            return `__MATH_PROTECTED_${protectedBlocks.length - 1}__`;
        });

        // Inline code (`...`)
        text = text.replace(/`[^`]+`/g, (match) => {
            protectedBlocks.push(match);
            return `__MATH_PROTECTED_${protectedBlocks.length - 1}__`;
        });

        // Jadvallarni himoya qilish (| bilan boshlanadigan qatorlar)
        text = text.replace(/(\|[^\n]+\|(\n|$))+/g, (match) => {
            protectedBlocks.push(match);
            return `__MATH_PROTECTED_${protectedBlocks.length - 1}__`;
        });

        // Display math: $$ ... $$ yoki \[ ... \]
        text = text.replace(/\$\$([\s\S]*?)\$\$/g, (match, math) => {
            try {
                return katex.renderToString(math.trim(), {
                    displayMode: true,
                    throwOnError: false,
                    output: "html",
                });
            } catch (e) {
                return `<span class="math-error">${math}</span>`;
            }
        });

        text = text.replace(/\\\[([\s\S]*?)\\\]/g, (match, math) => {
            try {
                return katex.renderToString(math.trim(), {
                    displayMode: true,
                    throwOnError: false,
                    output: "html",
                });
            } catch (e) {
                return `<span class="math-error">${math}</span>`;
            }
        });

        // Inline math: $ ... $ yoki \( ... \)
        text = text.replace(/\$([^\n\r$]+?)\$/g, (match, math) => {
            try {
                return katex.renderToString(math.trim(), {
                    displayMode: false,
                    throwOnError: false,
                    output: "html",
                });
            } catch (e) {
                return `<span class="math-error">${math}</span>`;
            }
        });

        text = text.replace(/\\\(([^\n\r]+?)\\\)/g, (match, math) => {
            try {
                return katex.renderToString(math.trim(), {
                    displayMode: false,
                    throwOnError: false,
                    output: "html",
                });
            } catch (e) {
                return `<span class="math-error">${math}</span>`;
            }
        });

        // Himoyalangan bloklarni qaytarish
        protectedBlocks.forEach((block, i) => {
            text = text.replace(`__MATH_PROTECTED_${i}__`, block);
        });

        return text;
    };

    const addCopyButtons = () => {
        const preBlocks = containerRef.current?.querySelectorAll("pre");
        preBlocks?.forEach((pre) => {
            if (pre.querySelector(".copy-btn")) return;

            const btn = document.createElement("button");
            btn.className = "copy-btn";
            btn.innerHTML =
                '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>';

            btn.onclick = () => {
                const code = pre.querySelector("code")?.innerText ?? "";
                navigator.clipboard.writeText(code);
                btn.innerHTML =
                    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4ade80" stroke-width="2"><polyline points="20,6 9,17 4,12"/></svg>';
                setTimeout(() => {
                    btn.innerHTML =
                        '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>';
                }, 1500);
            };

            pre.appendChild(btn);
        });
    };

    // HTML ni hisoblash
    const renderedHtml = useMemo(() => {
        if (!content) return "";

        try {
            // 1. Buzilgan KaTeX ni tozalash
            let cleanedContent = cleanBrokenKatex(content);

            // 2. Streaming paytida KaTeX render qilmaslik
            if (!isStreaming) {
                cleanedContent = renderMathInText(cleanedContent);
            }

            // 3. Markdown ni HTML ga aylantirish (code highlighting bilan)
            marked.setOptions({
                breaks: true,
                gfm: true,
                highlight: function (code, lang) {
                    if (lang && hljs.getLanguage(lang)) {
                        try {
                            return hljs.highlight(code, { language: lang })
                                .value;
                        } catch (e) {
                            return code;
                        }
                    }
                    return hljs.highlightAuto(code).value;
                },
                langPrefix: "hljs language-",
            });

            return marked.parse(cleanedContent);
        } catch (_error) {
            return content;
        }
    }, [content, isStreaming]);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        el.innerHTML = renderedHtml;

        // Code highlighting
        el.querySelectorAll("pre code").forEach((block) => {
            hljs.highlightElement(block);
        });

        addCopyButtons();

        document.documentElement.setAttribute(
            "data-theme",
            isDark ? "dark" : "light"
        );
    }, [renderedHtml, isDark]);

    return (
        <div
            ref={containerRef}
            className="markdown-container prose prose-lg max-w-none break-words"
            style={{
                color: "var(--text-color)",
                minHeight: "1.5em",
                fontSize: "1rem",
                lineHeight: "1.75",
            }}
        />
    );
};

export default MarkdownRenderer;
