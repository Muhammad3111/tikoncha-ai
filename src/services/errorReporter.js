/**
 * Error Reporting Service
 * Centralized error logging and reporting
 */

const ENABLE_ERROR_REPORTING =
    import.meta.env.VITE_ENABLE_ERROR_REPORTING === "true";
const ERROR_REPORTING_URL = import.meta.env.VITE_ERROR_REPORTING_URL;
const ENV = import.meta.env.VITE_ENV || "production";

class ErrorReporter {
    constructor() {
        this.errorQueue = [];
        this.maxQueueSize = 50;
        this.isInitialized = false;
    }

    /**
     * Initialize error reporter
     */
    init() {
        if (this.isInitialized) return;

        window.addEventListener("error", (event) => {
            this.captureError(event.error, {
                type: "window_error",
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
            });
        });

        window.addEventListener("unhandledrejection", (event) => {
            this.captureError(event.reason, {
                type: "unhandled_rejection",
                promise: event.promise,
            });
        });

        this.isInitialized = true;
        console.log("🔍 Error reporter initialized");
    }

    /**
     * Capture and report error
     * @param {Error} error - Error object
     * @param {Object} context - Additional context
     */
    captureError(error, context = {}) {
        const errorData = {
            message: error?.message || String(error),
            stack: error?.stack,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent,
            env: ENV,
            context,
        };

        console.error("❌ Error captured:", errorData);

        this.addToQueue(errorData);

        if (ENABLE_ERROR_REPORTING && ERROR_REPORTING_URL) {
            this.sendToServer(errorData);
        }
    }

    /**
     * Capture custom message
     * @param {string} message - Error message
     * @param {Object} extra - Extra data
     */
    captureMessage(message, extra = {}) {
        const errorData = {
            message,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            env: ENV,
            extra,
        };

        console.warn("⚠️ Message captured:", errorData);

        this.addToQueue(errorData);

        if (ENABLE_ERROR_REPORTING && ERROR_REPORTING_URL) {
            this.sendToServer(errorData);
        }
    }

    /**
     * Add error to queue
     * @param {Object} errorData
     */
    addToQueue(errorData) {
        this.errorQueue.push(errorData);

        if (this.errorQueue.length > this.maxQueueSize) {
            this.errorQueue.shift();
        }
    }

    /**
     * Send error to server
     * @param {Object} errorData
     */
    async sendToServer(errorData) {
        try {
            await fetch(ERROR_REPORTING_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(errorData),
            });
        } catch (error) {
            console.error("Failed to send error to server:", error);
        }
    }

    /**
     * Get error queue
     * @returns {Array}
     */
    getErrors() {
        return [...this.errorQueue];
    }

    /**
     * Clear error queue
     */
    clearErrors() {
        this.errorQueue = [];
    }

    /**
     * Set user context
     * @param {Object} user - User data
     */
    setUser(user) {
        this.userContext = user;
    }

    /**
     * Add breadcrumb
     * @param {string} message
     * @param {Object} data
     */
    addBreadcrumb(message, data = {}) {
        if (ENV === "development") {
            console.log("🍞 Breadcrumb:", message, data);
        }
    }
}

const errorReporter = new ErrorReporter();
export default errorReporter;
