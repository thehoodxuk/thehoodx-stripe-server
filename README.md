# The Hood-X Store API

A modern e-commerce REST API built with Express.js, TypeScript, Prisma, and Stripe.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js 5.x
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Payments**: Stripe Checkout
- **Authentication**: JWT with HTTP-only cookie refresh tokens
- **Testing**: Vitest + Supertest

## Features

- User authentication (signup, login, refresh tokens, password change)
- Product catalog with filtering, sorting, and pagination
- Category management
- Stripe checkout integration with order management
- Webhook handling for payment confirmation
- Order tracking and history

## Prerequisites

- Node.js 18+
- PostgreSQL database
- Stripe account (for payments)

## Getting Started

### 1. Clone and Install

```bash
git clone <repository-url>
cd thehoodx-stripe-server
npm install
```

### 2. Environment Setup

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/thehoodx?schema=public"

# Server
PORT=8000
FRONTEND_URL=http://localhost:3000

# JWT Secrets (use strong random strings)
JWT_ACCESS_SECRET=your-access-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_SUCCESS_URL=http://localhost:3000/checkout/success?session_id={CHECKOUT_SESSION_ID}
STRIPE_CANCEL_URL=http://localhost:3000/checkout/cancel
```

### 3. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed with sample data (optional)
npm run db:seed
```

### 4. Run the Server

```bash
# Development (with hot reload)
npm run dev

# Production
npm run build
npm start
```

The API will be available at `http://localhost:8000`.

## Scripts

| Command                 | Description                              |
| ----------------------- | ---------------------------------------- |
| `npm run dev`           | Start development server with hot reload |
| `npm run build`         | Compile TypeScript to JavaScript         |
| `npm start`             | Start production server                  |
| `npm test`              | Run tests                                |
| `npm run test:watch`    | Run tests in watch mode                  |
| `npm run test:coverage` | Run tests with coverage report           |
| `npm run db:generate`   | Generate Prisma client                   |
| `npm run db:migrate`    | Run database migrations                  |
| `npm run db:push`       | Push schema changes (dev)                |
| `npm run db:seed`       | Seed database with sample data           |
| `npm run db:studio`     | Open Prisma Studio GUI                   |

## API Endpoints

### Authentication

| Method | Endpoint                    | Auth   | Description          |
| ------ | --------------------------- | ------ | -------------------- |
| POST   | `/api/auth/signup`          | -      | Create account       |
| POST   | `/api/auth/login`           | -      | Login                |
| POST   | `/api/auth/refresh`         | Cookie | Refresh access token |
| POST   | `/api/auth/logout`          | Cookie | Logout               |
| GET    | `/api/auth/me`              | Bearer | Get current user     |
| POST   | `/api/auth/change-password` | Bearer | Change password      |

### Products

| Method | Endpoint                 | Auth | Description                  |
| ------ | ------------------------ | ---- | ---------------------------- |
| GET    | `/api/products`          | -    | List products (with filters) |
| GET    | `/api/products/featured` | -    | Get featured products        |
| GET    | `/api/products/filters`  | -    | Get filter options           |
| GET    | `/api/products/:id`      | -    | Get product details          |

### Categories

| Method | Endpoint                             | Auth | Description           |
| ------ | ------------------------------------ | ---- | --------------------- |
| GET    | `/api/categories`                    | -    | List categories       |
| GET    | `/api/categories/:idOrSlug`          | -    | Get category          |
| GET    | `/api/categories/:idOrSlug/products` | -    | Get category products |

### Checkout

| Method | Endpoint                       | Auth       | Description                 |
| ------ | ------------------------------ | ---------- | --------------------------- |
| POST   | `/api/checkout/create-session` | Bearer     | Create Stripe checkout      |
| GET    | `/api/checkout/session/:id`    | -          | Get checkout session status |
| POST   | `/api/checkout/webhook`        | Stripe Sig | Handle Stripe webhooks      |

### Orders

| Method | Endpoint                         | Auth   | Description                 |
| ------ | -------------------------------- | ------ | --------------------------- |
| GET    | `/api/orders`                    | Bearer | Get user's orders           |
| GET    | `/api/orders/:id`                | Bearer | Get order by ID             |
| GET    | `/api/orders/session/:sessionId` | Bearer | Get order by Stripe session |
| PATCH  | `/api/orders/:id/status`         | Bearer | Update order status (admin) |

### Health

| Method | Endpoint      | Description  |
| ------ | ------------- | ------------ |
| GET    | `/api/health` | Health check |

## Checkout Flow

```
1. User adds items to cart (frontend)
2. User submits shipping info → POST /api/checkout/create-session
3. Backend creates Order (PENDING) + Stripe session
4. Frontend redirects to Stripe Checkout
5. User completes payment
6. Stripe webhook → Order status: PROCESSING
7. Success page shows order confirmation
```

## Project Structure

```
├── prisma/
│   ├── schema.prisma      # Database schema
│   ├── seed.ts            # Seed data
│   └── migrations/        # Database migrations
├── src/
│   ├── server.ts          # Express app entry
│   ├── controllers/       # Request handlers
│   ├── services/          # Business logic
│   ├── repos/             # Database operations
│   ├── routes/            # Route definitions
│   ├── middleware/        # Auth, error handling
│   ├── lib/               # Utilities
│   └── generated/         # Prisma generated client
├── tests/                 # Test files
├── API_DOCUMENTATION.md   # Full API docs
└── README.md
```

## Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# With coverage
npm run test:coverage
```

## Stripe Webhook Setup

For local development, use Stripe CLI:

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:8000/api/checkout/webhook
```

Copy the webhook signing secret to your `.env` file.

## Documentation

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete API documentation with request/response examples and frontend integration guide.

## License

MIT
