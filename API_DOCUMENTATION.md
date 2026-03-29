# API Documentation

[http://localhost:3001](http://localhost:3001)

## Endpoints

### GET /api/data
Retrieve all application data from `storage.json`.

**Request:**
```http
GET /api/data HTTP/1.1
Host: localhost:3001
```

**Response (200 OK):**
```json
{
  "currentVersion": "version-id",
  "versions": {
    "v1": {
      "characters": [...],
      "quests": [...],
      "activeQuestId": "quest-id",
      "activeConversationId": "conv-id",
      "name": "Version Name",
      "color": "#f97316",
      "folderPath": "~/.QuestHelper/default/"
    }
  }
}
```

**Error (404 Not Found):**
```json
{
  "error": "No data found"
}
```

---

### POST /api/data
Save all application data to `storage.json`.

**Request:**
```http
POST /api/data HTTP/1.1
Host: localhost:3001
Content-Type: application/json

{
  "currentVersion": "version-id",
  "versions": {
    "v1": {
      "characters": [...],
      "quests": [...],
      "activeQuestId": "quest-id",
      "activeConversationId": "conv-id",
      "name": "Version Name",
      "color": "#f97316",
      "folderPath": "~/.QuestHelper/default/"
    }
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Data saved successfully"
}
```

**Error (500 Internal Server Error):**
```json
{
  "success": false,
  "error": "Failed to save data"
}
```

---

### GET /api/health
Health check endpoint to verify the server is running.

**Request:**
```http
GET /api/health HTTP/1.1
Host: localhost:3001
```

**Response (200 OK):**

```json
{
  "status": "ok"
}
```
---

## CORS Policy

The server includes CORS middleware configured to accept requests from the same origin or the configured origin inside the `.env` file.

*Default configuration allows all origins (`*`).*

If you have any question, please open an issue or contact me for help ! :D