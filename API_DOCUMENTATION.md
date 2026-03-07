# The Hood-X Store API Documentation

## Base URL

```
Development: http://localhost:8000/api
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
5. [Frontend Integration Guide](#frontend-integration-guide)

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

````

**Errors:**

- `400` - Name, email, and password are required / Password must be at least 8 characters
- `409` - Email already in use

---

### Login

Authenticate an existing user.

```http
POST /api/auth/login
````

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
    "role": "USER"
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

Get the authenticated user's profile.

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
    "role": "USER"
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
    "email": "john@example.com"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

> **Note**: A new refresh token is set as an HTTP-only cookie.

````

**Errors:**

- `400` - Refresh token is required
- `401` - Invalid or expired refresh token

---

### Logout

Invalidate the refresh token and clear the cookie.

```http
POST /api/auth/logout
````

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
| limit     | number  | Items per page (default: 12)                                   |

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
      "category": {
        "id": "uuid",
        "name": "T-Shirts",
        "slug": "t-shirts"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

---

### Get Featured Products

Get featured products for homepage display.

```http
GET /api/products/featured
```

**Query Parameters:**

| Parameter | Type   | Description                |
| --------- | ------ | -------------------------- |
| limit     | number | Maximum products to return |

**Response (200):**

```json
{
  "products": [
    {
      "id": "uuid",
      "name": "Featured Product",
      "price": 49.99,
      "image": "https://example.com/image.jpg",
      "featured": true
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
  "priceRange": {
    "min": 10,
    "max": 500
  },
  "sizes": ["XS", "S", "M", "L", "XL", "XXL"],
  "colors": ["black", "white", "red", "blue", "green"],
  "categories": [
    {
      "id": "uuid",
      "name": "T-Shirts",
      "slug": "t-shirts"
    }
  ]
}
```

---

### Get Product by ID

Get a single product with related products.

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
    "category": {
      "id": "uuid",
      "name": "T-Shirts",
      "slug": "t-shirts"
    }
  },
  "related": [
    {
      "id": "uuid",
      "name": "Related Product",
      "price": 34.99,
      "image": "https://example.com/related.jpg"
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

Get all categories.

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
      "image": "https://example.com/category.jpg"
    }
  ]
}
```

---

### Get Category by ID or Slug

Get a single category.

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
    "image": "https://example.com/category.jpg"
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

**Query Parameters:** Same as [List Products](#list-products)

**Response (200):**

```json
{
  "category": {
    "id": "uuid",
    "name": "T-Shirts",
    "slug": "t-shirts"
  },
  "products": [...],
  "page": 1,
  "limit": 12,
  "total": 50,
  "totalPages": 5
}
```

---

## Checkout Endpoints

### Create Checkout Session

Create a Stripe checkout session.

```http
POST /api/checkout/create-session
```

**Request Body:**

```json
{
  "items": [
    {
      "name": "Classic T-Shirt",
      "price": 29.99,
      "quantity": 2,
      "image": "https://example.com/image.jpg"
    }
  ]
}
```

**Response (200):**

```json
{
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/c/pay/cs_test_..."
}
```

**Errors:**

- `400` - Cart items are required

---

### Get Checkout Session

Get the status of a checkout session.

```http
GET /api/checkout/session/:id
```

**Response (200):**

```json
{
  "status": "paid",
  "customerEmail": "john@example.com"
}
```

---

## Frontend Integration Guide

### 1. Setup API Client

Create an API client with fetch that supports cookies:

```typescript
// lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

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
      throw new Error(error.message || "API Error");
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
      name: string;
      price: number;
      quantity: number;
      image?: string;
    }>,
  ) {
    return this.request("/checkout/create-session", {
      method: "POST",
      body: JSON.stringify({ items }),
    });
  }

  async getCheckoutSession(sessionId: string) {
    return this.request(`/checkout/session/${sessionId}`);
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
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export function useCheckout() {
  const checkout = async (items: CartItem[]) => {
    try {
      const { sessionId } = (await api.createCheckoutSession(items)) as any;
      const stripe = await stripePromise;

      if (!stripe) {
        throw new Error("Stripe not loaded");
      }

      const { error } = await stripe.redirectToCheckout({ sessionId });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error("Checkout error:", error);
      throw error;
    }
  };

  return { checkout };
}
```

### 4. Environment Variables

```env
# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### 5. Error Handling

```typescript
// lib/errors.ts
export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

// Usage in components
try {
  await api.login(email, password);
} catch (error) {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      // Handle invalid credentials
    }
  }
  // Handle generic error
}
```

### 6. Health Check

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
  "message": "Error description",
  "status": 400
}
```

## Status Codes

| Code | Description                          |
| ---- | ------------------------------------ |
| 200  | Success                              |
| 201  | Created (signup)                     |
| 400  | Bad Request (validation error)       |
| 401  | Unauthorized (invalid/missing token) |
| 404  | Not Found                            |
| 409  | Conflict (duplicate email)           |
| 500  | Internal Server Error                |
