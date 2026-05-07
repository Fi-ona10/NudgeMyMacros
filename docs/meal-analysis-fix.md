# Meal Analysis Fix

## Issue

The app frontend loaded successfully, but uploading a meal image failed with a generic message:

```text
Sorry, something went wrong analysing your meal. Try again!
```

The browser showed a `500 Internal Server Error` from:

```text
http://localhost:3001/api/meal/analyse
```

Initially, the frontend did not expose the backend's detailed error message, so the visible error was not specific enough to diagnose the root cause.

## Root Causes

- The backend was using older Gemini model names that were not available for the configured API key.
- The frontend was sending only the raw base64 payload, while the backend always treated the image as `image/jpeg`.
- If the uploaded image was not actually JPEG, Gemini could reject the image because the MIME type was incorrect.
- The backend returned only a generic `Failed to analyse meal` response for meal-analysis failures.
- The frontend ignored the backend `detail` field and displayed only a generic fallback message.

## Changes Made

### Backend

Updated Gemini model usage in:

```text
backend/src/services/vision.ts
backend/src/services/nudge.ts
```

The model was updated to:

```text
gemini-2.5-flash
```

Improved image parsing in:

```text
backend/src/services/vision.ts
```

The backend now extracts the MIME type from a data URL such as:

```text
data:image/png;base64,...
```

and sends the correct `mimeType` to Gemini instead of always using `image/jpeg`.

Improved backend error responses in:

```text
backend/src/routes/meal.ts
```

The `/api/meal/analyse` endpoint now returns a `detail` field when analysis fails.

### Frontend

Updated upload handling in:

```text
frontend/src/components/NudgeChat.tsx
```

The frontend now sends the full data URL instead of stripping the prefix before sending the image to the backend.

The frontend also now reads `data.detail` from failed backend responses and shows the actual error message in the app.

## Files Changed

```text
backend/src/routes/meal.ts
backend/src/services/nudge.ts
backend/src/services/vision.ts
frontend/src/components/NudgeChat.tsx
```

## Security Note

The backend `.env` file contains API keys and is intentionally ignored by Git. It was not committed or pushed.

If real API keys were exposed outside the local environment, especially a Supabase service role key, they should be rotated in the provider dashboards.
