# Technical Context

*Last Updated: 2026-08-26 10:46 IST*

## Technology Stack

### Core Technologies
- **Apache/self-hosted server**: Primary static site hosting at `quantumofgravity.com/cron-digests/`
- **GitHub Pages**: Backup static deployment
- **GitHub Actions**: Validation, index rebuild, and backup Pages deployment
- **GitHub CLI (`gh`)**: Repository management and authentication
- **OpenClaw**: Agent runtime and cron scheduling
- **Node.js**: Digest generation, validation, indexing, and database-native workflow (sql.js)

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
├── viewer/                 # Web viewer (self-hosted primary; Pages backup)
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
- Apache server and `quantumofgravity` account (primary viewer hosting)
- GitHub Pages (backup viewer hosting)

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
Static HTML/CSS/JS — no build step required. The viewer loads `index.json` with a timestamp query and `cache: 'no-store'`; versioned bundles are required because of Cloudflare caching.

## Deployment

### GitHub Pages
- Source: `viewer/` directory on `main` branch
- URL: `https://space-cadet.github.io/cron-digests/viewer/`

### Cron Jobs
- Scheduled via OpenClaw Gateway
- arXiv: 7:11 AM IST, Mon–Fri
- Web Science: 10:17 AM IST, Mon–Fri
- Moltbook research: 08:30 AM IST daily
- Moltbook personal: 22:00 IST daily

## Moltbook Integration

- `scripts/moltbook-client.mjs` is shared by the personal and research jobs.
- It loads credentials from `~/.openclaw/moltbook-env.sh`, validates the API origin, and uses `/submolts/{name}/feed`.
- Research stores private raw API snapshots under `~/.openclaw/logs/moltbook-research-data/` before writing the public digest.

## Deployment

- Primary: `bash scripts/deploy-live.sh`
- Target: `/home/quantumofgravity/public_html/cron-digests/`
- The script locks concurrent deployments, rebuilds `viewer/index.json`/`index.db`, validates digests, rsyncs the viewer, and verifies the target.
- GitHub Actions continues to deploy Pages as the backup path.

## Environment Variables

No project-local environment variables are required. All configuration is via:
- OpenClaw cron job definitions
- GitHub repository settings
- `~/.openclaw/moltbook-env.sh` for the private Moltbook API key
- Telegram channel configuration

## Notes

- Database-native workflow uses in-memory SQLite (sql.js) — no persistent DB server needed
- All markdown files are generated from database state
- Test suite validates full roundtrip: DB → markdown → DB
