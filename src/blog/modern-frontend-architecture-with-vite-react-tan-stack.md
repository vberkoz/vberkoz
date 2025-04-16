---
title: 'Modern Frontend Architecture with Vite, React & TanStack'
pubDate: 2025-04-01
description: 'Learn how to build a modern, scalable frontend architecture using Vite, React, and TanStack tools (Query, Router, Form, and Table). In this guide, I’ll share my go-to setup, folder structure, best practices, and code snippets for fast, maintainable web apps.'
author: 'Vasyl Berkoz'
image:
    url: 'https://docs.astro.build/assets/rose.webp'
    alt: 'The Astro logo on a dark background with a pink glow.'
tags: ["vite", "react", "tanstack", "frontend-architecture", "webdev", "typescript", "developer-blog"]
---

### **Introduction**
> Vite changed the game for frontend tooling with its lightning-fast dev server and modern build system. Pair that with React and the powerful TanStack suite (Query, Router, Form, Table), and you've got a frontend stack that's fast, scalable, and enjoyable to work with. In this post, I’ll walk you through the architectural patterns I use in production projects.

### **1. Why Vite, React & TanStack?**
- **Vite** offers instant HMR, optimized builds, and native TypeScript support.
- **React** is still the king of UI composition.
- **TanStack Query** simplifies async data.
- **TanStack Router** is a modern type-safe alternative to React Router.
- **TanStack Form** makes form validation clean and scalable.

### **2. Folder Structure**
```
src/
├── components/
├── features/
│   └── vehicles/
│       ├── api.ts
│       ├── VehicleList.tsx
│       └── useVehicles.ts
├── routes/
│   ├── index.tsx
│   ├── vehicles.tsx
│   └── drivers.tsx
├── lib/
│   └── tanstack/
│       ├── queryClient.ts
│       ├── router.tsx
│       └── form.ts
├── types/
└── main.tsx
```

> **Tip:** Keep logic, API calls, and components scoped to each feature.

### **3. Routing with TanStack Router**
```tsx
// lib/tanstack/router.tsx
import { createRouter } from '@tanstack/react-router';

const router = createRouter({
  routeConfig: [
    {
      path: '/',
      component: HomePage,
    },
    {
      path: '/vehicles',
      component: VehicleList,
    },
  ],
});
```

- Type-safe route params
- Easy nested layouts

### **4. Data Fetching with TanStack Query**
```tsx
// features/vehicles/useVehicles.ts
import { useQuery } from '@tanstack/react-query';
import { getVehicles } from './api';

export const useVehicles = () => useQuery({
  queryKey: ['vehicles'],
  queryFn: getVehicles,
});
```

- Global caching
- Background syncing
- Devtools support

### **5. Forms with TanStack Form + Zod**
```tsx
const schema = z.object({
  name: z.string().min(2),
});

const form = useForm({ schema });

return (
  <form onSubmit={form.handleSubmit()}>
    <input {...form.register('name')} />
    <button type="submit">Save</button>
  </form>
);
```

- Schema-based validation
- Clean and modular logic

### **6. Extra Tips for Clean Architecture**
- ✅ Use TypeScript everywhere
- ✅ Centralize API logic
- ✅ Avoid prop drilling with context or stores
- ✅ Use atomic components (and Tailwind or Shadcn for styling)

### **Conclusion**
> This Vite + React + TanStack stack has drastically improved my productivity and code quality. Whether you're building an admin dashboard, logistics app, or a SaaS UI, this setup keeps things fast, typed, and easy to scale.
