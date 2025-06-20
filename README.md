# Firebase Studio - AuthFlow

This is a NextJS starter in Firebase Studio, featuring a comprehensive authentication system called AuthFlow.

To get started, take a look at `src/app/page.tsx`.

## Integrating AuthFlow into Your Project

AuthFlow is designed to be relatively portable. Here's how you can integrate it into another Next.js (App Router) project:

### 1. Copy Core AuthFlow Directories and Files

Copy the following directories and files from this project into the `src` directory of your target project:

-   **`src/app/(auth)`**: Contains the pre-built sign-in, sign-up, and forgot-password pages.
-   **`src/app/api/auth`**: Contains the necessary API backend routes for session management and username-to-email lookups.
-   **`src/components/auth`**: UI components used by the authentication pages (forms, wrappers, etc.).
-   **`src/components/protected-route.tsx`**: A client component to protect routes that require authentication.
-   **`src/components/logo.tsx`**: (Optional, if you want to use the AuthFlow logo or adapt it).
-   **`src/contexts/auth-context.tsx`**: The React context provider for managing authentication state.
-   **`src/lib/firebase`**: Firebase client and admin configurations, and auth utility functions.
-   **`src/lib/validators/auth.ts`**: Zod schemas for validating authentication forms.
-   **`src/middleware.ts`**: Next.js middleware for protecting routes and handling redirects based on auth state.
-   **`src/hooks/use-toast.ts` & `src/components/ui/toast.tsx`, `src/components/ui/toaster.tsx`**: (If you want to use the same toast notification system).
-   **Relevant ShadCN UI components** from `src/components/ui` that are used by the auth components (e.g., Button, Input, Card, Form, Alert, Dialog, Checkbox, Label, Separator, Avatar etc.). It might be easier to copy the entire `src/components/ui` directory or ensure you have these components set up in your target project.

### 2. Install Dependencies

Ensure your target project's `package.json` includes the following dependencies (or newer compatible versions):

```json
"dependencies": {
    "@genkit-ai/googleai": "^1.8.0",
    "@genkit-ai/next": "^1.8.0",
    "@hookform/resolvers": "^4.1.3",
    "@radix-ui/react-accordion": "^1.2.3",
    "@radix-ui/react-alert-dialog": "^1.1.6",
    "@radix-ui/react-avatar": "^1.1.3",
    "@radix-ui/react-checkbox": "^1.1.4",
    "@radix-ui/react-dialog": "^1.1.6",
    "@radix-ui/react-dropdown-menu": "^2.1.6",
    "@radix-ui/react-label": "^2.1.2",
    "@radix-ui/react-menubar": "^1.1.6",
    "@radix-ui/react-popover": "^1.1.6",
    "@radix-ui/react-progress": "^1.1.2",
    "@radix-ui/react-radio-group": "^1.2.3",
    "@radix-ui/react-scroll-area": "^1.2.3",
    "@radix-ui/react-select": "^2.1.6",
    "@radix-ui/react-separator": "^1.1.2",
    "@radix-ui/react-slider": "^1.2.3",
    "@radix-ui/react-slot": "^1.1.2",
    "@radix-ui/react-switch": "^1.1.3",
    "@radix-ui/react-tabs": "^1.1.3",
    "@radix-ui/react-toast": "^1.2.6",
    "@radix-ui/react-tooltip": "^1.1.8",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "date-fns": "^3.6.0",
    "dotenv": "^16.5.0",
    "firebase": "^11.9.1",
    "firebase-admin": "^12.1.1",
    "genkit": "^1.8.0",
    "lucide-react": "^0.475.0",
    "next": "15.3.3",
    "next-themes": "^0.3.0",
    "react": "^18.3.1",
    "react-day-picker": "^8.10.1",
    "react-dom": "^18.3.1",
    "react-hook-form": "^7.54.2",
    "recharts": "^2.15.1",
    "tailwind-merge": "^3.0.1",
    "tailwindcss-animate": "^1.0.7",
    "zod": "^3.24.2"
  },
"devDependencies": {
    "genkit-cli": "^1.8.0"
  }
```
Run `npm install` or `yarn install`. Also ensure you have dev dependencies like `typescript`, `tailwindcss`, `postcss`, etc., configured in your target project.

### 3. Set Up Environment Variables

Create a `.env.local` file (or `.env` for development if you prefer, but `.env.local` is standard for Next.js and gitignored) in the root of your target project with your Firebase project credentials.

Example structure for your `.env.local` file (replace placeholders with your actual values):

```env
# Firebase Client SDK Configuration (publicly accessible)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin SDK Configuration (server-side, keep private)
# Option 1: Path to your service account key JSON file (recommended for deployed environments)
# GOOGLE_APPLICATION_CREDENTIALS=path/to/your/serviceAccountKey.json

# Option 2: Individual Admin SDK credentials (can be used for local development)
# Ensure FIREBASE_ADMIN_PRIVATE_KEY has its newline characters (\n) escaped as \\n if set directly in .env
FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxx@your_project_id.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nYOUR_PRIVATE_KEY_CONTENT_HERE\\n-----END PRIVATE KEY-----\\n"

# Genkit (if using AI features from AuthFlow, e.g., password breach check)
GOOGLE_API_KEY=your_google_ai_api_key
```
**Important**:
- For `FIREBASE_ADMIN_PRIVATE_KEY`, if you paste it directly into the `.env` file, all newline characters (`\n`) within the key must be escaped as `\\n`.
- Using `GOOGLE_APPLICATION_CREDENTIALS` by providing a path to your service account JSON file is generally the more secure and standard way to configure the Admin SDK, especially for deployed environments.

### 4. Update `src/app/layout.tsx`

Wrap your root layout's children with `ThemeProvider` (for dark/light mode, optional but used by AuthFlow styles) and `AuthProvider`. Also, include the `Toaster` component for notifications.

```tsx
// src/app/layout.tsx
import type { Metadata } from 'next';
import './globals.css'; // Ensure you have global styles similar to AuthFlow's
import { Toaster } from '@/components/ui/toaster'; // Assuming you copied this
import { AuthProvider } from '@/contexts/auth-context'; // Copied from AuthFlow
import { ThemeProvider } from '@/components/theme-provider'; // Copied or your own
import type { PropsWithChildren } from 'react';

export const metadata: Metadata = {
  title: 'Your App Title',
  description: 'Your app description',
};

export default function RootLayout({ children }: PropsWithChildren<{}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Add any specific head elements like fonts if needed */}
      </head>
      <body>
        <ThemeProvider> {/* Or your existing theme provider */}
          <AuthProvider>
            {children}
            <Toaster /> {/* For AuthFlow notifications */}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### 5. Configure `next.config.ts`

Ensure your `next.config.ts` allows images from `placehold.co` (used by AuthFlow for image placeholders) and your Firebase Storage bucket if you plan to use profile photos.

```ts
// next.config.ts
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true, // Or resolve them
  },
  eslint: {
    ignoreDuringBuilds: true, // Or configure ESLint
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com', // General Firebase Storage domain
        pathname: '/**',
      },
      // If your Firebase Storage URLs are in the format `your-project-id.appspot.com`
      // you might need to add it specifically:
      // {
      //   protocol: 'https',
      //   hostname: 'your-project-id.appspot.com', // REPLACE with your actual bucket hostname
      //   port: '',
      //   pathname: '/**',
      // },
    ],
  },
};

export default nextConfig;
```

### 6. Tailwind CSS and Global Styles

AuthFlow relies on Tailwind CSS and specific global styles (see `src/app/globals.css`). Ensure your target project has Tailwind CSS configured (`tailwind.config.ts`, `postcss.config.js`) and that you copy or adapt the theme variables from AuthFlow's `globals.css` into your project's global CSS file. This is crucial for the UI components to look correct. Pay attention to the HSL color variables for `--background`, `--foreground`, `--primary`, `--accent`, etc.

### 7. Using AuthFlow Features

-   **Protecting Routes**: Use the `ProtectedRoute` component to wrap pages or layouts that require authentication.
    ```tsx
    // Example: src/app/dashboard/page.tsx
    import { ProtectedRoute } from '@/components/protected-route';
    
    export default function DashboardPage() {
      return (
        <ProtectedRoute>
          {/* Your dashboard content here */}
        </ProtectedRoute>
      );
    }
    ```
-   **Accessing Auth State**: Use the `useAuth` hook in your client components.
    ```tsx
    // Example client component
    'use client';
    import { useAuth } from '@/contexts/auth-context';

    function MyComponent() {
      const { user, loading, signOut } = useAuth();
      if (loading) return <p>Loading auth state...</p>;
      if (!user) return <p>Please sign in.</p>;
      return (
        <div>
          <p>Welcome, {user.displayName || user.email}!</p>
          <button onClick={signOut}>Sign Out</button>
        </div>
      );
    }
    ```
-   **Middleware**: The copied `src/middleware.ts` will automatically handle redirects for protected routes and auth pages based on session cookies. No further action is usually needed for this once copied and configured.

### 8. Customization

-   **Logo**: Update `src/components/logo.tsx` or replace its usage.
-   **Styling**: Adjust Tailwind configuration (`tailwind.config.ts`) and global styles (`src/app/globals.css`) to match your project's branding.
-   **Text & Content**: Modify the text and descriptions in the auth pages and components as needed.

By following these steps, you should be able to integrate AuthFlow into a new Next.js project. Remember to test thoroughly.
```