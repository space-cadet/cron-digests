# Integrated Code Rules and Memory Bank Bootstrap

*Last Updated: 2026-05-11*

## Bootstrap Purpose

This bootstrap file serves as the "kernel" of the Memory Bank system for the cron-digest project. It contains the core command definitions and fundamental structure that any agent must recognize immediately upon engaging with this system.

## Command Definitions

### Memory Management Commands

| Command | Parameters | Description |
|---------|------------|-------------|
| `read_mb` | None | Load Critical tier files needed for current task |
| `read_mb [file1] [file2]` | File names | Load specific files only |
| `read_mb standard` | None | Load Critical + Essential tiers |
| `read_mb complete` | None | Load all Memory Bank files |
| `update_mb [file1] [file2]` | File names | Update specific files with minimal changes |
| `update_mb` | None | Update only files with meaningful changes |

### Session Management Commands

| Command | Parameters | Description |
|---------|------------|-------------|
| `continue_session` | None | Flag this as a continuation; prioritize activeContext.md |
| `complete_session` | None | Mark session as complete, update necessary docs |
| `cache_session` | None | Create continuation point with minimal updates |
| `start_session` | None | Begin new session with fresh timestamp |

## Knowledge Management Tiers

1. **Bootstrap Tier (Always Read First)**
   - `bootstrap.md` — Core command definitions and system structure

2. **Critical Tier (Default Read)**
   - `activeContext.md` — Current state, focus, and cross-references
   - `progress.md` — Status tracking and next priorities

3. **Essential Tier (Read on Demand)**
   - `projectbrief.md` — Core requirements and project scope

## Core Implementation Behavior

When engaging with this Memory Bank:

1. Bootstrap file (this document) is processed first
2. Load `activeContext.md` for current state
3. Load `progress.md` for task status
4. Load `projectbrief.md` if deep context needed
5. Update files only with explicit approval

## Session System

This project uses a lightweight session model:
- No time-stamped session logs (overkill for this project)
- `activeContext.md` tracks current focus
- `progress.md` tracks completion status
- Update these files at session end if meaningful changes occurred

## Documentation Decision Framework

| Change Type | Documentation Requirements |
|-------------|----------------------------|
| New cron job or schedule change | Update `projectbrief.md`, `progress.md` |
| Archive format change | Update `projectbrief.md` |
| Bug fix or error | Update `progress.md` Known Issues |
| Routine digest generation | No documentation update needed |

## Note

This is a lightweight Memory Bank for a focused project. Keep it simple. Update only when something meaningful changes.
