# The Hood-X Store API Documentation

## Base URL

```
Development: http://localhost:8001/api
Production: https://your-api-domain.com/api
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication:

- **Access Token**: Sent in the `Authorization` header
- **Refresh Token**: Stored in HTTP-only cookie (automatically sent with requests)

```
Authorization: Bearer <access_token>
```

> **Important**: All requests must include `credentials: 'include'` to send/receive cookies.

---

## Table of Contents

1. [Authentication](#authentication-endpoints)
2. [Products](#products-endpoints)
3. [Categories](#categories-endpoints)
4. [Checkout](#checkout-endpoints)
5. [Orders](#orders-endpoints)
6. [Admin](#admin-endpoints)
7. [Frontend Integration Guide](#frontend-integration-guide)

---

## Authentication Endpoints

### Sign Up

Create a new user account.

```http
POST /api/auth/signup
```

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (201):**

```json
{
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "USER",
    "createdAt": "2026-03-06T00:00:00.000Z",
    "updatedAt": "2026-03-06T00:00:00.000Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

> **Note**: The refresh token is set as an HTTP-only cookie and is not included in the response body.

**Errors:**

- `400` - Name, email, and password are required / Password must be at least 8 characters
- `409` - Email already in use

---

### Login

Authenticate an existing user.

```http
POST /api/auth/login
```

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**

```json
{
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "USER",
    "createdAt": "2026-03-06T00:00:00.000Z",
    "updatedAt": "2026-03-06T00:00:00.000Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

> **Note**: The refresh token is set as an HTTP-only cookie and is not included in the response body.

**Errors:**

- `400` - Email and password are required
- `401` - Invalid email or password

---

### Get Current User

Get the authenticated user's profile. Returns a fresh access token.

```http
GET /api/auth/me
Authorization: Bearer <access_token>
```

**Response (200):**

```json
{
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "USER",
    "createdAt": "2026-03-06T00:00:00.000Z",
    "updatedAt": "2026-03-06T00:00:00.000Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errors:**

- `401` - Unauthorized (missing or invalid token)
- `404` - User not found

---

### Refresh Token

Get a new access token using the refresh token cookie.

```http
POST /api/auth/refresh
```

> **Note**: No request body needed. The refresh token is read from the HTTP-only cookie.

**Response (200):**

```json
{
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "USER",
    "createdAt": "2026-03-06T00:00:00.000Z",
    "updatedAt": "2026-03-06T00:00:00.000Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

> **Note**: A new refresh token is set as an HTTP-only cookie.

**Errors:**

- `400` - Refresh token is required
- `401` - Invalid or expired refresh token

---

### Logout

Invalidate the refresh token and clear the cookie.

```http
POST /api/auth/logout
```

> **Note**: No request body needed. The refresh token is read from the HTTP-only cookie.

**Response (200):**

```json
{
  "message": "Logged out successfully"
}
```

---

### Change Password

Change the authenticated user's password.

```http
POST /api/auth/change-password
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123"
}
```

**Response (200):**

```json
{
  "message": "Password changed successfully"
}
```

**Errors:**

- `400` - Current and new password are required / New password must be at least 8 characters
- `401` - Current password is incorrect
- `404` - User not found

---

## Products Endpoints

### List Products

Get all products with optional filtering, sorting, and pagination.

```http
GET /api/products
```

**Query Parameters:**

| Parameter | Type    | Description                                                    |
| --------- | ------- | -------------------------------------------------------------- |
| category  | string  | Filter by category slug                                        |
| minPrice  | number  | Minimum price                                                  |
| maxPrice  | number  | Maximum price                                                  |
| sizes     | string  | Comma-separated sizes (e.g., "S,M,L")                          |
| colors    | string  | Comma-separated colors (e.g., "red,blue")                      |
| featured  | boolean | Filter featured products only                                  |
| inStock   | boolean | Filter in-stock products only                                  |
| search    | string  | Search in name and description                                 |
| sort      | string  | Sort order: price-asc, price-desc, name-asc, name-desc, newest |
| page      | number  | Page number (default: 1)                                       |
| limit     | number  | Items per page (default: 20, max: 100)                         |

**Example Request:**

```http
GET /api/products?category=t-shirts&minPrice=20&maxPrice=100&sort=price-asc&page=1&limit=10
```

**Response (200):**

```json
{
  "products": [
    {
      "id": "uuid",
      "name": "Classic T-Shirt",
      "description": "A comfortable cotton t-shirt",
      "price": 29.99,
      "image": "https://example.com/image.jpg",
      "sizes": ["S", "M", "L", "XL"],
      "colors": ["black", "white", "navy"],
      "featured": true,
      "stock": 50,
      "categoryId": "uuid",
      "createdAt": "2026-03-06T00:00:00.000Z",
      "updatedAt": "2026-03-06T00:00:00.000Z",
      "category": {
        "id": "uuid",
        "name": "T-Shirts",
        "slug": "t-shirts",
        "description": "Comfortable cotton t-shirts",
        "image": "https://example.com/category.jpg",
        "createdAt": "2026-03-06T00:00:00.000Z",
        "updatedAt": "2026-03-06T00:00:00.000Z"
      }
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 10,
  "totalPages": 10
}
```

---

### Get Featured Products

Get featured products for homepage display.

```http
GET /api/products/featured
```

**Query Parameters:**

| Parameter | Type   | Description                          |
| --------- | ------ | ------------------------------------ |
| limit     | number | Maximum products to return (default: 6) |

**Response (200):**

```json
{
  "products": [
    {
      "id": "uuid",
      "name": "Featured Product",
      "description": "A premium featured product",
      "price": 49.99,
      "image": "https://example.com/image.jpg",
      "sizes": ["S", "M", "L"],
      "colors": ["black", "white"],
      "featured": true,
      "stock": 25,
      "categoryId": "uuid",
      "createdAt": "2026-03-06T00:00:00.000Z",
      "updatedAt": "2026-03-06T00:00:00.000Z",
      "category": {
        "id": "uuid",
        "name": "T-Shirts",
        "slug": "t-shirts",
        "description": "Comfortable cotton t-shirts",
        "image": "https://example.com/category.jpg",
        "createdAt": "2026-03-06T00:00:00.000Z",
        "updatedAt": "2026-03-06T00:00:00.000Z"
      }
    }
  ]
}
```

---

### Get Product Filters

Get available filter options.

```http
GET /api/products/filters
```

**Response (200):**

```json
{
  "sizes": ["XS", "S", "M", "L", "XL", "XXL"],
  "colors": ["black", "white", "red", "blue", "green"],
  "priceRange": {
    "min": 10,
    "max": 500
  },
  "categories": [
    {
      "id": "uuid",
      "name": "T-Shirts",
      "slug": "t-shirts",
      "description": "Comfortable cotton t-shirts",
      "image": "https://example.com/category.jpg",
      "createdAt": "2026-03-06T00:00:00.000Z",
      "updatedAt": "2026-03-06T00:00:00.000Z"
    }
  ]
}
```

---

### Get Product by ID

Get a single product with related products from the same category.

```http
GET /api/products/:id
```

**Response (200):**

```json
{
  "product": {
    "id": "uuid",
    "name": "Classic T-Shirt",
    "description": "A comfortable cotton t-shirt",
    "price": 29.99,
    "image": "https://example.com/image.jpg",
    "sizes": ["S", "M", "L", "XL"],
    "colors": ["black", "white", "navy"],
    "featured": true,
    "stock": 50,
    "categoryId": "uuid",
    "createdAt": "2026-03-06T00:00:00.000Z",
    "updatedAt": "2026-03-06T00:00:00.000Z",
    "category": {
      "id": "uuid",
      "name": "T-Shirts",
      "slug": "t-shirts",
      "description": "Comfortable cotton t-shirts",
      "image": "https://example.com/category.jpg",
      "createdAt": "2026-03-06T00:00:00.000Z",
      "updatedAt": "2026-03-06T00:00:00.000Z"
    }
  },
  "related": [
    {
      "id": "uuid",
      "name": "Related Product",
      "description": "Another great product",
      "price": 34.99,
      "image": "https://example.com/related.jpg",
      "sizes": ["M", "L"],
      "colors": ["black"],
      "featured": false,
      "stock": 30,
      "categoryId": "uuid",
      "createdAt": "2026-03-06T00:00:00.000Z",
      "updatedAt": "2026-03-06T00:00:00.000Z",
      "category": {
        "id": "uuid",
        "name": "T-Shirts",
        "slug": "t-shirts",
        "description": "Comfortable cotton t-shirts",
        "image": "https://example.com/category.jpg",
        "createdAt": "2026-03-06T00:00:00.000Z",
        "updatedAt": "2026-03-06T00:00:00.000Z"
      }
    }
  ]
}
```

**Errors:**

- `400` - Product ID is required
- `404` - Product not found

---

## Categories Endpoints

### List Categories

Get all categories (sorted alphabetically by name).

```http
GET /api/categories
```

**Response (200):**

```json
{
  "categories": [
    {
      "id": "uuid",
      "name": "T-Shirts",
      "slug": "t-shirts",
      "description": "Comfortable cotton t-shirts",
      "image": "https://example.com/category.jpg",
      "createdAt": "2026-03-06T00:00:00.000Z",
      "updatedAt": "2026-03-06T00:00:00.000Z"
    }
  ]
}
```

---

### Get Category by ID or Slug

Get a single category. You can pass either the UUID or the slug.

```http
GET /api/categories/:idOrSlug
```

**Response (200):**

```json
{
  "category": {
    "id": "uuid",
    "name": "T-Shirts",
    "slug": "t-shirts",
    "description": "Comfortable cotton t-shirts",
    "image": "https://example.com/category.jpg",
    "createdAt": "2026-03-06T00:00:00.000Z",
    "updatedAt": "2026-03-06T00:00:00.000Z"
  }
}
```

**Errors:**

- `400` - Category ID or slug is required
- `404` - Category not found

---

### Get Products by Category

Get products in a specific category with filtering and pagination.

```http
GET /api/categories/:idOrSlug/products
```

**Query Parameters:** Same as [List Products](#list-products) (except `category` — it's determined by the URL param)

**Response (200):**

```json
{
  "category": {
    "id": "uuid",
    "name": "T-Shirts",
    "slug": "t-shirts",
    "description": "Comfortable cotton t-shirts",
    "image": "https://example.com/category.jpg",
    "createdAt": "2026-03-06T00:00:00.000Z",
    "updatedAt": "2026-03-06T00:00:00.000Z"
  },
  "products": [
    {
      "id": "uuid",
      "name": "Classic T-Shirt",
      "description": "A comfortable cotton t-shirt",
      "price": 29.99,
      "image": "https://example.com/image.jpg",
      "sizes": ["S", "M", "L", "XL"],
      "colors": ["black", "white", "navy"],
      "featured": true,
      "stock": 50,
      "categoryId": "uuid",
      "createdAt": "2026-03-06T00:00:00.000Z",
      "updatedAt": "2026-03-06T00:00:00.000Z",
      "category": {
        "id": "uuid",
        "name": "T-Shirts",
        "slug": "t-shirts",
        "description": "Comfortable cotton t-shirts",
        "image": "https://example.com/category.jpg",
        "createdAt": "2026-03-06T00:00:00.000Z",
        "updatedAt": "2026-03-06T00:00:00.000Z"
      }
    }
  ],
  "total": 50,
  "page": 1,
  "limit": 20,
  "totalPages": 3
}
```

**Errors:**

- `400` - Category ID or slug is required
- `404` - Category not found

---

## Checkout Endpoints

### Checkout Workflow Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CHECKOUT WORKFLOW                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  1. USER ADDS ITEMS TO CART (Frontend State)                            │
│     └── Store: productId, quantity, size, color                         │
│                                                                         │
│  2. USER ENTERS SHIPPING INFO & CLICKS CHECKOUT                         │
│     └── Requires authentication                                         │
│                                                                         │
│  3. FRONTEND: POST /api/checkout/create-session                         │
│     ├── Sends: { items: [...], shipping: {...} }                        │
│     ├── Backend validates products, sizes, colors, stock                │
│     ├── Backend creates Order (status: PENDING)                         │
│     ├── Backend creates Stripe Checkout Session                         │
│     └── Returns: { sessionId, url, orderId }                            │
│                                                                         │
│  4. FRONTEND: Redirect to Stripe Checkout                               │
│     └── window.location.href = url  (or stripe.redirectToCheckout)      │
│                                                                         │
│  5. USER COMPLETES PAYMENT ON STRIPE                                    │
│     └── Stripe redirects to success_url with session_id                 │
│                                                                         │
│  6. STRIPE WEBHOOK: POST /api/checkout/webhook                          │
│     ├── Event: checkout.session.completed → Order → PROCESSING          │
│     ├── Event: checkout.session.expired → Order → CANCELLED             │
│     └── Event: payment_intent.payment_failed → Logged                   │
│                                                                         │
│  7. SUCCESS PAGE: GET /api/orders/session/:sessionId                    │
│     └── Show order confirmation with details                            │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Order Status Flow:**

```
PENDING → PROCESSING → SHIPPED → DELIVERED
    │
    └──→ CANCELLED (if payment expires or fails)
```

### Create Checkout Session

Create a Stripe checkout session and a pending order. **Requires authentication.**

```http
POST /api/checkout/create-session
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "items": [
    {
      "productId": "uuid",
      "quantity": 2,
      "size": "M",
      "color": "black"
    }
  ],
  "shipping": {
    "name": "John Doe",
    "address": "123 Main St",
    "city": "New York",
    "postal": "10001",
    "country": "US"
  }
}
```

**Response (200):**

```json
{
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/c/pay/cs_test_...",
  "orderId": "uuid"
}
```

**Errors:**

- `400` - Cart items are required / Complete shipping information is required / Invalid size or color / Insufficient stock
- `401` - Unauthorized (missing or invalid token)
- `404` - Product not found

---

### Get Checkout Session

Get the status of a checkout session and its associated order.

```http
GET /api/checkout/session/:id
```

**Response (200):**

```json
{
  "status": "paid",
  "customerEmail": "john@example.com",
  "orderId": "uuid",
  "order": {
    "id": "uuid",
    "userId": "uuid",
    "total": 59.98,
    "status": "PROCESSING",
    "shippingName": "John Doe",
    "shippingAddress": "123 Main St",
    "shippingCity": "New York",
    "shippingPostal": "10001",
    "shippingCountry": "US",
    "stripeSessionId": "cs_test_...",
    "createdAt": "2026-03-07T00:00:00.000Z",
    "updatedAt": "2026-03-07T00:00:00.000Z",
    "items": [
      {
        "id": "uuid",
        "orderId": "uuid",
        "productId": "uuid",
        "quantity": 2,
        "price": 29.99,
        "size": "M",
        "color": "black",
        "product": {
          "id": "uuid",
          "name": "Classic T-Shirt",
          "image": "https://example.com/image.jpg"
        }
      }
    ],
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

> **Note**: `order` may be `null` if no order is linked to the session.

**Errors:**

- `400` - Session ID is required

---

### Stripe Webhook

Handle Stripe webhook events. This endpoint is called by Stripe automatically.

```http
POST /api/checkout/webhook
```

**Headers:**

```
stripe-signature: <webhook_signature>
Content-Type: application/json
```

**Handled Events:**

- `checkout.session.completed` - Updates order status to `PROCESSING`
- `checkout.session.expired` - Updates order status to `CANCELLED`
- `payment_intent.payment_failed` - Logged for monitoring

> **Note:** This endpoint requires raw body (not JSON parsed) for signature verification. The server is configured to handle this automatically.

---

## Orders Endpoints

All order endpoints require authentication.

### Get My Orders

Get the authenticated user's orders with pagination.

```http
GET /api/orders
Authorization: Bearer <access_token>
```

**Query Parameters:**

| Parameter | Type   | Description                                                          |
| --------- | ------ | -------------------------------------------------------------------- |
| page      | number | Page number (default: 1)                                             |
| limit     | number | Items per page (default: 10)                                         |
| status    | string | Filter by status: PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED |

**Response (200):**

```json
{
  "orders": [
    {
      "id": "uuid",
      "userId": "uuid",
      "total": 59.98,
      "status": "PROCESSING",
      "shippingName": "John Doe",
      "shippingAddress": "123 Main St",
      "shippingCity": "New York",
      "shippingPostal": "10001",
      "shippingCountry": "US",
      "stripeSessionId": "cs_test_...",
      "createdAt": "2026-03-07T00:00:00.000Z",
      "updatedAt": "2026-03-07T00:00:00.000Z",
      "items": [
        {
          "id": "uuid",
          "orderId": "uuid",
          "productId": "uuid",
          "quantity": 2,
          "price": 29.99,
          "size": "M",
          "color": "black",
          "product": {
            "id": "uuid",
            "name": "Classic T-Shirt",
            "image": "https://example.com/image.jpg"
          }
        }
      ]
    }
  ],
  "total": 5,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

---

### Get Order by ID

Get a single order by ID. Users can only access their own orders.

```http
GET /api/orders/:id
Authorization: Bearer <access_token>
```

**Response (200):**

```json
{
  "order": {
    "id": "uuid",
    "userId": "uuid",
    "total": 59.98,
    "status": "PROCESSING",
    "shippingName": "John Doe",
    "shippingAddress": "123 Main St",
    "shippingCity": "New York",
    "shippingPostal": "10001",
    "shippingCountry": "US",
    "stripeSessionId": "cs_test_...",
    "createdAt": "2026-03-07T00:00:00.000Z",
    "updatedAt": "2026-03-07T00:00:00.000Z",
    "items": [
      {
        "id": "uuid",
        "orderId": "uuid",
        "productId": "uuid",
        "quantity": 2,
        "price": 29.99,
        "size": "M",
        "color": "black",
        "product": {
          "id": "uuid",
          "name": "Classic T-Shirt",
          "description": "A comfortable cotton t-shirt",
          "price": 29.99,
          "image": "https://example.com/image.jpg",
          "sizes": ["S", "M", "L", "XL"],
          "colors": ["black", "white", "navy"],
          "featured": true,
          "stock": 50,
          "categoryId": "uuid",
          "createdAt": "2026-03-06T00:00:00.000Z",
          "updatedAt": "2026-03-06T00:00:00.000Z"
        }
      }
    ],
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

**Errors:**

- `400` - Order ID is required
- `401` - Unauthorized
- `403` - Access denied (not your order)
- `404` - Order not found

---

### Get Order by Stripe Session

Get an order by its Stripe session ID. Useful for success/confirmation pages.

```http
GET /api/orders/session/:sessionId
Authorization: Bearer <access_token>
```

**Response (200):**

```json
{
  "order": {
    "id": "uuid",
    "userId": "uuid",
    "total": 59.98,
    "status": "PROCESSING",
    "shippingName": "John Doe",
    "shippingAddress": "123 Main St",
    "shippingCity": "New York",
    "shippingPostal": "10001",
    "shippingCountry": "US",
    "stripeSessionId": "cs_test_...",
    "createdAt": "2026-03-07T00:00:00.000Z",
    "updatedAt": "2026-03-07T00:00:00.000Z",
    "items": [
      {
        "id": "uuid",
        "orderId": "uuid",
        "productId": "uuid",
        "quantity": 2,
        "price": 29.99,
        "size": "M",
        "color": "black",
        "product": {
          "id": "uuid",
          "name": "Classic T-Shirt",
          "description": "A comfortable cotton t-shirt",
          "price": 29.99,
          "image": "https://example.com/image.jpg",
          "sizes": ["S", "M", "L", "XL"],
          "colors": ["black", "white", "navy"],
          "featured": true,
          "stock": 50,
          "categoryId": "uuid",
          "createdAt": "2026-03-06T00:00:00.000Z",
          "updatedAt": "2026-03-06T00:00:00.000Z"
        }
      }
    ]
  }
}
```

**Errors:**

- `401` - Unauthorized
- `403` - Access denied (not your order)
- `404` - Order not found

---

## Admin Endpoints

### Get All Orders (Admin)

Get all orders across all users with pagination.

```http
GET /api/orders/admin/all
Authorization: Bearer <access_token>
```

**Query Parameters:**

| Parameter | Type   | Description                                                          |
| --------- | ------ | -------------------------------------------------------------------- |
| page      | number | Page number (default: 1)                                             |
| limit     | number | Items per page (default: 10)                                         |
| status    | string | Filter by status: PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED |

**Response (200):**

```json
{
  "orders": [
    {
      "id": "uuid",
      "userId": "uuid",
      "total": 59.98,
      "status": "PROCESSING",
      "shippingName": "John Doe",
      "shippingAddress": "123 Main St",
      "shippingCity": "New York",
      "shippingPostal": "10001",
      "shippingCountry": "US",
      "stripeSessionId": "cs_test_...",
      "createdAt": "2026-03-07T00:00:00.000Z",
      "updatedAt": "2026-03-07T00:00:00.000Z",
      "items": [
        {
          "id": "uuid",
          "orderId": "uuid",
          "productId": "uuid",
          "quantity": 2,
          "price": 29.99,
          "size": "M",
          "color": "black",
          "product": {
            "id": "uuid",
            "name": "Classic T-Shirt",
            "image": "https://example.com/image.jpg"
          }
        }
      ]
    }
  ],
  "total": 25,
  "page": 1,
  "limit": 10,
  "totalPages": 3
}
```

---

### Update Order Status (Admin)

Update an order's status.

```http
PATCH /api/orders/:id/status
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "status": "SHIPPED"
}
```

**Valid Status Values:**

- `PENDING` - Order created, awaiting payment
- `PROCESSING` - Payment received, preparing order
- `SHIPPED` - Order shipped
- `DELIVERED` - Order delivered
- `CANCELLED` - Order cancelled

**Response (200):**

```json
{
  "order": {
    "id": "uuid",
    "userId": "uuid",
    "total": 59.98,
    "status": "SHIPPED",
    "shippingName": "John Doe",
    "shippingAddress": "123 Main St",
    "shippingCity": "New York",
    "shippingPostal": "10001",
    "shippingCountry": "US",
    "stripeSessionId": "cs_test_...",
    "createdAt": "2026-03-07T00:00:00.000Z",
    "updatedAt": "2026-03-07T00:00:00.000Z",
    "items": [
      {
        "id": "uuid",
        "orderId": "uuid",
        "productId": "uuid",
        "quantity": 2,
        "price": 29.99,
        "size": "M",
        "color": "black",
        "product": {
          "id": "uuid",
          "name": "Classic T-Shirt",
          "description": "A comfortable cotton t-shirt",
          "price": 29.99,
          "image": "https://example.com/image.jpg",
          "sizes": ["S", "M", "L", "XL"],
          "colors": ["black", "white", "navy"],
          "featured": true,
          "stock": 50,
          "categoryId": "uuid",
          "createdAt": "2026-03-06T00:00:00.000Z",
          "updatedAt": "2026-03-06T00:00:00.000Z"
        }
      }
    ]
  }
}
```

**Errors:**

- `400` - Order ID is required
- `401` - Unauthorized
- `404` - Order not found

---

## Frontend Integration Guide

### 1. Setup API Client

Create an API client with fetch that supports cookies:

```typescript
// lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

class ApiClient {
  private accessToken: string | null = null;

  setAccessToken(token: string) {
    this.accessToken = token;
  }

  clearAccessToken() {
    this.accessToken = null;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (this.accessToken) {
      headers["Authorization"] = `Bearer ${this.accessToken}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: "include", // Required for cookies
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "API Error");
    }

    return response.json();
  }

  // Auth methods
  async signup(name: string, email: string, password: string) {
    return this.request("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
  }

  async login(email: string, password: string) {
    return this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  async getMe() {
    return this.request("/auth/me");
  }

  async refreshToken() {
    // No body needed - refresh token is in cookie
    return this.request("/auth/refresh", {
      method: "POST",
    });
  }

  async logout() {
    // No body needed - refresh token is in cookie
    return this.request("/auth/logout", {
      method: "POST",
    });
  }

  async changePassword(currentPassword: string, newPassword: string) {
    return this.request("/auth/change-password", {
      method: "POST",
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  // Products methods
  async getProducts(params?: Record<string, string>) {
    const query = params ? "?" + new URLSearchParams(params).toString() : "";
    return this.request(`/products${query}`);
  }

  async getProduct(id: string) {
    return this.request(`/products/${id}`);
  }

  async getFeaturedProducts(limit?: number) {
    const query = limit ? `?limit=${limit}` : "";
    return this.request(`/products/featured${query}`);
  }

  async getFilters() {
    return this.request("/products/filters");
  }

  // Categories methods
  async getCategories() {
    return this.request("/categories");
  }

  async getCategory(idOrSlug: string) {
    return this.request(`/categories/${idOrSlug}`);
  }

  async getCategoryProducts(idOrSlug: string, params?: Record<string, string>) {
    const query = params ? "?" + new URLSearchParams(params).toString() : "";
    return this.request(`/categories/${idOrSlug}/products${query}`);
  }

  // Checkout methods
  async createCheckoutSession(
    items: Array<{
      productId: string;
      quantity: number;
      size: string;
      color: string;
    }>,
    shipping: {
      name: string;
      address: string;
      city: string;
      postal: string;
      country: string;
    },
  ) {
    return this.request("/checkout/create-session", {
      method: "POST",
      body: JSON.stringify({ items, shipping }),
    });
  }

  async getCheckoutSession(sessionId: string) {
    return this.request(`/checkout/session/${sessionId}`);
  }

  // Order methods
  async getOrders(params?: { page?: number; limit?: number; status?: string }) {
    const query = params ? "?" + new URLSearchParams(params as Record<string, string>).toString() : "";
    return this.request(`/orders${query}`);
  }

  async getOrder(orderId: string) {
    return this.request(`/orders/${orderId}`);
  }

  async getOrderBySession(sessionId: string) {
    return this.request(`/orders/session/${sessionId}`);
  }

  // Admin methods
  async getAllOrders(params?: { page?: number; limit?: number; status?: string }) {
    const query = params ? "?" + new URLSearchParams(params as Record<string, string>).toString() : "";
    return this.request(`/orders/admin/all${query}`);
  }

  async updateOrderStatus(orderId: string, status: string) {
    return this.request(`/orders/${orderId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  }
}

export const api = new ApiClient();
```

### 2. Authentication Context (React)

```typescript
// contexts/AuthContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Try to restore session on mount
  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      api.setAccessToken(accessToken);
      api.getMe()
        .then((data: any) => setUser(data.user))
        .catch(() => {
          // Token expired, try to refresh
          refreshToken().catch(() => {
            localStorage.removeItem('accessToken');
          });
        })
        .finally(() => setIsLoading(false));
    } else {
      // No access token, try to refresh using cookie
      refreshToken()
        .catch(() => {})
        .finally(() => setIsLoading(false));
    }
  }, []);

  const login = async (email: string, password: string) => {
    const data: any = await api.login(email, password);
    // Refresh token is automatically set as HTTP-only cookie
    localStorage.setItem('accessToken', data.accessToken);
    api.setAccessToken(data.accessToken);
    setUser(data.user);
  };

  const signup = async (name: string, email: string, password: string) => {
    const data: any = await api.signup(name, email, password);
    // Refresh token is automatically set as HTTP-only cookie
    localStorage.setItem('accessToken', data.accessToken);
    api.setAccessToken(data.accessToken);
    setUser(data.user);
  };

  const refreshToken = async () => {
    const data: any = await api.refreshToken();
    // New refresh token is automatically set as HTTP-only cookie
    localStorage.setItem('accessToken', data.accessToken);
    api.setAccessToken(data.accessToken);
    setUser(data.user);
  };

  const logout = async () => {
    await api.logout();
    // Cookie is cleared by server
    localStorage.removeItem('accessToken');
    api.clearAccessToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout, refreshToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

### 3. Stripe Checkout Integration

```typescript
// hooks/useCheckout.ts
import { loadStripe } from "@stripe/stripe-js";
import { api } from "@/lib/api";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
);

interface CartItem {
  productId: string;
  quantity: number;
  size: string;
  color: string;
}

interface ShippingInfo {
  name: string;
  address: string;
  city: string;
  postal: string;
  country: string;
}

export function useCheckout() {
  const checkout = async (items: CartItem[], shipping: ShippingInfo) => {
    try {
      const { sessionId, orderId } = (await api.createCheckoutSession(
        items,
        shipping,
      )) as {
        sessionId: string;
        url: string;
        orderId: string;
      };

      const stripe = await stripePromise;

      if (!stripe) {
        throw new Error("Stripe not loaded");
      }

      const { error } = await stripe.redirectToCheckout({ sessionId });

      if (error) {
        throw error;
      }

      return { orderId };
    } catch (error) {
      console.error("Checkout error:", error);
      throw error;
    }
  };

  return { checkout };
}
```

### 4. Checkout Flow Example

```typescript
// pages/checkout.tsx
import { useState } from 'react';
import { useCheckout } from '@/hooks/useCheckout';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  size: string;
  color: string;
  image?: string;
}

export default function CheckoutPage() {
  const { user } = useAuth();
  const { checkout } = useCheckout();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Get cart from your cart state/context
  const cartItems: CartItem[] = []; // Your cart items

  const [shipping, setShipping] = useState({
    name: user?.name || '',
    address: '',
    city: '',
    postal: '',
    country: '',
  });

  const handleCheckout = async () => {
    if (!user) {
      router.push('/login?redirect=/checkout');
      return;
    }

    setIsLoading(true);
    try {
      // Transform cart items to checkout format
      const checkoutItems = cartItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
      }));

      await checkout(checkoutItems, shipping);
      // User will be redirected to Stripe Checkout
    } catch (error) {
      console.error('Checkout failed:', error);
      // Show error message
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {/* Shipping form */}
      <form>
        <input
          placeholder="Full Name"
          value={shipping.name}
          onChange={(e) => setShipping(s => ({ ...s, name: e.target.value }))}
        />
        <input
          placeholder="Address"
          value={shipping.address}
          onChange={(e) => setShipping(s => ({ ...s, address: e.target.value }))}
        />
        <input
          placeholder="City"
          value={shipping.city}
          onChange={(e) => setShipping(s => ({ ...s, city: e.target.value }))}
        />
        <input
          placeholder="Postal Code"
          value={shipping.postal}
          onChange={(e) => setShipping(s => ({ ...s, postal: e.target.value }))}
        />
        <input
          placeholder="Country"
          value={shipping.country}
          onChange={(e) => setShipping(s => ({ ...s, country: e.target.value }))}
        />
      </form>

      <button onClick={handleCheckout} disabled={isLoading}>
        {isLoading ? 'Processing...' : 'Proceed to Payment'}
      </button>
    </div>
  );
}
```

### 5. Success Page

```typescript
// pages/checkout/success.tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { api } from '@/lib/api';

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const { session_id } = router.query;
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (session_id) {
      api.getOrderBySession(session_id as string)
        .then((data: any) => setOrder(data.order))
        .catch((err) => setError('Could not load order details'));
    }
  }, [session_id]);

  if (error) return <div>{error}</div>;
  if (!order) return <div>Loading order details...</div>;

  return (
    <div>
      <h1>Thank you for your order!</h1>
      <p>Order ID: {order.id}</p>
      <p>Status: {order.status}</p>
      <p>Total: ${order.total.toFixed(2)}</p>

      <h2>Items</h2>
      <ul>
        {order.items.map((item: any) => (
          <li key={item.id}>
            {item.product.name} - {item.size} / {item.color} × {item.quantity}
          </li>
        ))}
      </ul>

      <h2>Shipping To</h2>
      <p>{order.shippingName}</p>
      <p>{order.shippingAddress}</p>
      <p>{order.shippingCity}, {order.shippingPostal}</p>
      <p>{order.shippingCountry}</p>
    </div>
  );
}
```

### 6. Orders Page

```typescript
// pages/orders.tsx
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (user) {
      api.getOrders({ page, limit: 10 })
        .then((data: any) => {
          setOrders(data.orders);
          setTotalPages(data.totalPages);
        });
    }
  }, [user, page]);

  if (!user) return <div>Please log in to view orders</div>;

  return (
    <div>
      <h1>My Orders</h1>
      {orders.length === 0 ? (
        <p>No orders yet</p>
      ) : (
        <ul>
          {orders.map((order) => (
            <li key={order.id}>
              <Link href={`/orders/${order.id}`}>
                Order #{order.id.slice(0, 8)}... - {order.status} - ${order.total.toFixed(2)}
              </Link>
              <span>{new Date(order.createdAt).toLocaleDateString()}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Pagination */}
      <div>
        <button onClick={() => setPage(p => p - 1)} disabled={page === 1}>
          Previous
        </button>
        <span>Page {page} of {totalPages}</span>
        <button onClick={() => setPage(p => p + 1)} disabled={page >= totalPages}>
          Next
        </button>
      </div>
    </div>
  );
}
```

### 7. Environment Variables

```env
# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### 8. Error Handling

All error responses from the API use this format:

```json
{
  "error": "Error description"
}
```

Example error handling in a component:

```typescript
try {
  await api.login(email, password);
} catch (error) {
  if (error instanceof Error) {
    // error.message contains the error text from the API
    console.error(error.message);
  }
}
```

### 9. Health Check

```http
GET /api/health
```

**Response:**

```json
{
  "status": "ok"
}
```

Use this endpoint to check if the API is running.

---

## Error Response Format

All error responses follow this format:

```json
{
  "error": "Error description"
}
```

## Status Codes

| Code | Description                          |
| ---- | ------------------------------------ |
| 200  | Success                              |
| 201  | Created (signup)                     |
| 400  | Bad Request (validation error)       |
| 401  | Unauthorized (invalid/missing token) |
| 403  | Forbidden (access denied)            |
| 404  | Not Found                            |
| 409  | Conflict (duplicate email)           |
| 500  | Internal Server Error                |

## Data Models Reference

### User

```typescript
{
  id: string;          // UUID
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  createdAt: string;   // ISO 8601 datetime
  updatedAt: string;   // ISO 8601 datetime
}
```

> **Note**: The `password` field is never included in API responses.

### Product

```typescript
{
  id: string;          // UUID
  name: string;
  description: string;
  price: number;       // Float
  image: string;       // URL
  sizes: string[];     // e.g., ["S", "M", "L", "XL"]
  colors: string[];    // e.g., ["black", "white", "navy"]
  featured: boolean;
  stock: number;       // Integer
  categoryId: string;  // UUID
  createdAt: string;   // ISO 8601 datetime
  updatedAt: string;   // ISO 8601 datetime
  category?: Category; // Included when product is fetched with include
}
```

### Category

```typescript
{
  id: string;          // UUID
  name: string;
  slug: string;        // URL-friendly identifier
  description: string;
  image: string | null;
  createdAt: string;   // ISO 8601 datetime
  updatedAt: string;   // ISO 8601 datetime
}
```

### Order

```typescript
{
  id: string;              // UUID
  userId: string;          // UUID
  total: number;           // Float
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  shippingName: string;
  shippingAddress: string;
  shippingCity: string;
  shippingPostal: string;
  shippingCountry: string;
  stripeSessionId: string | null;
  createdAt: string;       // ISO 8601 datetime
  updatedAt: string;       // ISO 8601 datetime
  items?: OrderItem[];     // Included in most responses
  user?: { id: string; name: string; email: string }; // Included in findById
}
```

### OrderItem

```typescript
{
  id: string;          // UUID
  orderId: string;     // UUID
  productId: string;   // UUID
  quantity: number;     // Integer
  price: number;       // Float (price at time of purchase)
  size: string;
  color: string;
  product?: Product;   // Included when fetched with include
}
```
