# TwoVerse

## Current State
Login requires Internet Identity (II) for authentication, plus an invite code for new users joining. The backend uses the II `caller` principal to identify users and gate all API calls via an authorization mixin.

## Requested Changes (Diff)

### Add
- Simple passkey login screen: user enters their Name + passkey "3275" to access the app
- A locally-generated random `sessionId` (UUID stored in localStorage) used as the user's unique identity across sessions
- Backend `registerUser(sessionId, name, passkey)` function that validates passkey and stores user profile
- All backend calls use `sessionId: Text` param to identify the caller instead of II principal
- `useLocalAuth` hook: manages name/sessionId in localStorage, exposes `login(name, passkey)` and `logout()`

### Modify
- Backend: remove Internet Identity / authorization mixin requirement; replace `caller`-based identity with `sessionId: Text` parameter on all functions
- Backend: passkey hardcoded as "3275"; registration open to anyone with correct passkey (max 3 users)
- AuthPage: replace II login + invite code flow with a single form: Name + Passkey fields + "Enter TwoVerse" button
- App.tsx: replace `useInternetIdentity` + `RegistrationGate` with `useLocalAuth`; show AuthPage if no valid session in localStorage
- All pages/hooks that call `actor.*` functions: pass `sessionId` as first parameter

### Remove
- Internet Identity login button and flow
- Invite code field and validation
- `useInternetIdentity` hook usage in App.tsx and AuthPage
- Authorization mixin from backend (no longer needed)
- "Session expired" banner referencing invite code

## Implementation Plan
1. Regenerate backend: replace caller-based auth with sessionId param, add passkey validation, keep all existing features (chat, memories, check-ins, etc.)
2. Update `useLocalAuth` hook for localStorage session management
3. Rewrite `AuthPage` with simple name + passkey form
4. Update `App.tsx` to use `useLocalAuth` instead of `useInternetIdentity`
5. Update all hooks/pages that call actor functions to pass sessionId
