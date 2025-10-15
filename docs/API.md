# 📚 FindYourPeace - API Documentation

## Base URL

**Development:** `http://localhost:8000`  
**Production:** `https://api.findyourpeace.example`

---

## Authentication

**Current Version:** No authentication required (anonymous access)

**Future:** Optional OAuth2 bearer tokens for personalized features

---

## Endpoints

### 1. Health Check

**GET** `/health`

Check API health and status.

**Response 200:**
```json
{
  "status": "healthy",
  "timestamp": "2025-10-14T12:00:00.000Z",
  "dataset_loaded": 10,
  "total_verses": 100
}
```

**cURL Example:**
```bash
curl http://localhost:8000/health
```

---

### 2. Get Root Info

**GET** `/`

Get API information and available endpoints.

**Response 200:**
```json
{
  "name": "FindYourPeace API",
  "version": "1.0.0",
  "description": "Quran-based emotional guidance system",
  "endpoints": {
    "feelings": "/api/feelings",
    "verse": "/api/verse",
    "system_prompt": "/api/system-prompt",
    "health": "/health"
  }
}
```

---

### 3. List All Feelings

**GET** `/api/feelings`

Get all available emotional states/conditions.

**Response 200:**
```json
[
  {
    "id": "alone",
    "label": "Alone / Lonely",
    "description": "Feeling isolated, disconnected, or in need of companionship",
    "tags": ["presence", "companionship", "closeness", "connection"],
    "ui_theme": {
      "primary_color": "#557CBA",
      "secondary_color": "#A8C7FA",
      "gradient": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      "ambient_sound": "soft-waves.mp3"
    }
  },
  {
    "id": "depressed",
    "label": "Depressed / Low / Overwhelmed",
    "description": "Feeling burdened, sad, or struggling with life's challenges",
    "tags": ["hardship", "ease", "patience", "relief", "burden"],
    "ui_theme": {
      "primary_color": "#6B7280",
      "secondary_color": "#9CA3AF",
      "gradient": "linear-gradient(135deg, #434343 0%, #000000 100%)",
      "ambient_sound": "gentle-rain.mp3"
    }
  }
  // ... 8 more conditions
]
```

**Fields:**
- `id` (string): Unique identifier for the emotion
- `label` (string): Human-readable label
- `description` (string): Detailed description
- `tags` (array): Related keywords
- `ui_theme` (object): Visual theme configuration

**cURL Example:**
```bash
curl http://localhost:8000/api/feelings
```

---

### 4. Get Verse for Feeling

**POST** `/api/verse`

Get a random verse for a selected emotional state.

**Request Body:**
```json
{
  "feeling_id": "alone",
  "user_id": "optional_user_identifier",
  "exclude_verses": ["50:16", "2:186"]
}
```

**Fields:**
- `feeling_id` (string, required): ID of the selected emotion
- `user_id` (string, optional): User identifier for history tracking
- `exclude_verses` (array, optional): Verse references to exclude (format: "surah:ayah")

**Response 200:**
```json
{
  "feeling": "Alone / Lonely",
  "ayah": "And We have already created man and know what his soul whispers to him, and We are closer to him than his jugular vein.",
  "reference": "Surah Qaf 50:16",
  "surah_name": "Qaf",
  "surah_number": 50,
  "ayah_number": 16,
  "source_url": "https://quran.com/50/16",
  "ui_theme": {
    "primary_color": "#557CBA",
    "secondary_color": "#A8C7FA",
    "gradient": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "ambient_sound": "soft-waves.mp3"
  },
  "timestamp": "2025-10-14T12:00:00.000Z"
}
```

**Response 404:**
```json
{
  "detail": "Feeling 'unknown' not found. Please select another mood."
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:8000/api/verse \
  -H "Content-Type: application/json" \
  -d '{
    "feeling_id": "alone",
    "user_id": "user123",
    "exclude_verses": []
  }'
```

**PowerShell Example:**
```powershell
$body = @{
    feeling_id = "alone"
    user_id = "user123"
    exclude_verses = @()
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/api/verse" `
  -Method Post `
  -ContentType "application/json" `
  -Body $body
```

---

### 5. Get Statistics

**GET** `/api/stats`

Get dataset statistics and metadata.

**Response 200:**
```json
{
  "total_conditions": 10,
  "total_verses": 100,
  "verses_per_condition": {
    "Alone / Lonely": 10,
    "Depressed / Low / Overwhelmed": 10,
    "Grateful / Thankful": 10,
    "Confused / Lost": 10,
    "Frustrated / Angry": 10,
    "Unloved / Worthless": 10,
    "Happy / Joyful": 10,
    "Blessed / Content": 10,
    "Fearful / Anxious": 10,
    "Hopeless / Useless": 10
  },
  "translation": "Sahih International",
  "last_updated": "2025-10-14",
  "verification_source": "https://quran.com"
}
```

**cURL Example:**
```bash
curl http://localhost:8000/api/stats
```

---

### 6. Get System Prompt

**GET** `/api/system-prompt`

Get the structured system prompt for LLM integration.

**Response 200:**
```json
{
  "system_prompt": "You are FindYourPeace, a Quran-based emotional guidance companion...",
  "version": "1.0.0",
  "last_updated": "2025-10-14"
}
```

**cURL Example:**
```bash
curl http://localhost:8000/api/stats
```

---

## Error Responses

All endpoints may return these standard error responses:

### 400 Bad Request
```json
{
  "detail": "Invalid request format"
}
```

### 404 Not Found
```json
{
  "detail": "Resource not found"
}
```

### 422 Validation Error
```json
{
  "detail": [
    {
      "loc": ["body", "feeling_id"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

### 500 Internal Server Error
```json
{
  "detail": "Internal server error"
}
```

---

## Rate Limiting

**Current:** No rate limiting (development)

**Production Recommendation:**
- 100 requests per minute per IP
- 1000 requests per hour per IP

**Headers (Future):**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1634567890
```

---

## CORS Configuration

**Allowed Origins (Development):**
- `http://localhost:3000`
- `http://localhost:5173`

**Production:** Configure based on deployed frontend domain

**Headers:**
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

---

## Data Models

### Condition Model

```typescript
interface Condition {
  id: string;
  label: string;
  description: string;
  tags: string[];
  ui_theme: {
    primary_color: string;
    secondary_color: string;
    gradient: string;
    ambient_sound: string;
  };
}
```

### Verse Model

```typescript
interface Verse {
  ayah_text: string;
  surah_name: string;
  surah_number: number;
  ayah_number: number;
  source_url: string;
  verified_at: string;
}
```

### Verse Response Model

```typescript
interface VerseResponse {
  feeling: string;
  ayah: string;
  reference: string;
  surah_name: string;
  surah_number: number;
  ayah_number: number;
  source_url: string;
  ui_theme: UITheme;
  timestamp: string;
}
```

---

## WebSocket Support (Future)

**Endpoint:** `ws://localhost:8000/ws`

**Use Cases:**
- Real-time verse updates
- Live emotional state tracking
- Push notifications

**Message Format:**
```json
{
  "type": "verse_update",
  "data": {
    "feeling": "alone",
    "verse": {...}
  }
}
```

---

## Interactive API Documentation

FastAPI provides interactive API documentation:

- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

These interfaces allow you to:
- View all endpoints
- Test API calls directly
- See request/response schemas
- Download OpenAPI specification

---

## SDK Examples

### JavaScript/TypeScript

```typescript
import axios from 'axios';

const API_BASE = 'http://localhost:8000/api';

class FindYourPeaceAPI {
  async getFeelings() {
    const response = await axios.get(`${API_BASE}/feelings`);
    return response.data;
  }

  async getVerse(feelingId: string, userId?: string, excludeVerses?: string[]) {
    const response = await axios.post(`${API_BASE}/verse`, {
      feeling_id: feelingId,
      user_id: userId,
      exclude_verses: excludeVerses || []
    });
    return response.data;
  }

  async getStats() {
    const response = await axios.get(`${API_BASE}/stats`);
    return response.data;
  }
}

// Usage
const api = new FindYourPeaceAPI();
const verse = await api.getVerse('alone');
console.log(verse.ayah);
```

### Python

```python
import requests

API_BASE = 'http://localhost:8000/api'

class FindYourPeaceAPI:
    def get_feelings(self):
        response = requests.get(f'{API_BASE}/feelings')
        return response.json()
    
    def get_verse(self, feeling_id, user_id=None, exclude_verses=None):
        payload = {
            'feeling_id': feeling_id,
            'user_id': user_id,
            'exclude_verses': exclude_verses or []
        }
        response = requests.post(f'{API_BASE}/verse', json=payload)
        return response.json()
    
    def get_stats(self):
        response = requests.get(f'{API_BASE}/stats')
        return response.json()

# Usage
api = FindYourPeaceAPI()
verse = api.get_verse('alone')
print(verse['ayah'])
```

---

## Versioning

**Current Version:** v1.0.0

**Future Versions:**
- API versioning via URL path: `/v2/api/verse`
- Header-based versioning: `API-Version: 2.0`

---

## Support & Contact

- **Issues:** GitHub Issues
- **Documentation:** https://docs.findyourpeace.example
- **Email:** api-support@findyourpeace.example

---

**All verses are from Sahih International translation, verified against Quran.com. 🕊️**
