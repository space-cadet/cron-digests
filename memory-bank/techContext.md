# Technical Context

*Last Updated: 2026-05-12*

## Technology Stack

### Core Technologies
- **GitHub Pages**: Static site hosting for digest viewer
- **GitHub Actions**: CI/CD for automated testing (planned)
- **GitHub CLI (`gh`)**: Repository management and authentication
- **OpenClaw**: Agent runtime and cron scheduling
- **Node.js**: Database-native workflow (sql.js)

### Database-Native Workflow
- **sql.js**: WASM SQLite for in-memory database operations
- **lib/inserts.js**: 8 atomic write functions
- **lib/regenerate.js**: 3 markdown generators (DB → text)
- **lib/workflow.js**: Single `recordSessionWork()` call replaces 8-step manual workflow
- **Performance**: 2ms vs ~5 min manual process
- **Tests**: 60-check integration test suite, all passing

## Development Setup

### Prerequisites
- GitHub CLI authenticated as `space_cadet`
- Telegram channel enabled (user 849773381)
- OpenClaw with cron plugin enabled

### Database Workflow Setup
```bash
cd memory-bank/database/
npm install
npm test  # Run 60-check integration test suite
```

## Project Structure

```
cron-digests/
├── arxiv/                  # arXiv paper digests
├── web-science/            # Web science news digests
├── viewer/                 # Web viewer (GitHub Pages)
├── memory-bank/            # Project memory bank
│   ├── database/           # Database-native workflow
│   │   ├── lib/
│   │   │   ├── inserts.js      # 8 atomic write functions
│   │   │   ├── regenerate.js   # 3 markdown generators
│   │   │   ├── workflow.js     # Single recordSessionWork() call
│   │   │   └── sqlite.js       # sql.js wrapper
│   │   ├── schema.sql          # Phase A schema
│   │   ├── init-schema.js      # Schema initialization
│   │   ├── test-workflow.js    # 60-check test suite
│   │   └── package.json
│   ├── activeContext.md
│   ├── progress.md
│   ├── projectbrief.md
│   ├── tasks.md
│   └── templates/
├── digest-schema.md        # Unified digest framework
├── tags.json               # Tag registry
└── README.md
```

## Dependencies

### Runtime
- OpenClaw Gateway (for cron scheduling)
- Telegram channel (for digest delivery)
- GitHub Pages (for viewer hosting)

### Development
- Node.js >= 16
- sql.js ^1.13.0

## Build & Test

### Database Workflow
```bash
cd memory-bank/database
npm test
```

### Viewer
Static HTML/CSS/JS — no build step required. Served via GitHub Pages.

## Deployment

### GitHub Pages
- Source: `viewer/` directory on `main` branch
- URL: `https://space-cadet.github.io/cron-digests/viewer/`

### Cron Jobs
- Scheduled via OpenClaw Gateway
- arXiv: 7:11 AM IST, Mon–Fri
- Web Science: 10:17 AM IST, Mon–Fri

## Environment Variables

None required. All configuration is via:
- OpenClaw cron job definitions
- GitHub repository settings
- Telegram channel configuration

## Notes

- Database-native workflow uses in-memory SQLite (sql.js) — no persistent DB server needed
- All markdown files are generated from database state
- Test suite validates full roundtrip: DB → markdown → DB
