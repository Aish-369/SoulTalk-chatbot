package com.example.core

object ApiConfig {
    // Environment-based API configuration
    private const val ENV_DEV = "dev"
    private const val ENV_PROD = "prod"
    
    // Current environment (can be set via BuildConfig or runtime)
    var currentEnvironment: String = ENV_DEV
        private set
    
    fun setEnvironment(env: String) {
        currentEnvironment = when(env.lowercase()) {
            "production", "prod" -> ENV_PROD
            else -> ENV_DEV
        }
    }
    
    // Single Source of Truth Production HTTPS Cloud Backend URL
    const val CLOUD_BASE_URL = "https://ais-dev-byrih4kpeyzpyp7htmlzlu-607559042008.asia-east1.run.app/"
    
    // Get current base URL - defaults to production Cloud URL on real APK
    val baseUrl: String
        get() {
            return try {
                val configured = com.example.BuildConfig.BACKEND_BASE_URL
                if (!configured.isNullOrBlank() &&
                    !configured.contains("10.0.2.2") &&
                    !configured.contains("localhost") &&
                    !configured.contains("127.0.0.1") &&
                    !configured.contains("192.168.") &&
                    !configured.contains(":3000") &&
                    !configured.contains(":8000") &&
                    configured.startsWith("https://")) {
                    if (configured.endsWith("/")) configured else "$configured/"
                } else {
                    CLOUD_BASE_URL
                }
            } catch (e: Throwable) {
                CLOUD_BASE_URL
            }
        }
    
    // API endpoints
    object Endpoints {
        const val CHAT_SEND = "/chat/send"
        const val MOOD_LOG = "/mood/log"
        const val JOURNAL_CREATE = "/journal/create"
        const val VOICE_SAVE = "/voice/process"
        const val COMPANION_UPDATE = "/companion/update"
        const val COMPANION_STATUS = "/companion/status"
        const val SETTINGS = "/settings"
    }
    
    // Timeout configurations
    const val CONNECT_TIMEOUT_SECONDS = 30L
    const val READ_TIMEOUT_SECONDS = 30L
    const val WRITE_TIMEOUT_SECONDS = 30L
    
    // Retry configuration
    const val MAX_RETRIES = 3
    const val RETRY_DELAY_MS = 1000L
}
