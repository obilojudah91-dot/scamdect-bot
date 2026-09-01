# Production-Grade Telegram Bot

A modern, scalable Telegram bot application with REST API, admin functionality, and support for Telegram Mini Apps.

## Features

- **Telegram Bot Integration**: Full Telegraf-based bot with command handling
- **Interactive Keyboards**: Inline keyboards with callback query support
- **User Management**: Automatic user registration and profile tracking
- **Conversation State**: Multi-step conversation support with expiration
- **REST API**: Fastify-based API with health checks and user endpoints
- **Admin System**: Secure admin functionality with authorization
- **Rate Limiting**: Redis-based rate limiting for API and bot
- **Security**: Input validation, authorization, and error handling
- **Logging**: Structured logging with Pino
- **Testing**: Unit, integration, and security tests with Vitest
- **Database**: PostgreSQL with Prisma ORM
- **Type Safety**: Full TypeScript with strict mode

## Architecture

```
telegram-bot/
│
├── apps/
│   ├── bot/              # Telegram bot application
│   │   └── src/
│   │       ├── commands/ # Bot commands (/start, /help, etc.)
│   │       ├── handlers/ # Callback query handlers
│   │       ├── keyboards/# Inline keyboard layouts
│   │       ├── middleware/# User registration, logging
│   │       ├── conversations/# State management
│   │       └── index.ts
│   │
│   ├── api/              # REST API application
│   │   └── src/
│   │       ├── routes/   # API endpoints
│   │       ├── middleware/# Rate limiting, error handling
│   │       └── server.ts
│   │
│   └── web/              # Telegram Mini App (future)
│
├── packages/
│   ├── database/         # Prisma schema and client
│   ├── shared/           # Shared types, schemas, constants
│   └── config/           # Environment configuration
│
├── tests/
│   ├── unit/             # Unit tests
│   ├── integration/      # Integration tests
│   └── security/         # Security tests
│
└── .env.example
```

## Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- PostgreSQL >= 14
- Redis (optional, for rate limiting)

## Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd telegram-bot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Set up the database**
   ```bash
   npm run db:generate
   npm run db:push
   ```

5. **Run development servers**
   ```bash
   # Bot (uses polling in development)
   npm run dev -- --filter=@telegram-bot/bot

   # API
   npm run dev -- --filter=@telegram-bot/api
   ```

## Environment Variables

See `.env.example` for all required variables:

- `TELEGRAM_BOT_TOKEN`: Your bot token from @BotFather
- `TELEGRAM_WEBHOOK_SECRET`: Secret for webhook verification
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string (optional)
- `ADMIN_TELEGRAM_IDS`: Comma-separated admin Telegram IDs
- `API_URL`: API base URL
- `WEB_APP_URL`: Mini App URL (optional)

## Available Scripts

- `npm run dev` - Run all services in development mode
- `npm run build` - Build all packages
- `npm run test` - Run all tests
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Create and run migrations
- `npm run db:studio` - Open Prisma Studio

## Bot Commands

- `/start` - Start the bot and see the main menu
- `/help` - Show help information
- `/menu` - Display the main menu
- `/profile` - View your profile
- `/history` - View your activity history
- `/settings` - Configure your settings

## API Endpoints

### Health
- `GET /health` - Health check
- `GET /readiness` - Readiness check

### User
- `GET /api/users/me` - Get current user profile
- `GET /api/history` - Get user activity history

### Admin (requires admin authorization)
- `GET /api/admin/stats` - Get statistics
- `GET /api/admin/users` - List users (paginated)

### Webhook
- `POST /telegram/webhook` - Telegram webhook endpoint

## Security

- **Authentication**: Telegram ID verification via headers
- **Authorization**: Server-side admin validation
- **Input Validation**: Zod schemas for all inputs
- **Rate Limiting**: Redis-based rate limiting
- **Error Handling**: User-friendly errors, no stack traces
- **Secrets**: Never committed, validated at startup

## Testing

```bash
# Run all tests
npm test

# Run unit tests only
npm test -- tests/unit

# Run integration tests only
npm test -- tests/integration

# Run security tests only
npm test -- tests/security

# Run with coverage
npm test -- --coverage
```

## Deployment

### Bot Deployment

1. Set `NODE_ENV=production`
2. Configure webhook URL
3. Deploy to Railway, Render, or Fly.io
4. Set up PostgreSQL database
5. Configure Redis (optional but recommended)

### API Deployment

1. Set `NODE_ENV=production`
2. Deploy to Railway, Render, or Fly.io
3. Configure CORS for your Mini App domain
4. Set up webhook endpoint

### Database

Recommended providers:
- Supabase
- Neon
- Railway PostgreSQL
- Render PostgreSQL

### Redis

Recommended providers:
- Upstash
- Railway Redis
- Render Redis

## Development

### Adding New Bot Commands

1. Create command in `apps/bot/src/commands/`
2. Register in `setupCommands()`
3. Add keyboard button if needed
4. Write tests

### Adding New API Endpoints

1. Create route in `apps/api/src/routes/`
2. Add authentication/authorization middleware
3. Implement validation with Zod
4. Write integration tests

### Database Changes

1. Update `packages/database/prisma/schema.prisma`
2. Run `npm run db:push` (dev) or `npm run db:migrate` (prod)
3. Regenerate client: `npm run db:generate`

## Monitoring

The application includes structured logging suitable for:
- Datadog
- New Relic
- Sentry
- CloudWatch

Logs include:
- Request ID
- Telegram user ID (where applicable)
- Event type
- Operation duration
- Error category

## License

MIT

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request
