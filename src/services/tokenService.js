/**
 * WebSocket Token Service
 * Manages WebSocket session tokens with automatic refresh
 */
import { logForAndroid, toSerializableError } from "../utils/mobileLogger";

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "https://api.tikoncha.uz";
const WS_TOKEN_URL =
    import.meta.env.VITE_WS_TOKEN_URL || `${API_BASE_URL}/chat/ws-token`;
const TOKEN_REFRESH_BUFFER = parseInt(
    import.meta.env.VITE_TOKEN_REFRESH_BUFFER || "300",
);

class TokenService {
    constructor() {
        this.sessionToken = null;
        this.expiresAt = null;
        this.jwtToken = null;
        this.refreshTimer = null;
        this.listeners = new Map();
    }

    /**
     * Initialize token service with JWT token
     * @param {string} jwtToken - JWT Bearer token
     * @returns {Promise<string>} Session token
     */
    async initialize(jwtToken) {
        this.jwtToken = jwtToken;
        return await this.getSessionToken();
    }

    /**
     * Get valid session token (fetch new if expired)
     * @returns {Promise<string>} Valid session token
     */
    async getSessionToken() {
        if (this.isTokenValid()) {
            logForAndroid("log", "Using cached session token", {
                expiresAt: this.expiresAt
                    ? new Date(this.expiresAt).toISOString()
                    : null,
            });
            return this.sessionToken;
        }

        logForAndroid("log", "Fetching new session token", null);
        return await this.fetchNewToken();
    }

    /**
     * Check if current token is valid
     * @returns {boolean}
     */
    isTokenValid() {
        if (!this.sessionToken || !this.expiresAt) {
            return false;
        }

        const now = Date.now();
        const bufferMs = TOKEN_REFRESH_BUFFER * 1000;
        return now < this.expiresAt - bufferMs;
    }

    /**
     * Fetch new session token from API
     * @returns {Promise<string>} New session token
     */
    async fetchNewToken() {
        try {
            const response = await fetch(WS_TOKEN_URL, {
                method: "GET",
                headers: {
                    Authorization: this.jwtToken.startsWith("Bearer ")
                        ? this.jwtToken
                        : `Bearer ${this.jwtToken}`,
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (!result.success || !result.data) {
                throw new Error(result.error || "Failed to get session token");
            }

            const { session_token, expires_in } = result.data;

            this.sessionToken = session_token;
            this.expiresAt = Date.now() + expires_in * 1000;

            logForAndroid("log", "New session token received", {
                expiresInSeconds: expires_in,
                refreshAt: new Date(
                    this.expiresAt - TOKEN_REFRESH_BUFFER * 1000,
                ).toISOString(),
            });

            this.scheduleRefresh(expires_in);
            this.emit("token_refreshed", { session_token, expires_in });

            return this.sessionToken;
        } catch (error) {
            logForAndroid(
                "error",
                "Failed to fetch session token",
                toSerializableError(error),
            );
            this.emit("token_error", { error: error.message });
            throw error;
        }
    }

    /**
     * Schedule automatic token refresh
     * @param {number} expiresIn - Seconds until expiration
     */
    scheduleRefresh(expiresIn) {
        if (this.refreshTimer) {
            clearTimeout(this.refreshTimer);
        }

        const refreshIn = (expiresIn - TOKEN_REFRESH_BUFFER) * 1000;

        if (refreshIn > 0) {
            this.refreshTimer = setTimeout(async () => {
                logForAndroid("log", "Auto-refreshing session token", null);
                try {
                    await this.fetchNewToken();
                } catch (error) {
                    logForAndroid(
                        "error",
                        "Auto-refresh failed",
                        toSerializableError(error),
                    );
                }
            }, refreshIn);

            logForAndroid("log", "Token refresh scheduled", {
                refreshInSeconds: Math.floor(refreshIn / 1000),
            });
        }
    }

    /**
     * Manually refresh token
     * @returns {Promise<string>} New session token
     */
    async refreshToken() {
        logForAndroid("log", "Manual token refresh requested", null);
        return await this.fetchNewToken();
    }

    /**
     * Clear token and stop refresh timer
     */
    clear() {
        if (this.refreshTimer) {
            clearTimeout(this.refreshTimer);
            this.refreshTimer = null;
        }
        this.sessionToken = null;
        this.expiresAt = null;
        logForAndroid("log", "Token service cleared", null);
    }

    /**
     * Update JWT token
     * @param {string} newJwtToken - New JWT token
     */
    updateJwtToken(newJwtToken) {
        this.jwtToken = newJwtToken;
        logForAndroid("log", "JWT token updated", null);
    }

    /**
     * Event listener methods
     */
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    off(event, callback) {
        if (this.listeners.has(event)) {
            const callbacks = this.listeners.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    emit(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach((callback) => {
                try {
                    callback(data);
                } catch (error) {
                    logForAndroid("error", "Error in event listener", {
                        event,
                        error: toSerializableError(error),
                    });
                }
            });
        }
    }

    /**
     * Get token info for debugging
     * @returns {Object}
     */
    getTokenInfo() {
        return {
            hasToken: !!this.sessionToken,
            isValid: this.isTokenValid(),
            expiresAt: this.expiresAt
                ? new Date(this.expiresAt).toISOString()
                : null,
            timeUntilExpiry: this.expiresAt
                ? Math.floor((this.expiresAt - Date.now()) / 1000)
                : null,
        };
    }
}

const tokenService = new TokenService();
export default tokenService;
