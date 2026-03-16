# TwoVerse – YuvaVichu Edition (Phase 2)

## Current State
Fresh build. No existing code. Previous build failed.

## Requested Changes (Diff)

### Add
- Full user auth with Google Identity via authorization component; max 3 accounts; invite code gating
- Group chat (3-member): messages right=self, left=others; emoji reactions (real-time for all); "Save to Memory" per message
- Bond Analytics: daily metrics per member (Mood, Energy, Communication Satisfaction, Happiness 1–10); weekly mood trend charts; monthly bond stability charts; emotional fluctuation reports; AI-style insight text
- Couple/Trio Missions: weekly challenges requiring all 3 members to confirm completion; XP points, milestone badges, mission history
- Anniversary & Milestone Tracker: days together counter; countdown to next anniversary; monthly milestone markers
- Time Capsule Messages: create messages that unlock at a future date; all 3 members can view unlocked capsules
- Digital Scrapbook: scrollable collage of shared photos, captions, short notes; each member can add/edit entries; backed by blob-storage
- Custom Quiz System: 4 question categories (Personality, Preferences, Memories, Lifestyle); members can add custom questions; both answer; compatibility score per category
- Daily Prompts & Emotional Check-in: rotating prompts (relationship questions, appreciation, bonding ideas, reflections); emotion input (Happy, Calm, Stressed, Tired, Excited, Sad); group emotional summary
- Settings: invite code management, relationship start date, passkey toggle
- Design: white background, soft pink animated particles, smooth transitions, mobile-first

### Modify
- N/A (fresh build)

### Remove
- N/A

## Implementation Plan
1. Use `authorization` component for Google Identity login and role/user management
2. Use `blob-storage` component for scrapbook photo uploads
3. Backend canister:
   - User registry (max 3, invite code validation)
   - Chat: messages, emoji reactions, save-to-memory flag
   - Bond analytics: daily metric entries, aggregation queries
   - Missions: weekly mission definitions, per-member completion, XP/badges
   - Anniversary: relationship start date storage, milestone logic
   - Time capsule: message + unlock date, reveal logic
   - Scrapbook: entries (caption, note, blob ref)
   - Quiz: question bank, member answers, compatibility score calc
   - Daily prompts: rotating prompt storage; daily emotional check-in per member
   - Settings: invite code CRUD
4. Frontend:
   - Auth/registration flow with invite code
   - Bottom nav: Home, Chat, Memories, Missions, More
   - Dashboard: days together, today's prompt, group mood summary
   - Chat page: 3-member group chat with reactions and save-to-memory
   - Bond Analytics page: charts (recharts), insight text
   - Missions page: active missions, completion flow, XP tracker
   - Anniversary page: counter + milestones
   - Time Capsule page: create/view capsules
   - Scrapbook page: photo collage with upload
   - Quiz page: answer questions, view compatibility scores
   - Check-in / Prompts page: daily emotion + prompt
   - Settings page: invite code, start date, passkey
   - Animated pink particles background
   - Mobile-first, romantic minimal design
