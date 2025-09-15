---
title: 'API First: Designing and Building a REST API with NestJS and TypeORM'
pubDate: 2025-04-28
updatedDate: 2025-04-28
description: 'Showcase your backend skills with a modern framework like NestJS. Learn how to design and build a REST API using NestJS and TypeORM.'
author: 'Vasyl Berkoz'
image:
    url: ''
    alt: ''
og_title: "API First: Building a REST API with NestJS and TypeORM"
og_description: "Learn how to design and build a robust, scalable REST API using the powerful combination of NestJS and TypeORM."
og_type: "article"
og_url: "https://vberkoz.com/posts/nestjs-typeorm-api-first"
---

In the world of modern software development, APIs are the glue that holds everything together. From mobile apps to single-page applications and third-party integrations, a well-designed API is a cornerstone of a scalable and maintainable system. This is where the **API-First** approach comes into play. Instead of building the application logic and then exposing an API, we design the API contract first. This ensures consistency, simplifies development for all teams, and allows for parallel work.

Today, we'll dive into building a robust, scalable, and maintainable REST API using a fantastic combination of tools: **NestJS** and **TypeORM**. NestJS brings a powerful, opinionated, and highly structured framework to the Node.js ecosystem, while TypeORM provides a flexible and feature-rich Object-Relational Mapper (ORM) for interacting with your database.

### The Case for NestJS and TypeORM 🚀

Why this specific duo?

**NestJS** is a progressive Node.js framework for building efficient, reliable, and scalable server-side applications. It’s heavily inspired by Angular and uses TypeScript by default. This provides several benefits:

  * **Architectural Clarity:** It enforces a modular, dependency injection-based architecture, which makes your codebase easy to manage and scale.
  * **Built-in Modules:** It comes with powerful, out-of-the-box modules for things like authentication, caching, validation, and more.
  * **TypeScript:** Strong typing catches errors early and provides excellent developer experience with IDE auto-completion and clear contracts.
  * **Documentation:** The documentation is thorough and high-quality, making it easy to learn and get started.

**TypeORM** is an ORM that can run in Node.js, Browser, Cordova, and more. It supports multiple databases, including PostgreSQL, MySQL, SQLite, and Microsoft SQL Server.

  * **Entity-Based:** It allows you to work with your database tables as objects (entities), which simplifies data manipulation and querying.
  * **Migrations:** It has a powerful migration system that helps you evolve your database schema as your application grows.
  * **Active Record & Data Mapper Patterns:** It supports both popular patterns, giving you the flexibility to choose what best fits your project.

> The synergy between NestJS's dependency injection and TypeORM's entity-based approach is powerful. You can inject your database repositories directly into your services, leading to clean, testable code.

### Getting Started: The API-First Mindset 🧠

Before we write a single line of code, let's think about our API. What resources will it expose? What actions can be performed on those resources? Let's imagine we're building a simple `Blog` API. We'll need resources for `posts` and `users`.

**API Contract (Draft):**

| HTTP Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/posts` | Retrieve a list of all posts. |
| `GET` | `/posts/:id` | Retrieve a single post by ID. |
| `POST` | `/posts` | Create a new post. |
| `PATCH` | `/posts/:id` | Update an existing post. |
| `DELETE` | `/posts/:id` | Delete a post. |
| `GET` | `/users/:id/posts` | Retrieve all posts by a specific user. |

This simple contract guides our development process. We know exactly what endpoints we need to build, what data to expect, and what data to return. This is the essence of the API-First approach.

### Setting Up Our Project 🛠️

First, make sure you have NestJS CLI installed:

`npm i -g @nestjs/cli`

Now, let's create a new NestJS project:

`nest new blog-api`

Next, install TypeORM and your preferred database driver (we'll use PostgreSQL for this example):

`npm install @nestjs/typeorm typeorm pg`

### Building the Core Modules 🏗️

NestJS is modular. A `module` is a class annotated with `@Module()` that provides a set of services and controllers. Let's create `Users` and `Posts` modules.

`nest generate module users`  
`nest generate module posts`

Now, let's define our entities. These are the classes that map to our database tables.

`nest generate class users/user --type entity`  
`nest generate class posts/post --type entity`

Inside `src/users/user.entity.ts`:

```typescript
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Post } from '../posts/post.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @OneToMany(() => Post, post => post.author)
  posts: Post[];
}
```

And inside `src/posts/post.entity.ts`:

```typescript
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../users/user.entity';

@Entity()
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('text')
  content: string;

  @ManyToOne(() => User, user => user.posts)
  author: User;
}
```

Notice the relationships: a `User` has `OneToMany` `Posts`, and a `Post` has a `ManyToOne` relationship with a `User`. This is the power of TypeORM.

### Connecting to the Database 🔗

In `src/app.module.ts`, we'll configure TypeORM and connect it to our database.

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/user.entity';
import { Post } from './posts/post.entity';
import { UsersModule } from './users/users.module';
import { PostsModule } from './posts/posts.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'your-username',
      password: 'your-password',
      database: 'blog-db',
      entities: [User, Post],
      synchronize: true, // Use migrations in production!
    }),
    UsersModule,
    PostsModule,
  ],
})
export class AppModule {}
```

> **Note on `synchronize`:** Setting this to `true` is great for development as it automatically creates tables based on your entities. **NEVER** use this in production. Instead, use TypeORM migrations to safely update your database schema.

### Creating the Service and Controller 🖥️

Now, let's build the `PostsService` and `PostsController`.

`nest generate service posts`
`nest generate controller posts`

Inside `src/posts/posts.service.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './post.entity';
import { CreatePostDto } from './dto/create-post.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
  ) {}

  findAll(): Promise<Post[]> {
    return this.postsRepository.find({ relations: ['author'] });
  }

  findOne(id: number): Promise<Post> {
    return this.postsRepository.findOne({ where: { id }, relations: ['author'] });
  }

  create(createPostDto: CreatePostDto): Promise<Post> {
    const newPost = this.postsRepository.create(createPostDto);
    return this.postsRepository.save(newPost);
  }

  // Add more methods for update and delete
}
```

The `@InjectRepository(Post)` decorator is a NestJS feature that injects the TypeORM `Repository` for the `Post` entity, allowing us to interact with the database using simple, clean methods.

Finally, in `src/posts/posts.controller.ts`:

```typescript
import { Controller, Get, Post as HttpPost, Body, Param } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { Post } from './post.entity';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  async findAll(): Promise<Post[]> {
    return this.postsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Post> {
    return this.postsService.findOne(id);
  }

  @HttpPost()
  async create(@Body() createPostDto: CreatePostDto): Promise<Post> {
    return this.postsService.create(createPostDto);
  }
}
```

The `@Controller('posts')` decorator defines the base route for our endpoints. `@Get()`, `@Get(':id')`, and `@HttpPost()` map to the HTTP verbs and URLs we defined in our API contract. We've just built the core logic for a robust API\!

### Showcasing Your Skills 🎉

By following this pattern, you demonstrate a deep understanding of modern backend development principles:

  * **API-First Design:** You thought about the API contract and user experience before coding.
  * **Modular Architecture:** Your code is organized, scalable, and easy to maintain thanks to NestJS modules.
  * **Dependency Injection:** You're using a powerful design pattern that makes your code testable and flexible.
  * **ORM and Database Management:** You're working with the database in an efficient, object-oriented way using TypeORM.
  * **TypeScript:** You're leveraging a typed language to write more robust and bug-free code.

This combination of technologies and methodologies provides a solid foundation for any serious backend project. It's an excellent way to showcase your ability to build complex, enterprise-grade applications.

Happy coding\! 👋