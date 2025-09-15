---
title: 'Node.js + Postgres: A Scalable Backend Boilerplate'
pubDate: 2025-05-26
updatedDate: 2025-05-26
description: 'A practical, hands-on guide to building a scalable Node.js backend using PostgreSQL, focusing on project structure, authentication, and testing.'
author: 'Vasyl Berkoz'
image:
    url: ''
    alt: ''
og_title: "Node.js + Postgres: A Scalable Backend Boilerplate"
og_description: "A practical guide for developers on creating a robust and scalable Node.js backend with PostgreSQL. This post covers project structure, authentication, database management, and testing."
og_type: "article"
og_url: "https://vberkoz.com/posts/nodejs-postgres-boilerplate"
---

Hey everyone\! 👋 As a developer, I've built my fair share of backends, from small prototypes to large-scale, enterprise-level applications. Over the years, I've honed a boilerplate setup that I keep coming back to. It’s a clean, efficient, and scalable foundation built with Node.js and PostgreSQL.

This isn't a theoretical post. This is a "here's how I do it" guide, complete with the specific libraries, file structure, and best practices that I find invaluable. My goal is to save you countless hours of setup and give you a rock-solid starting point for your next project.

### Why Node.js and PostgreSQL? 🐘

Before we dive into the code, let’s quickly talk about why this combination works so well.

**Node.js**: Its non-blocking, event-driven architecture makes it perfect for handling a high volume of concurrent connections. It's fantastic for real-time applications, APIs, and microservices. The massive NPM ecosystem means there’s a library for almost anything you can imagine.

**PostgreSQL**: Often considered the "world's most advanced open-source relational database," Postgres is incredibly robust and feature-rich. It's not just a database; it’s a platform. It supports complex queries, has excellent data integrity, and offers a ton of advanced features like JSONB for flexible schema-on-read, PostGIS for geospatial data, and powerful full-text search.

Together, they form a powerful and reliable stack that scales from a small personal project to a large-scale application serving millions of users.

### The Core Stack: My Go-To Libraries

Here are the key libraries that form the backbone of our boilerplate. I’ve chosen them for their performance, reliability, and ease of use.

  * **Express.js**: The classic, minimalist web framework for Node.js. It's unopinionated and gives us full control.
  * **TypeScript**: For type safety, better tooling, and fewer bugs. It's a game-changer for maintainability on larger projects.
  * **`pg`**: The official and most popular PostgreSQL client for Node.js. It's lightweight and fast.
  * **`bcrypt`**: For securely hashing user passwords. **Never store plain-text passwords\!**
  * **`jsonwebtoken`**: For handling JSON Web Tokens (JWT) for stateless authentication.
  * **`zod`**: A fantastic TypeScript-first schema validation library. It’s incredibly powerful and provides great developer experience.
  * **`dotenv`**: To manage environment variables securely.
  * **`jest`**: My go-to testing framework for Node.js. It's fast, well-documented, and has a great developer experience.
  * **`uuid`**: For generating unique identifiers.

### Project Structure: The Blueprint for Success 🏗️

A well-organized project structure is the secret to a maintainable codebase. This layout separates concerns and makes it easy for new developers to jump in and understand where everything is.

```
/src
├── /config
│   ├── index.ts
│   └── database.ts
├── /controllers
│   ├── auth.controller.ts
│   └── user.controller.ts
├── /middlewares
│   ├── auth.middleware.ts
│   └── validation.middleware.ts
├── /models
│   └── user.model.ts
├── /routes
│   ├── auth.routes.ts
│   └── user.routes.ts
├── /services
│   ├── auth.service.ts
│   └── user.service.ts
├── /utils
│   ├── errors.ts
│   └── validation.ts
├── app.ts
└── server.ts
```

  * **`config`**: Holds all configuration-related files (e.g., database connection, environment variables).
  * **`controllers`**: Handles incoming requests and orchestrates the response. It calls services to do the heavy lifting.
  * **`middlewares`**: Contains Express middleware functions for tasks like authentication and validation.
  * **`models`**: Defines the data models and handles database interactions. This is where your SQL queries live.
  * **`routes`**: Defines the API endpoints and maps them to the appropriate controllers.
  * **`services`**: Contains the business logic. This is the core of your application where you'll have functions for tasks like user registration, password reset, etc.
  * **`utils`**: Houses utility functions and classes (e.g., custom error classes, helpers).
  * **`app.ts`**: The main Express application instance, where we wire up routes and middleware.
  * **`server.ts`**: The entry point of our application. It starts the server and connects to the database.

> "A good backend is like an invisible hand. You don't see it, but you feel its presence in the reliability and speed of the application."

## Let's Build It: A Step-by-Step Walkthrough

### 1\. Setting Up the Database 💾

First, we need a PostgreSQL database. If you don't have one, you can install it locally or use a cloud provider like Heroku, Vercel, or DigitalOcean.

We'll use a `Pool` for our database connection. This is crucial for performance as it manages a pool of client connections and reuses them, avoiding the overhead of creating a new connection for every request.

**`src/config/database.ts`**

```typescript
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432', 10),
});

export const query = (text: string, params: any[] = []) => {
    return pool.query(text, params);
};
```

This simple file exports a `query` function that we can use throughout our application. It's a clean abstraction over the `pg` client.

### 2\. User Authentication: The Foundation of Any App 🔐

Authentication is a critical component. We'll use a JWT-based system.

**`src/models/user.model.ts`**

This file will contain our SQL queries for user-related operations. Using a dedicated file for each model's queries keeps our code clean and maintainable.

```typescript
import { query } from '../config/database';

export const findUserByEmail = async (email: string) => {
    const { rows } = await query('SELECT * FROM users WHERE email = $1', [email]);
    return rows[0];
};

export const createUser = async (id: string, email: string, hashedPassword: string) => {
    const { rows } = await query(
        'INSERT INTO users (id, email, password) VALUES ($1, $2, $3) RETURNING id, email',
        [id, email, hashedPassword]
    );
    return rows[0];
};
```

**`src/services/auth.service.ts`**

Here is where our business logic for authentication lives. We'll use `bcrypt` to hash passwords and `jsonwebtoken` to create tokens.

```typescript
import { findUserByEmail, createUser } from '../models/user.model';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

export const registerUser = async (email: string, password: string) => {
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
        throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const id = uuidv4();
    const newUser = await createUser(id, email, hashedPassword);

    return {
        id: newUser.id,
        email: newUser.email,
    };
};

export const loginUser = async (email: string, password: string) => {
    const user = await findUserByEmail(email);
    if (!user) {
        throw new Error('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error('Invalid credentials');
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET as string, { expiresIn: '1h' });
    return token;
};
```

**`src/controllers/auth.controller.ts`**

The controller handles the HTTP request and response. It calls the service, and based on the result, sends back a success or error response.

```typescript
import { Request, Response } from 'express';
import { registerUser, loginUser } from '../services/auth.service';

export const register = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const user = await registerUser(email, password);
        res.status(201).json(user);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const token = await loginUser(email, password);
        res.status(200).json({ token });
    } catch (error: any) {
        res.status(401).json({ message: error.message });
    }
};
```

This separation of concerns—**Controller, Service, Model**—is known as the "Service Layer" pattern, and it’s a major key to creating a scalable, maintainable application.

### 3\. Middleware: The Request Gatekeepers 🛡️

Middleware functions are perfect for cross-cutting concerns like validation and authentication.

**`src/middlewares/auth.middleware.ts`**

This middleware ensures that a user is authenticated before they can access a protected route.

```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface AuthenticatedRequest extends Request {
    userId?: string;
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        return res.status(401).json({ message: 'Authentication token missing.' });
    }

    jwt.verify(token, process.env.JWT_SECRET as string, (err: any, user: any) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid or expired token.' });
        }
        req.userId = user.id;
        next();
    });
};
```

**`src/routes/user.routes.ts`**

Now, we can apply this middleware to any route that needs to be protected.

```typescript
import express from 'express';
import { getUserProfile } from '../controllers/user.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = express.Router();

router.get('/profile', authenticateToken, getUserProfile);

export default router;
```

This clearly separates the routes from the logic of authenticating a user.

### 4\. Testing with Jest 🧪

A good boilerplate isn't complete without a solid testing setup. Testing backend logic is non-negotiable for scalable applications.

Create a `__tests__` directory at the root and add `auth.service.test.ts`. Jest automatically finds and runs these files.

**`__tests__/auth.service.test.ts`**

We can mock our database calls to test our business logic in isolation. This makes tests fast and reliable.

```typescript
import { registerUser, loginUser } from '../src/services/auth.service';
import * as userModel from '../src/models/user.model';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

jest.mock('../src/models/user.model');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('Auth Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should register a new user successfully', async () => {
        // Mock the user model functions
        (userModel.findUserByEmail as jest.Mock).mockResolvedValue(null);
        (userModel.createUser as jest.Mock).mockResolvedValue({ id: '123', email: 'test@example.com' });
        (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');

        const user = await registerUser('test@example.com', 'password123');

        expect(user).toEqual({ id: '123', email: 'test@example.com' });
        expect(userModel.findUserByEmail).toHaveBeenCalledWith('test@example.com');
        expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
        expect(userModel.createUser).toHaveBeenCalled();
    });

    it('should throw an error if user already exists', async () => {
        (userModel.findUserByEmail as jest.Mock).mockResolvedValue({ id: '123', email: 'test@example.com' });

        await expect(registerUser('test@example.com', 'password123')).rejects.toThrow('User already exists');
    });
});
```

This is a simple but powerful example of how to test a service. We can test the login service in a similar way. The key is to mock external dependencies like the database and other services.

## Final Thoughts and Next Steps 🚀

This boilerplate is a solid foundation, not a complete application. It gives you a clean architecture and all the tools you need to scale. From here, you can:

  * **Database Migrations**: Use a tool like `knex` or `migrate` to manage your database schema changes over time.
  * **API Documentation**: Integrate a tool like `swagger-jsdoc` to generate OpenAPI documentation automatically.
  * **Error Handling**: Implement a more robust global error-handling middleware.
  * **Dockerization**: Containerize your application using Docker for consistent deployments.
  * **Logging**: Add a dedicated logging library like `Winston` or `Pino` for better application monitoring.

I hope this "here's how I do it" guide provides immense value and helps you kickstart your next project with confidence. Building a scalable backend is a marathon, not a sprint, and having a great starting point makes all the difference.

Happy coding\! ✨