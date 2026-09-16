/**
 * SoulTalk Privacy-First Product Analytics & Retention Engine
 * 
 * Strict Privacy Guarantees:
 * - NO personal identifiable information (PII) is tracked.
 * - NO raw conversational text or private journal contents are logged.
 * - All tracking events use ephemeral/pseudonymous IDs.
 */

export type AnalyticsEventType =
  | 'install'
  | 'first_app_open'
  | 'onboarding_completion'
  | 'account_creation'
  | 'first_conversation'
  | 'first_ai_response'
  | 'message_sent'
  | 'session_start'
  | 'session_end'
  | 'retention_1d'
  | 'retention_7d'
  | 'retention_30d'
  | 'feature_usage'
  | 'voice_usage'
  | 'mood_feature_usage'
  | 'chat_abandonment'
  | 'crash_rate'
  | 'api_failure'
  | 'subscription_conversion';

export interface AnalyticsEvent {
  eventId: string;
  eventType: AnalyticsEventType;
  anonymousUserId: string;
  sessionId: string;
  timestamp: number;
  properties?: Record<string, string | number | boolean | undefined>;
}

export interface AnalyticsAggregateMetrics {
  totalInstalls: number;
  firstAppOpens: number;
  onboardingCompletions: number;
  accountsCreated: number;
  firstConversations: number;
  firstAiResponses: number;
  totalMessagesSent: number;
  totalSessions: number;
  averageMessagesPerSession: number;
  averageSessionDurationSec: number;
  retention1DayPct: number;
  retention7DayPct: number;
  retention30DayPct: number;
  voiceUsageCount: number;
  moodFeatureUsageCount: number;
  chatAbandonmentCount: number;
  totalCrashes: number;
  crashRatePct: number;
  apiFailureCount: number;
  apiSuccessRatePct: number;
  subscriptionConversions: number;
  featureUsageBreakdown: Record<string, number>;
}

const STORAGE_KEYS = {
  ANON_ID: 'soultalk_anon_user_id',
  INSTALL_TIME: 'soultalk_install_timestamp',
  SESSION_ID: 'soultalk_current_session_id',
  SESSION_START: 'soultalk_session_start_time',
  SESSION_MSG_COUNT: 'soultalk_session_msg_count',
  FIRST_CONV_RECORDED: 'soultalk_first_conv_done',
  FIRST_AI_RECORDED: 'soultalk_first_ai_done',
  ONBOARDING_DONE: 'soultalk_onboarding_analytics_done',
  RETENTION_1D: 'soultalk_ret_1d_done',
  RETENTION_7D: 'soultalk_ret_7d_done',
  RETENTION_30D: 'soultalk_ret_30d_done',
  LOCAL_EVENTS_BUFFER: 'soultalk_local_analytics_buffer'
};

class AnalyticsManager {
  private anonymousUserId: string;
  private sessionId: string;
  private sessionStartTime: number;
  private messageCountInSession: number = 0;
  private eventQueue: AnalyticsEvent[] = [];
  private isFlushing: boolean = false;

  constructor() {
    this.anonymousUserId = this.getOrCreateAnonymousId();
    this.sessionId = this.generateId('sess');
    this.sessionStartTime = Date.now();
    this.initSession();
  }

  private generateId(prefix: string): string {
    return `${prefix}_${Math.random().toString(36).substring(2, 9)}_${Date.now().toString(36)}`;
  }

  private getOrCreateAnonymousId(): string {
    let id = localStorage.getItem(STORAGE_KEYS.ANON_ID);
    if (!id) {
      id = this.generateId('anon');
      localStorage.setItem(STORAGE_KEYS.ANON_ID, id);
    }
    return id;
  }

  public initSession() {
    this.sessionId = this.generateId('sess');
    this.sessionStartTime = Date.now();
    this.messageCountInSession = 0;

    // Check Install & First Open
    const installTime = localStorage.getItem(STORAGE_KEYS.INSTALL_TIME);
    if (!installTime) {
      const now = Date.now();
      localStorage.setItem(STORAGE_KEYS.INSTALL_TIME, now.toString());
      this.track('install', { source: 'organic_web_pwa' });
      this.track('first_app_open', { timestamp: now });
    }

    this.track('session_start', {
      deviceCategory: window.innerWidth < 768 ? 'mobile' : 'desktop',
      screenResolution: `${window.innerWidth}x${window.innerHeight}`
    });

    this.checkRetentionMilestones();

    // Hook unhandled errors for crash analytics
    if (typeof window !== 'undefined') {
      window.addEventListener('error', (e) => {
        this.trackCrash(e.message || 'Script error', e.filename);
      });
      window.addEventListener('unhandledrejection', (e) => {
        this.trackCrash(e.reason?.message || 'Unhandled Promise Rejection');
      });
    }
  }

  private checkRetentionMilestones() {
    const installTimeStr = localStorage.getItem(STORAGE_KEYS.INSTALL_TIME);
    if (!installTimeStr) return;

    const installTime = parseInt(installTimeStr, 10);
    const daysSinceInstall = (Date.now() - installTime) / (1000 * 60 * 60 * 24);

    if (daysSinceInstall >= 1 && !localStorage.getItem(STORAGE_KEYS.RETENTION_1D)) {
      localStorage.setItem(STORAGE_KEYS.RETENTION_1D, 'true');
      this.track('retention_1d', { daysSinceInstall: Math.floor(daysSinceInstall) });
    }

    if (daysSinceInstall >= 7 && !localStorage.getItem(STORAGE_KEYS.RETENTION_7D)) {
      localStorage.setItem(STORAGE_KEYS.RETENTION_7D, 'true');
      this.track('retention_7d', { daysSinceInstall: Math.floor(daysSinceInstall) });
    }

    if (daysSinceInstall >= 30 && !localStorage.getItem(STORAGE_KEYS.RETENTION_30D)) {
      localStorage.setItem(STORAGE_KEYS.RETENTION_30D, 'true');
      this.track('retention_30d', { daysSinceInstall: Math.floor(daysSinceInstall) });
    }
  }

  /**
   * Main tracking method (Privacy-Guaranteed)
   */
  public track(eventType: AnalyticsEventType, properties?: Record<string, string | number | boolean | undefined>) {
    const event: AnalyticsEvent = {
      eventId: this.generateId('evt'),
      eventType,
      anonymousUserId: this.anonymousUserId,
      sessionId: this.sessionId,
      timestamp: Date.now(),
      properties: properties || {}
    };

    // Store in local buffer
    this.eventQueue.push(event);
    this.saveToLocalBuffer(event);

    // Trigger async non-blocking flush
    this.flush();
  }

  private saveToLocalBuffer(event: AnalyticsEvent) {
    try {
      const existingStr = localStorage.getItem(STORAGE_KEYS.LOCAL_EVENTS_BUFFER);
      const list: AnalyticsEvent[] = existingStr ? JSON.parse(existingStr) : [];
      list.push(event);
      // Keep last 100 events in local storage
      if (list.length > 100) list.shift();
      localStorage.setItem(STORAGE_KEYS.LOCAL_EVENTS_BUFFER, JSON.stringify(list));
    } catch {
      // Storage quota or privacy sandbox fallback
    }
  }

  public async flush() {
    if (this.isFlushing || this.eventQueue.length === 0) return;
    this.isFlushing = true;

    const batch = [...this.eventQueue];
    this.eventQueue = [];

    try {
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: batch })
      });
    } catch {
      // Re-queue on network failure
      this.eventQueue.unshift(...batch);
    } finally {
      this.isFlushing = false;
    }
  }

  // Specialized High-Leverage Lifecycle Trackers
  public trackOnboardingCompletion(chosenCompanion: string, stepCount: number) {
    if (!localStorage.getItem(STORAGE_KEYS.ONBOARDING_DONE)) {
      localStorage.setItem(STORAGE_KEYS.ONBOARDING_DONE, 'true');
      this.track('onboarding_completion', { chosenCompanion, stepCount });
    }
  }

  public trackAccountCreation(authMethod: 'email' | 'google' | 'guest') {
    this.track('account_creation', { authMethod });
  }

  public trackMessageSent(length: number, isVoice: boolean = false) {
    this.messageCountInSession += 1;
    this.track('message_sent', {
      lengthBucket: length < 50 ? 'short' : length < 200 ? 'medium' : 'long',
      isVoice,
      messagesInCurrentSession: this.messageCountInSession
    });

    if (!localStorage.getItem(STORAGE_KEYS.FIRST_CONV_RECORDED)) {
      localStorage.setItem(STORAGE_KEYS.FIRST_CONV_RECORDED, 'true');
      this.track('first_conversation', { isVoice });
    }
  }

  public trackSuccessfulAiResponse(latencyMs: number, ragExemplarsCount: number, emotion: string) {
    if (!localStorage.getItem(STORAGE_KEYS.FIRST_AI_RECORDED)) {
      localStorage.setItem(STORAGE_KEYS.FIRST_AI_RECORDED, 'true');
      this.track('first_ai_response', { latencyMs, emotion });
    }
    this.track('feature_usage', {
      feature: 'ai_response_generation',
      latencyBucketMs: latencyMs < 1000 ? '<1s' : latencyMs < 3000 ? '1-3s' : '>3s',
      ragExemplarsCount,
      emotion
    });
  }

  public trackFeatureUsage(featureName: string, meta?: Record<string, string | number | boolean>) {
    this.track('feature_usage', { feature: featureName, ...(meta || {}) });
  }

  public trackVoiceUsage(mode: 'stt_mic' | 'tts_playback', durationSec: number = 0) {
    this.track('voice_usage', { mode, durationSec });
  }

  public trackMoodFeatureUsage(action: 'log_entry' | 'weather_view' | 'trend_explore', mood?: string) {
    this.track('mood_feature_usage', { action, mood: mood || 'unknown' });
  }

  public trackChatAbandonment(typedChars: number) {
    if (typedChars > 3) {
      this.track('chat_abandonment', { typedCharsBucket: typedChars < 20 ? 'short' : 'long' });
    }
  }

  public trackApiFailure(endpoint: string, statusCode: number, reason: string) {
    this.track('api_failure', { endpoint, statusCode, reason });
  }

  public trackCrash(errorMsg: string, file?: string) {
    this.track('crash_rate', {
      errorSnippet: errorMsg.substring(0, 100),
      file: file ? file.split('/').pop() : 'unknown'
    });
  }

  public trackSubscriptionConversion(tier: 'free_sanctuary' | 'pro_serenity' | 'lifetime_guardian', price: number) {
    this.track('subscription_conversion', { tier, price });
  }

  public endSession() {
    const durationSec = Math.floor((Date.now() - this.sessionStartTime) / 1000);
    this.track('session_end', {
      durationSec,
      totalMessages: this.messageCountInSession
    });
    this.flush();
  }
}

export const analytics = new AnalyticsManager();
