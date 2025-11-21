import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import { Copy, Check } from "lucide-react";
import { useApp } from "../context/AppContext";
import "katex/dist/katex.min.css";
import "highlight.js/styles/atom-one-dark.css";

const CodeBlock = ({ language, children }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        const code = String(children).replace(/\n$/, "");
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="relative my-2.5 group">
            <button
                onClick={handleCopy}
                className="absolute top-2 right-2 bg-transparent text-gray-400 hover:text-white hover:bg-white/10 border-none p-1 cursor-pointer opacity-60 hover:opacity-100 transition-all rounded z-10 flex items-center justify-center"
                title="Copy code"
            >
                {copied ? (
                    <Check className="w-4.5 h-4.5 text-green-400" />
                ) : (
                    <Copy className="w-4.5 h-4.5" />
                )}
            </button>
            <pre className="!bg-[#282c34] !m-0 !p-2 !rounded-lg border border-gray-600/30 relative overflow-hidden">
                <code
                    className={`hljs language-${language} !block !p-4 !pt-8 !overflow-x-auto !font-mono !text-sm !leading-relaxed !text-[#abb2bf]`}
                >
                    {children}
                </code>
            </pre>
        </div>
    );
};

const MarkdownRenderer = ({ content }) => {
    const { isDark } = useApp();

    return (
        <div
            className="markdown-content prose prose-sm sm:prose max-w-none"
            style={{ color: "var(--text-color)" }}
        >
            <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[
                    [
                        rehypeKatex,
                        {
                            strict: false,
                            trust: true,
                            throwOnError: false,
                        },
                    ],
                    [rehypeHighlight, { ignoreMissing: true }],
                ]}
                components={{
                    // Code blocks
                    code({ node, inline, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || "");

                        if (!inline && match) {
                            return (
                                <CodeBlock language={match[1]}>
                                    {children}
                                </CodeBlock>
                            );
                        }

                        return (
                            <code
                                className="bg-gray-800/15 text-[#e06c75] px-1.5 py-1 rounded font-mono text-[0.9em]"
                                {...props}
                            >
                                {children}
                            </code>
                        );
                    },

                    // Tables
                    table({ children }) {
                        return (
                            <div className="overflow-x-auto my-6">
                                <table className="border-collapse w-full text-[0.95em]">
                                    {children}
                                </table>
                            </div>
                        );
                    },

                    thead({ children }) {
                        return <thead>{children}</thead>;
                    },

                    tbody({ children }) {
                        return <tbody>{children}</tbody>;
                    },

                    tr({ children, ...props }) {
                        return (
                            <tr
                                className="even:bg-[#1a1a1a] hover:bg-[#222]"
                                {...props}
                            >
                                {children}
                            </tr>
                        );
                    },

                    th({ children }) {
                        return (
                            <th className="border border-[#444] px-3.5 py-2.5 text-left bg-[#333] font-semibold text-white">
                                {children}
                            </th>
                        );
                    },

                    td({ children }) {
                        return (
                            <td className="border border-[#444] px-3.5 py-2.5 text-left">
                                {children}
                            </td>
                        );
                    },

                    // Headings
                    h1({ children }) {
                        return (
                            <h1 className="text-2xl font-semibold mt-6 mb-2 text-white">
                                {children}
                            </h1>
                        );
                    },

                    h2({ children }) {
                        return (
                            <h2 className="text-xl font-semibold mt-6 mb-2 pb-1.5 border-b border-[#444] text-white">
                                {children}
                            </h2>
                        );
                    },

                    h3({ children }) {
                        return (
                            <h3 className="text-lg font-semibold mt-6 mb-2 pb-1.5 border-b border-[#444] text-white">
                                {children}
                            </h3>
                        );
                    },

                    // Paragraphs
                    p({ children }) {
                        return (
                            <p className="mb-4 leading-relaxed">{children}</p>
                        );
                    },

                    // Lists
                    ul({ children }) {
                        return (
                            <ul className="list-disc list-inside mb-3 space-y-1 text-gray-200">
                                {children}
                            </ul>
                        );
                    },

                    ol({ children }) {
                        return (
                            <ol className="list-decimal list-inside mb-3 space-y-1 text-gray-200">
                                {children}
                            </ol>
                        );
                    },

                    li({ children }) {
                        return <li className="ml-4">{children}</li>;
                    },

                    // Blockquotes
                    blockquote({ children }) {
                        return (
                            <blockquote
                                className="border-l-4 pl-4 py-2 my-4"
                                style={{
                                    borderColor: isDark ? "#444" : "#ccc",
                                    color: "var(--text-secondary)",
                                }}
                            >
                                {children}
                            </blockquote>
                        );
                    },

                    // Links
                    a({ href, children }) {
                        return (
                            <a
                                href={href}
                                className="text-[#58a6ff] hover:underline no-underline"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {children}
                            </a>
                        );
                    },

                    // Horizontal rule
                    hr() {
                        return <hr className="my-6 border-gray-700" />;
                    },

                    // Strong/Bold
                    strong({ children }) {
                        return (
                            <strong
                                className="font-bold"
                                style={{ color: "var(--text-color)" }}
                            >
                                {children}
                            </strong>
                        );
                    },

                    // Emphasis/Italic
                    em({ children }) {
                        return (
                            <em
                                className="italic"
                                style={{ color: "var(--text-secondary)" }}
                            >
                                {children}
                            </em>
                        );
                    },
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
};

export default MarkdownRenderer;
