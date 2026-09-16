# SoulTalk Privacy Policy & Data Governance Specification

**Effective Date:** August 17, 2026  
**Last Updated:** August 17, 2026  
**Applicability:** SoulTalk Web App, Android Application, and API Services

---

## 1. Executive Summary & Privacy Pledge

SoulTalk is designed as an emotionally safe, non-judgmental digital sanctuary. Because emotional wellness reflections and conversations can be deeply vulnerable and personal, **SoulTalk adheres to a strict data-minimization and zero-advertiser monetization philosophy**:

- **We DO NOT sell, rent, or trade your personal data or conversation transcripts to data brokers, advertisers, or third-party marketing firms.**
- **We DO NOT use your private emotional reflections to train publicly exposed generative foundation models without explicit consent.**
- **You own 100% of your data** and retain the right to export or permanently purge your account and conversational records at any time.

---

## 2. Information We Collect

### A. User-Provided Information
1. **Sanctuary Profile**: User name or chosen nickname, email address (optional for guest mode), companion configuration (companion archetype, custom companion name, tone style, language preference).
2. **Emotional Logs & Mood Check-Ins**: Mood ratings, primary emotion tags, journal notes, and mindfulness streak statistics.
3. **Dialogue Inputs**: Messages and voice transcripts exchanged with your companion during active sanctuary sessions.

### B. Automatically Collected Diagnostic Data
1. **Uptime & Performance Telemetry**: Aggregated, non-identifying crash logs and request latencies to maintain service availability.
2. **Network Security Headers**: Ephemeral IP addresses utilized solely for real-time DDoS protection and sliding-window rate limiting (120 req/min).

---

## 3. Purpose & Legal Basis of Processing

| Category of Data | Processing Purpose | Legal Basis (GDPR/CCPA) |
| :--- | :--- | :--- |
| **Chat Transcripts & Moods** | Real-time generation of empathetic conversational holding and psychoeducational coping grounding. | Performance of Service / User Consent |
| **Profile Preferences** | Customizing companion personality, language (English / Roman Marathi / Hindi), and speech voice settings. | Legitimate Interest / User Choice |
| **Crisis Keyword Signals** | Real-time safety interception to present emergency helpline resources (Tele MANAS, AASRA, Vandrevala). | Vital Public Safety & Harm Prevention |

---

## 4. Third-Party AI Inference & Data Processors

To deliver empathetic conversational responses, text payloads are securely proxied through backend server APIs to:
- **Inference Engine**: Google Gemini API (via server-side `@google/genai` TypeScript SDK).
- **Processing Scope**: Ephemeral real-time inference using strict prompt framing and safety holding directives.
- **Privacy Guarantees**: API keys and tokens are securely maintained on the server; inputs are processed in isolated transactional sessions.

---

## 5. User Data Rights & Erasure Controls

SoulTalk provides native client-side controls accessible directly in the **Sanctuary Settings & Profile**:

1. **Right of Access & Portability (Export JSON)**:
   - Tap **"Export Sanctuary JSON"** in Profile Settings to instantly download your complete profile, progress stats, and timestamps in standardized JSON format.
2. **Right to Erasure (Delete Account & All Data)**:
   - Tap **"Delete Account & Data"** to immediately and irrevocably purge all local storage, mood logs, companion progress, and account identifiers.
3. **Instant Chat Purge (Clear Conversation)**:
   - Tap the **Trash** icon in the chat screen header to instantly reset and wipe the current conversation history on demand.

---

## 6. Google Play Store Data Safety Declaration

| Data Safety Field | Status / Implementation |
| :--- | :--- |
| **Data Encryption in Transit** | **Yes** (HTTPS / TLS 1.3 encryption across all network calls) |
| **Data Transfer to 3rd-Party Ads** | **No** (Zero advertising tracking or commercial data sales) |
| **User Data Deletion Request** | **Supported** (In-app one-click deletion and web-accessible privacy deletion endpoint) |
| **Target Audience** | General emotional wellness for individuals seeking mindfulness & emotional support |

---

## 7. Important Non-Clinical Disclaimer

SoulTalk is an AI-powered emotional wellness companion and mindfulness software application. **SoulTalk is NOT a healthcare provider, medical doctor, clinical psychiatrist, or licensed psychotherapist.** SoulTalk does not diagnose psychiatric conditions or prescribe medications. In case of acute distress or emergency, please contact national emergency services (e.g., **Tele MANAS: 14416 / 1800-891-4416**, **112**, or **988**).

---

## 8. Privacy Inquiries & Data Protection Contact
For privacy questions, GDPR data controller requests, or formal inquiries:  
📧 **Email:** privacy@soultalk.app  
🌐 **Website:** https://soultalk.app
