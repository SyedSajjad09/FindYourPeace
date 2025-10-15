# 🏗️ FindYourPeace - System Architecture

## Overview

FindYourPeace is a full-stack web application that delivers Quranic guidance based on user emotional states. The architecture prioritizes authenticity, simplicity, and user privacy.

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         User Device                          │
│                    (Browser / Mobile)                        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ HTTPS
                         │
┌────────────────────────▼────────────────────────────────────┐
│                    Frontend Layer                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  React Application (Vite)                            │  │
│  │  - Emotion selector UI                               │  │
│  │  - Verse display with animations                     │  │
│  │  - LocalStorage for history                          │  │
│  │  - Responsive design (mobile/desktop)                │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ REST API (JSON)
                         │
┌────────────────────────▼────────────────────────────────────┐
│                     Backend Layer                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  FastAPI Application                                  │  │
│  │  - RESTful endpoints                                  │  │
│  │  - CORS middleware                                    │  │
│  │  - Request validation (Pydantic)                      │  │
│  │  - Error handling                                     │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Verse Selection Service                              │  │
│  │  - Smart randomization                                │  │
│  │  - History-aware filtering                            │  │
│  │  - Repetition avoidance                               │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ File I/O
                         │
┌────────────────────────▼────────────────────────────────────┐
│                      Data Layer                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  dataset.json                                         │  │
│  │  - 10 emotional conditions                            │  │
│  │  - 100 verified verses (10 per condition)            │  │
│  │  - Metadata (translation, sources, verification)     │  │
│  │  - UI themes per condition                            │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Component Details

### 1. Frontend Layer (React + Vite)

**Responsibilities:**
- User interface for emotion selection
- Verse display with smooth animations
- Client-side history management
- API communication
- Responsive design for all devices

**Key Components:**
- `App.jsx` - Main application component
- `api.js` - API client service
- `App.css` - Comprehensive styling with animations

**Technology Stack:**
- React 18.2 (UI library)
- Vite (Build tool & dev server)
- Axios (HTTP client)
- CSS3 (Styling & animations)

**State Management:**
- React hooks (useState, useEffect)
- LocalStorage for persistence

---

### 2. Backend Layer (FastAPI)

**Responsibilities:**
- RESTful API endpoints
- Request validation
- Business logic
- Verse selection algorithm
- History tracking
- Error handling

**Key Endpoints:**

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/health` | GET | Health check |
| `/api/feelings` | GET | List all emotions |
| `/api/verse` | POST | Get verse for emotion |
| `/api/stats` | GET | Dataset statistics |
| `/api/system-prompt` | GET | LLM system prompt |

**Technology Stack:**
- FastAPI (Web framework)
- Uvicorn (ASGI server)
- Pydantic (Data validation)
- Python 3.9+

---

### 3. Data Layer

**Structure:**

```json
{
  "metadata": {
    "version": "1.0.0",
    "total_conditions": 10,
    "total_verses": 100,
    "translation": "Sahih International"
  },
  "conditions": [
    {
      "id": "alone",
      "label": "Alone / Lonely",
      "description": "...",
      "tags": [...],
      "ui_theme": {...},
      "verses": [
        {
          "ayah_text": "...",
          "surah_name": "...",
          "surah_number": 50,
          "ayah_number": 16,
          "source_url": "https://quran.com/50/16",
          "verified_at": "2025-10-14"
        }
      ]
    }
  ]
}
```

**Data Integrity:**
- All verses verified against Quran.com
- Source URLs for transparency
- Verification timestamps
- Structured metadata

---

## Verse Selection Algorithm

```python
def select_verse(feeling_id, user_id, exclude_verses):
    """
    Smart verse selection with history awareness
    
    Algorithm:
    1. Load condition by feeling_id
    2. Get user's recent verse history (last 3)
    3. Filter out recently shown verses
    4. If all verses excluded, reset pool
    5. Randomly select from available pool
    6. Update user history
    7. Return verse with metadata
    """
    
    # Step 1: Find condition
    condition = find_condition(feeling_id)
    
    # Step 2: Get history
    recent = get_user_history(user_id, feeling_id)
    
    # Step 3: Filter
    available = [v for v in condition.verses 
                 if v.reference not in recent]
    
    # Step 4: Reset if needed
    if not available:
        available = condition.verses
        clear_history(user_id, feeling_id)
    
    # Step 5: Random selection
    verse = random.choice(available)
    
    # Step 6: Update history (keep last 3)
    update_history(user_id, feeling_id, verse)
    
    # Step 7: Return
    return format_response(verse, condition)
```

**Key Features:**
- Avoids repetition (last 3 verses)
- Deterministic seeding option
- Fallback to full pool when needed
- Per-user, per-emotion history

---

## Data Flow

### User Selects Emotion

```
┌─────────┐
│  User   │  Selects "Feeling Alone"
└────┬────┘
     │
     ▼
┌─────────────────┐
│   Frontend      │  POST /api/verse
│                 │  {feeling_id: "alone"}
└────┬────────────┘
     │
     ▼
┌─────────────────┐
│   API Gateway   │  Validate request
└────┬────────────┘
     │
     ▼
┌─────────────────┐
│ Verse Service   │  1. Load condition
│                 │  2. Check history
│                 │  3. Filter verses
│                 │  4. Random select
└────┬────────────┘
     │
     ▼
┌─────────────────┐
│  dataset.json   │  Read verse data
└────┬────────────┘
     │
     ▼
┌─────────────────┐
│   Response      │  {
│                 │    feeling: "Alone / Lonely",
│                 │    ayah: "And We have already...",
│                 │    reference: "Surah Qaf 50:16"
│                 │  }
└────┬────────────┘
     │
     ▼
┌─────────────────┐
│   Frontend      │  1. Display verse
│                 │  2. Apply theme
│                 │  3. Animate
│                 │  4. Update history
└─────────────────┘
```

---

## Security Architecture

### Authentication & Authorization
- **Current:** Anonymous access (no auth required)
- **Future:** Optional OAuth2 for personalization

### Data Privacy
- ✅ No personal data collection
- ✅ Client-side history only
- ✅ No tracking or analytics
- ✅ GDPR compliant by design

### Security Measures
- CORS configuration
- Input validation (Pydantic)
- Rate limiting (production)
- HTTPS enforcement (production)
- CSP headers (production)

---

## Scalability Considerations

### Current Capacity
- **Static dataset:** No database bottleneck
- **Stateless API:** Horizontally scalable
- **Client-side history:** No server storage

### Future Enhancements

1. **Caching Layer:**
   ```
   Frontend → CDN → API Gateway → Redis → Backend
   ```

2. **Database Migration:**
   ```
   dataset.json → MongoDB/PostgreSQL
   - Versioning
   - Dynamic updates
   - Advanced queries
   ```

3. **Microservices:**
   ```
   - Verse Service
   - User Service
   - Analytics Service
   - Recommendation Service
   ```

---

## Deployment Architecture

### Development
```
Local Machine
├── Backend: localhost:8000
└── Frontend: localhost:3000
```

### Production (Example)

```
┌──────────────────────────────────────────┐
│           CDN (Cloudflare)               │
│         Static Assets (Frontend)         │
└────────────────┬─────────────────────────┘
                 │
┌────────────────▼─────────────────────────┐
│      Load Balancer (Nginx)               │
└────────────────┬─────────────────────────┘
                 │
        ┌────────┴────────┐
        │                 │
┌───────▼──────┐   ┌──────▼──────┐
│  Backend 1   │   │  Backend 2  │
│  (Docker)    │   │  (Docker)   │
└──────────────┘   └─────────────┘
```

---

## Monitoring & Observability

### Health Checks
- `/health` endpoint
- Response time monitoring
- Error rate tracking

### Logging
- Request/response logs
- Error logs with stack traces
- User action logs (anonymous)

### Metrics (Future)
- Emotions selected (distribution)
- Verses shown (frequency)
- API latency (p50, p95, p99)
- Error rates

---

## Technology Stack Summary

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | React 18 | UI framework |
| Frontend | Vite | Build tool |
| Frontend | Axios | HTTP client |
| Backend | FastAPI | Web framework |
| Backend | Uvicorn | ASGI server |
| Backend | Pydantic | Validation |
| Data | JSON | Dataset storage |
| DevOps | Docker | Containerization |
| DevOps | Docker Compose | Multi-container |

---

## API Response Times (Target)

| Endpoint | Target | Notes |
|----------|--------|-------|
| `/health` | <50ms | No I/O |
| `/api/feelings` | <100ms | Cached |
| `/api/verse` | <200ms | Main flow |
| `/api/stats` | <100ms | Computed once |

---

## Future Architecture Enhancements

1. **Redis for History:**
   - Server-side session storage
   - Faster lookups
   - Distributed caching

2. **PostgreSQL for Dataset:**
   - Relational integrity
   - Advanced queries
   - Version control

3. **LLM Integration:**
   - OpenAI/Anthropic for personalization
   - Context-aware recommendations
   - Natural language mood input

4. **Real-time Features:**
   - WebSocket for live updates
   - Push notifications
   - Collaborative sessions

5. **Analytics Dashboard:**
   - Admin panel
   - Usage statistics
   - Content management

---

**This architecture prioritizes simplicity, authenticity, and scalability while maintaining the spiritual integrity of the content. 🕊️**
