---
title: 'From Monolith to Modular: Re-architecting a React App with Feature Slices'
pubDate: 2025-04-21
description: 'A practical guide to re-architecting a monolithic React application into a scalable, maintainable project using the Feature-Sliced Design methodology. Learn about folder structures, component co-location, and improved developer experience.'
author: 'Vasyl Berkoz'
image:
    url: ''
    alt: ''
og_title: "From Monolith to Modular: Re-architecting a React App with Feature Slices"
og_description: "Break free from the 'components' and 'pages' folders. Learn how to implement a feature-sliced architecture in your React projects for better scalability and maintainability."
og_type: "article"
og_url: "https://vberkoz.com/posts/react-feature-sliced-architecture"
---
Every developer has been there. You start a new React project with a clean slate, a simple `src/` folder containing a `components/` folder, a `pages/` folder, and a few utility files. It's clean, it's simple, and it works perfectly for a small project.

But then the app starts to grow. New features are added, the team expands, and that once-pristine structure begins to crumble under its own weight. Your `components/` folder explodes with hundreds of files, your `pages/` folder becomes an unmanageable mess, and a simple change to a feature requires you to jump between a dozen different directories just to find all the related files.

This is the "monolith" problem in a frontend context. It's not about a single-file application, but a single, flat, unorganized codebase where everything is tightly coupled. The solution? A modular, feature-based architecture that scales with your application.

In this guide, I'll walk you through the principles of the **Feature-Sliced Design** methodology and show you how I apply it to my React projects to build clean, scalable, and highly maintainable frontends.

-----

### **The Problem with a Traditional Monolithic Structure** 😫

Before we dive into the solution, let's clearly define the pain points of a components/pages structure.

1.  **Poor Discoverability:** Finding a specific component, like `UserAvatar`, might be easy at first. But when you have `UserAvatarDropdown`, `UserAvatarWithTooltip`, `SettingsUserAvatar`, and a dozen other variations, it's impossible to know where a file lives without using your IDE's search function.
2.  **Weak Encapsulation:** Components and business logic are often mixed together. A component that handles a specific feature might be a mix of UI, state management, and API calls, making it hard to reuse or test in isolation.
3.  **Refactoring Nightmares:** When a feature needs to be updated or removed, you have to hunt down every single file related to that feature scattered across multiple directories. Deleting a feature becomes a risky chore.
4.  **Onboarding Overhead:** For new developers, understanding the app's structure and finding where to add new code can be a significant challenge. The lack of a clear pattern slows down the entire team.

-----

### **The Solution: Feature Slicing** 🧩

The core idea behind feature slicing is to organize your codebase around **features**, not file types. Instead of grouping all your components in one folder, you group all the code related to a specific feature in its own "slice" or directory.

A typical feature slice might look like this:

```
src/
├── features/
│   ├── auth/
│   │   ├── components/
│   │   │   ├── LoginButton.tsx
│   │   │   └── AuthProvider.tsx
│   │   ├── hooks/
│   │   │   └── useLogin.ts
│   │   ├── api/
│   │   │   └── authApi.ts
│   │   └── index.ts
│   ├── user-profile/
│   │   ├── components/
│   │   │   ├── UserProfileCard.tsx
│   │   │   └── UserAvatar.tsx
│   │   ├── hooks/
│   │   │   └── useUserProfile.ts
│   │   ├── api/
│   │   │   └── userProfileApi.ts
│   │   └── index.ts
├── pages/
│   ├── HomePage.tsx
│   └── ProfilePage.tsx
├── shared/
│   ├── components/
│   │   ├── Button.tsx
│   │   └── Card.tsx
│   ├── hooks/
│   │   └── useDebounce.ts
│   └── lib/
│       └── utils.ts
├── App.tsx
└── main.tsx
```

### **The Anatomy of a Feature-Sliced Structure** 🏗️

1.  **`features/`**: This is the heart of the architecture. Each subdirectory here represents a distinct feature of your application (e.g., `auth`, `user-profile`, `shopping-cart`). All code related to that feature—components, hooks, API calls—lives within its own folder.
2.  **`pages/`**: The pages directory becomes much simpler. It contains top-level page components that primarily compose components from the `features/` and `shared/` directories. For example, `ProfilePage.tsx` would import `<UserProfileCard />` from `features/user-profile` instead of containing all the logic itself.
3.  **`shared/`**: This directory is for truly reusable, "dumb" components and utility functions that don't belong to any single feature. Think of a generic `<Button />`, `<Modal />`, or a `debounce` utility function. These components should not have any business logic or depend on any specific feature.

### **A Practical Example: The `user-profile` Feature** 💻

Let's imagine you need to build a new user profile page.

**The old way (monolith):**

  * Create `src/components/UserProfileCard.tsx`
  * Create `src/components/UserAvatar.tsx`
  * Create `src/api/userProfileApi.ts`
  * Create `src/hooks/useUserProfile.ts`
  * Create `src/pages/ProfilePage.tsx` and import all the above.

**The new way (feature-sliced):**

  * Create `src/features/user-profile/`
  * Inside this folder, you create all related files:
      * `src/features/user-profile/components/UserProfileCard.tsx`
      * `src/features/user-profile/components/UserAvatar.tsx`
      * `src/features/user-profile/api/userProfileApi.ts`
      * `src/features/user-profile/hooks/useUserProfile.ts`
  * Now, your `ProfilePage.tsx` is clean and simple, acting as an orchestrator:

<!-- end list -->

```tsx
// src/pages/ProfilePage.tsx
import UserProfileCard from '../features/user-profile/components/UserProfileCard';
import { useUserProfile } from '../features/user-profile/hooks/useUserProfile';

const ProfilePage = () => {
    const { profile, isLoading } = useUserProfile();

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (!profile) {
        return <div>Profile not found.</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6">User Profile</h1>
            <UserProfileCard profile={profile} />
        </div>
    );
};

export default ProfilePage;
```

Notice how clean the `ProfilePage` component is. It doesn't know *how* to fetch the user profile, or what the internal structure of the `UserProfileCard` is. It only knows that it needs these pieces to render the page.

-----

### **Benefits of this Approach** ✅

Implementing this architecture has a transformative effect on the developer experience and the long-term health of your codebase.

  * **Improved Scalability:** As your application grows, you simply add new features. A new `booking/` or `messaging/` folder is a self-contained unit, preventing the root `src/` directory from becoming a dumping ground.
  * **Enhanced Maintainability:** All the code related to a single feature is co-located. If a bug is reported in the authentication flow, you know exactly where to look: `src/features/auth/`.
  * **Encapsulation and Reusability:** By strictly defining what is a `feature` (business logic, state, and UI) and what is a `shared` component (dumb UI), you enforce a clear separation of concerns. This makes components easier to reuse and test.
  * **Faster Onboarding:** The folder structure becomes a living documentation of your application. A new team member can quickly grasp the entire application's functionality just by looking at the feature list.
  * **Simplified Refactoring:** Deleting or replacing a feature becomes as simple as deleting a single directory.

### **Final Thoughts** 🤔

Adopting a feature-sliced architecture is a proactive step toward building a frontend that can stand the test of time. While it might feel like a bit of overkill for a "hello world" project, establishing this pattern early on will save you countless hours of refactoring and debugging down the line.

It forces you to think modularly, encourages the separation of concerns, and ultimately leads to a codebase that is not just functional, but a joy to work with. If you're building a new React application, or looking to clean up an existing one, I highly recommend giving this approach a try.