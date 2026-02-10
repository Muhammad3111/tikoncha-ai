const LOG_PREFIX = "[Mobile Debug]";
const CHUNK_SIZE = 3000;

const createSafeReplacer = () => {
    const seen = new WeakSet();

    return (_, value) => {
        if (typeof value === "bigint") {
            return `${value.toString()}n`;
        }

        if (value instanceof Error) {
            return {
                name: value.name,
                message: value.message,
                stack: value.stack,
            };
        }

        if (typeof value === "function") {
            return `[Function ${value.name || "anonymous"}]`;
        }

        if (typeof value === "object" && value !== null) {
            if (seen.has(value)) {
                return "[Circular]";
            }
            seen.add(value);
        }

        return value;
    };
};

export const stringifyForLog = (value) => {
    if (typeof value === "string") {
        return value;
    }

    if (typeof value === "undefined") {
        return "undefined";
    }

    try {
        return JSON.stringify(value, createSafeReplacer());
    } catch (_jsonError) {
        try {
            return String(value);
        } catch (_stringError) {
            return "[Unserializable value]";
        }
    }
};

export const toSerializableError = (error) => {
    if (error instanceof Error) {
        return {
            name: error.name,
            message: error.message,
            stack: error.stack,
        };
    }

    return error;
};

export const logForAndroid = (level, label, payload) => {
    const logger =
        typeof console[level] === "function"
            ? console[level].bind(console)
            : console.log.bind(console);

    const hasPayload = payload !== null && typeof payload !== "undefined";
    const line = hasPayload
        ? `${LOG_PREFIX} ${label}: ${stringifyForLog(payload)}`
        : `${LOG_PREFIX} ${label}`;

    if (line.length <= CHUNK_SIZE) {
        logger(line);
        return;
    }

    const totalChunks = Math.ceil(line.length / CHUNK_SIZE);
    for (let index = 0; index < line.length; index += CHUNK_SIZE) {
        const chunk = line.slice(index, index + CHUNK_SIZE);
        const chunkNumber = Math.floor(index / CHUNK_SIZE) + 1;
        logger(`${chunk} [${chunkNumber}/${totalChunks}]`);
    }
};
