import React from "react";

const DateSeparator = ({ date }) => {
    const formatDate = (dateString) => {
        const messageDate = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        // Vaqtni 00:00:00 ga o'rnatish taqqoslash uchun
        const messageDateOnly = new Date(
            messageDate.getFullYear(),
            messageDate.getMonth(),
            messageDate.getDate()
        );
        const todayOnly = new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate()
        );
        const yesterdayOnly = new Date(
            yesterday.getFullYear(),
            yesterday.getMonth(),
            yesterday.getDate()
        );

        if (messageDateOnly.getTime() === todayOnly.getTime()) {
            return "Bugun";
        } else if (messageDateOnly.getTime() === yesterdayOnly.getTime()) {
            return "Kecha";
        } else {
            // Sana formatini o'zbek tilida ko'rsatish
            const months = [
                "yanvar",
                "fevral",
                "mart",
                "aprel",
                "may",
                "iyun",
                "iyul",
                "avgust",
                "sentabr",
                "oktabr",
                "noyabr",
                "dekabr",
            ];

            const day = messageDate.getDate();
            const month = months[messageDate.getMonth()];
            const year = messageDate.getFullYear();

            return `${day} ${month} ${year}`;
        }
    };

    return (
        <div className="flex items-center my-4 px-4">
            {/* Chap line */}
            <div className="flex-1 h-px bg-gray-300 dark:bg-gray-600"></div>

            {/* Sana */}
            <div
                className="px-3 py-1 text-xs font-medium rounded-full mx-3"
                style={{
                    backgroundColor: "var(--text-input-color)",
                    color: "var(--text-secondary)",
                }}
            >
                {formatDate(date)}
            </div>

            {/* O'ng line */}
            <div className="flex-1 h-px bg-gray-300 dark:bg-gray-600"></div>
        </div>
    );
};

export default DateSeparator;
