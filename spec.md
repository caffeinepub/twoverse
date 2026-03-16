# TwoVerse

## Current State
App has frontend-only passkey login (name + "3275"), but ALL backend features are broken: messages don't send, settings don't save, all features non-functional. Root causes: useActor depends on Internet Identity initialization timing causing actor to be null; no error feedback shown to users.

## Requested Changes (Diff)

### Add
- Error toast notifications for ALL failed backend operations
- Loading overlay while actor initializes

### Modify
- useActor.ts: rewrite to create anonymous actor directly, no II dependency, module-level cache
- App.tsx: show loading state while actor initializing after login
- ChatPage.tsx: add try/catch with error toast in send()
- SettingsPage.tsx: add error toast when save fails
- All feature pages: ensure error handling for backend calls

### Remove
- Nothing

## Implementation Plan
1. Rewrite useActor.ts - anonymous actor, module-level cache, no II dependency
2. Update App.tsx - loading screen while actor null after login
3. Fix ChatPage - error toasts on send failure
4. Fix SettingsPage - error toasts on save failure
5. Fix all other pages - error handling
6. Validate and deploy
