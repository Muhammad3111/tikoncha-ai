import React, { useRef, useEffect, useState } from "react";
import Message from "./Message";
import DateSeparator from "./DateSeparator";

/**
 * Custom virtual scrolling component without external dependencies
 * Renders only visible messages for better performance
 */
const VirtualizedMessageList = ({ messages, streamingMessage }) => {
    const containerRef = useRef(null);
    const [scrollTop, setScrollTop] = useState(0);
    const [containerHeight, setContainerHeight] = useState(0);
    const itemHeights = useRef(new Map());
    const itemRefs = useRef(new Map());

    // Combine all items (messages + date separators + streaming)
    const allItems = React.useMemo(() => {
        const items = [];

        messages.forEach((message, index) => {
            const shouldShowDate =
                index === 0 ||
                new Date(message.created_at).toDateString() !==
                    new Date(messages[index - 1].created_at).toDateString();

            if (shouldShowDate) {
                items.push({
                    type: "date",
                    date: message.created_at,
                    id: `date-${index}`,
                });
            }

            items.push({
                type: "message",
                message,
                id: message.id || `msg-${index}`,
                isOwn: message.is_mine || message.isOptimistic || message.isOwn,
            });
        });

        if (streamingMessage) {
            items.push({
                type: "message",
                message: streamingMessage,
                id: "streaming",
                isOwn: false,
                isStreaming: true,
            });
        }

        return items;
    }, [messages, streamingMessage]);

    // Calculate which items are visible
    const getVisibleRange = () => {
        const BUFFER = 5; // Render extra items above/below viewport
        let currentY = 0;
        let startIndex = 0;
        let endIndex = allItems.length;

        for (let i = 0; i < allItems.length; i++) {
            const height = itemHeights.current.get(allItems[i].id) || 100;

            if (currentY + height < scrollTop - 500) {
                startIndex = i + 1;
            }

            if (currentY > scrollTop + containerHeight + 500) {
                endIndex = i;
                break;
            }

            currentY += height;
        }

        return {
            start: Math.max(0, startIndex - BUFFER),
            end: Math.min(allItems.length, endIndex + BUFFER),
        };
    };

    const { start, end } = getVisibleRange();

    // Calculate total height and offset
    let totalHeight = 0;
    let offsetY = 0;

    allItems.forEach((item, index) => {
        const height = itemHeights.current.get(item.id) || 100;
        if (index < start) offsetY += height;
        totalHeight += height;
    });

    // Measure container and handle scroll
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleScroll = () => setScrollTop(container.scrollTop);
        const handleResize = () => setContainerHeight(container.clientHeight);

        handleResize();
        container.addEventListener("scroll", handleScroll);
        window.addEventListener("resize", handleResize);

        return () => {
            container.removeEventListener("scroll", handleScroll);
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    // Measure item heights
    useEffect(() => {
        itemRefs.current.forEach((element, id) => {
            if (element) {
                const height = element.getBoundingClientRect().height;
                if (itemHeights.current.get(id) !== height) {
                    itemHeights.current.set(id, height);
                }
            }
        });
    });

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        if (containerRef.current && allItems.length > 0) {
            const container = containerRef.current;
            const isNearBottom =
                container.scrollHeight -
                    container.scrollTop -
                    container.clientHeight <
                100;

            if (isNearBottom || streamingMessage) {
                setTimeout(() => {
                    container.scrollTop = container.scrollHeight;
                }, 50);
            }
        }
    }, [allItems.length, streamingMessage]);

    if (allItems.length === 0) return null;

    return (
        <div
            ref={containerRef}
            style={{
                width: "100%",
                height: "100%",
                overflow: "auto",
                position: "relative",
            }}
        >
            <div style={{ height: totalHeight, position: "relative" }}>
                <div style={{ transform: `translateY(${offsetY}px)` }}>
                    {allItems.slice(start, end).map((item) => (
                        <div
                            key={item.id}
                            ref={(el) => {
                                if (el) itemRefs.current.set(item.id, el);
                            }}
                        >
                            {item.type === "date" ? (
                                <DateSeparator date={item.date} />
                            ) : (
                                <Message
                                    message={item.message}
                                    isOwn={item.isOwn}
                                    isStreaming={item.isStreaming}
                                />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default VirtualizedMessageList;
