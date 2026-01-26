# Shared Package

This package contains shared TypeScript types, constants, and utilities used by both the Recall web app and Chrome extension.

## Contents

- **types/database.ts** - Database schema types (Profile, Video, Folder, Tag, etc.)
- **types/api.ts** - API request/response types
- **constants/tags.ts** - Tag color constants and detection rules
- **utils/auto-tag.ts** - Auto-tagging utilities for videos
- **utils/youtube.ts** - YouTube URL parsing utilities

## Usage

### In Web App (recall-react-app)

```typescript
import { Video, Folder, detectTags } from "@shared"
```

### In Chrome Extension (recall-chrome-ext)

```typescript
import { Video, Folder, detectTags } from "@shared"
```

## Development

Run type checking:

```bash
npm run typecheck
```
