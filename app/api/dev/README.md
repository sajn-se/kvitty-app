# Dev API Endpoints

**⚠️ Development Only**: These endpoints are only available when `NODE_ENV=development`. They will return 403 in production.

## Create Test Notification

**Endpoint**: `POST /api/dev/create-test-notification`

Creates a single test notification for a user.

### Request Body

```json
{
  "userId": "user_123abc",
  "workspaceId": "workspace_456def",
  "type": "test",
  "title": "Test Notification",
  "message": "This is a test message",
  "link": "/workspace/path/to/entity"
}
```

### Fields

- `userId` (required): The ID of the user to receive the notification
- `workspaceId` (required): The ID of the workspace
- `type` (optional): Notification type (default: "test")
- `title` (optional): Notification title (default: "Test Notification")
- `message` (optional): Notification message
- `link` (optional): URL to navigate to when clicking the notification

### Example cURL

```bash
curl -X POST http://localhost:3000/api/dev/create-test-notification \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "your-user-id",
    "workspaceId": "your-workspace-id",
    "title": "Hello from API!",
    "message": "This is a test notification",
    "link": "/workspace/notifikationer"
  }'
```

### Response

```json
{
  "success": true,
  "notification": {
    "id": "notif_123",
    "userId": "user_123abc",
    "workspaceId": "workspace_456def",
    "type": "test",
    "title": "Test Notification",
    "message": "This is a test message",
    "link": "/workspace/path/to/entity",
    "readAt": null,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

---

## Create Bulk Notifications

**Endpoint**: `POST /api/dev/create-bulk-notifications`

Creates multiple test notifications at once (max 50).

### Request Body

```json
{
  "userId": "user_123abc",
  "workspaceId": "workspace_456def",
  "count": 10
}
```

### Fields

- `userId` (required): The ID of the user to receive the notifications
- `workspaceId` (required): The ID of the workspace
- `count` (optional): Number of notifications to create (1-50, default: 10)

### Example cURL

```bash
curl -X POST http://localhost:3000/api/dev/create-bulk-notifications \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "your-user-id",
    "workspaceId": "your-workspace-id",
    "count": 20
  }'
```

### Response

```json
{
  "success": true,
  "created": 20,
  "notifications": [
    {
      "id": "notif_1",
      "title": "Nytt e-postmeddelande #1",
      ...
    },
    ...
  ]
}
```

---

## Usage Tips

### Get Your User ID and Workspace ID

You can find these in your browser's developer console while logged in:

1. Open DevTools (F12)
2. Go to Application/Storage → Local Storage
3. Or check the network requests to find your session data

### Test the Notification System

1. Call one of the endpoints to create notifications
2. Check the notification bell icon in the header (should show a badge)
3. Click the bell to open the popover
4. Navigate to `/[workspaceSlug]/notifikationer` to see the full table

### Common Notification Types

- `test` - Generic test notification
- `comment_mention` - Someone mentioned you in a comment
- `inbox_email` - New email received in workspace inbox
- `invoice_paid` - Invoice payment received
- `payroll_completed` - Payroll run completed

---

## Error Responses

### 403 Forbidden (Production)
```json
{
  "error": "This endpoint is only available in development"
}
```

### 400 Bad Request (Missing Fields)
```json
{
  "error": "userId and workspaceId are required"
}
```

### 400 Bad Request (Invalid Count)
```json
{
  "error": "count must be between 1 and 50"
}
```

### 500 Internal Server Error
```json
{
  "error": "Failed to create notification"
}
```
