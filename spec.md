# TwoVerse

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- **Authorization system** with max 3 accounts; registration blocked once 3 users exist
- **Invite code** -- a single static invite code required to register; admin sets it
- **Dashboard** -- shows days together since a configurable "start date", both users' names, and today's daily check-in summary
- **Daily check-in** -- each user selects one emotion per day (happy, calm, stressed, tired, excited, sad); stored per user per day
- **Daily emotional prompts** -- one prompt shown per day, rotating from a pre-written list; same prompt for all users
- **Private text chat** -- all logged-in users share one chat room; messages include emoji reactions (users can react to any message with an emoji)
- **Memory vault** -- users can upload photos or write text memories; each memory has a title, optional description, optional photo, and timestamp; all users can view all memories
- **Settings** -- configure the couple's start date and the invite code

### Modify
N/A

### Remove
N/A

## Implementation Plan

### Backend (Motoko)
- User management: max 3 users, invite code gate on registration
- Store couple start date (settable by any user)
- Daily check-ins: store per user per day (userId, date, emotion)
- Daily prompts: list of ~30 prompts, rotate by day-of-year index
- Chat messages: array of messages (id, authorId, authorName, text, timestamp, reactions map emoji->list of userIds)
- Memory vault: array of memories (id, authorId, title, description, blobId optional, timestamp)
- Blob storage integration for memory photos
- Invite code: stored on canister, updatable by any user

### Frontend (React + TypeScript)
- Auth screens: login, register (with invite code field)
- Bottom nav (mobile-first): Dashboard, Chat, Vault, Prompts
- Dashboard page: days-together counter, today's prompt teaser, both users' check-in status, quick check-in widget
- Chat page: message list, input bar, emoji reaction picker per message
- Memory Vault page: grid of memories, add memory modal (title, description, photo upload)
- Prompts page: today's full prompt + daily check-in emotion selector
- Settings page: update start date, update invite code
- Design: white background, soft pink animated particle canvas, romantic minimal typography, smooth page transitions, fully mobile-friendly
