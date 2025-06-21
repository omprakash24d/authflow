# AuthFlow: Comprehensive User Authentication for Next.js & Firebase

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

AuthFlow is a robust and feature-rich user authentication starter system built with Next.js (App Router), Firebase, Tailwind CSS, ShadCN UI, and Genkit (for optional AI features). It provides a secure and scalable foundation for managing users in your applications.

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Screenshots](#screenshots)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Firebase Project Setup](#firebase-project-setup)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Run Locally](#run-locally)
- [Running Tests](#running-tests)
- [Usage & Integration](#usage--integration)
- [API Reference](#api-reference)
- [Deployment](#deployment)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Author & Contact](#author--contact)
- [Acknowledgements](#acknowledgements)

## Overview

AuthFlow aims to provide developers with a production-ready authentication system that can be easily integrated or used as a starting point for new Next.js applications. It handles common authentication flows such as sign-up, sign-in, password reset, social logins, and provides a basic dashboard structure for authenticated users.

## Key Features

-   **Email/Password Authentication**: Secure sign-up and sign-in with email and password.
-   **Username or Email Login**: Users can sign in using either their registered email or username.
-   **Social Logins**: Integrated with Google, GitHub, and Microsoft for easy OAuth sign-in. New social users are assigned a unique, auto-generated username which they can change in their settings.
-   **Password Reset**: "Forgot Password" functionality via email.
-   **Email Verification**: Users are prompted to verify their email address after sign-up.
-   **Session Management**: Uses HTTP-only cookies for secure session handling.
-   **Route Protection**: Middleware and client-side checks to protect routes requiring authentication.
-   **User Profile Management**: Basic UI for users to view and update their profile information (first name, last name, username).
-   **Security Features**:
    -   Password strength indicator.
    -   AI-powered password breach detection (using Genkit and HaveIBeenPwned API).
    -   CSRF protection (implicitly handled by Next.js API routes and cookie settings).
-   **UI & UX**:
    -   Built with ShadCN UI components and Tailwind CSS for a modern, responsive design.
    -   Dark/Light mode support.
    -   Toast notifications for user feedback.
-   **Developer Experience**:
    -   TypeScript for type safety.
    -   Organized project structure.
    -   Detailed comments and integration guide.

## Tech Stack

-   **Framework**: Next.js (App Router)
-   **Authentication**: Firebase Authentication
-   **Database**: Firebase Firestore (for user profiles and username lookups)
-   **Styling**: Tailwind CSS
-   **UI Components**: ShadCN UI
-   **AI (Optional)**: Genkit with Google AI (for password breach detection)
-   **Language**: TypeScript
-   **Form Handling**: React Hook Form with Zod for validation

## Screenshots

<table>
  <tr>
    <td align="center"><strong>Home Page</strong></td>
    <td align="center"><strong>Sign In Page</strong></td>
  </tr>
  <tr>
    <td><img src="https://placehold.co/800x450.png" alt="AuthFlow Home Page" data-ai-hint="home page"></td>
    <td><img src="https://placehold.co/800x450.png" alt="AuthFlow Sign In Page" data-ai-hint="signin form"></td>
  </tr>
  <tr>
    <td align="center"><strong>Sign Up Page</strong></td>
    <td align="center"><strong>Forgot Password Page</strong></td>
  </tr>
  <tr>
    <td><img src="https://placehold.co/800x450.png" alt="AuthFlow Sign Up Page" data-ai-hint="signup form"></td>
    <td><img src="https://placehold.co/800x450.png" alt="AuthFlow Forgot Password Page" data-ai-hint="forgot password"></td>
  </tr>
  <tr>
    <td align="center"><strong>Dashboard</strong></td>
    <td align="center"><strong>Account Settings</strong></td>
  </tr>
  <tr>
    <td><img src="https://placehold.co/800x450.png" alt="AuthFlow Dashboard" data-ai-hint="user dashboard"></td>
    <td><img src="https://placehold.co/800x450.png" alt="AuthFlow Settings Page" data-ai-hint="settings page"></td>
  </tr>
</table>


## Getting Started

Follow these steps to get a local copy of AuthFlow up and running.

### Prerequisites

-   Node.js (v18 or newer recommended)
-   npm or yarn
-   A Firebase project

### Firebase Project Setup

1.  **Create a Firebase Project**: Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project (or use an existing one).
2.  **Enable Authentication Methods**:
    -   In your Firebase project, go to "Authentication" > "Sign-in method".
    -   Enable "Email/Password".
    -   Enable desired social providers (Google, GitHub, Microsoft). For each, you'll need to follow Firebase's instructions for providing necessary app IDs and secrets from the respective provider platforms.
3.  **Set up Firestore**:
    -   Go to "Firestore Database" and create a database. Start in "test mode" for easy local development, but **ensure you set up proper security rules before going to production.**
    -   AuthFlow uses Firestore to store user profiles (e.g., first name, last name) and a separate collection for username-to-email mapping to allow login with username.
4.  **Generate Service Account Key (for Admin SDK)**:
    -   In Firebase Console: Project settings (gear icon) > Service accounts.
    -   Select "Node.js" and click "Generate new private key". A JSON file will download. **Keep this file secure.** You'll use its content or path for environment variables.
5.  **Get Web App Configuration (for Client SDK)**:
    -   In Firebase Console: Project settings (gear icon) > General tab.
    -   Scroll down to "Your apps". If you don't have a web app, click "Add app" and select the Web platform (`</>`).
    -   Register the app and Firebase will provide you with a `firebaseConfig` object. You'll use these values for your client-side environment variables.

## Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/omprakash24d/authflow.git # Or your project's URL
cd authflow
npm install
# or
# yarn install
```

## Environment Variables

AuthFlow relies on environment variables for Firebase configuration and other settings.

1.  Create a file named `.env.local` in the root of your project.
2.  Copy the contents of the `.env` (if it has placeholders) or the example below into `.env.local`.
3.  Replace the placeholder values with your actual Firebase project credentials.

**Example `.env.local` structure:**

```env
# Firebase Client SDK Configuration (publicly accessible)
# Get these from your Firebase project settings > Your apps > Web app config
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin SDK Configuration (server-side, keep private)
# Option 1: Path to your service account key JSON file (recommended for deployed environments)
# If using this, comment out or remove the individual FIREBASE_ADMIN_* vars below.
# Ensure the path is correct relative to where your app runs or use an absolute path.
# GOOGLE_APPLICATION_CREDENTIALS=path/to/your/serviceAccountKey.json

# Option 2: Individual Admin SDK credentials (can be used for local development)
# Get these from the service account JSON file you downloaded.
# IMPORTANT: If pasting FIREBASE_ADMIN_PRIVATE_KEY directly, escape all newline characters (\n) as \\n.
FIREBASE_ADMIN_PROJECT_ID=your_project_id_from_service_account
FIREBASE_ADMIN_CLIENT_EMAIL=your_client_email_from_service_account
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nYOUR_PRIVATE_KEY_CONTENT_HERE\\nMORE_KEY_CONTENT\\n-----END PRIVATE KEY-----\\n"

# Genkit (Optional - for AI features like password breach check)
# Get this from Google AI Studio or Google Cloud Console
GOOGLE_API_KEY=your_google_ai_api_key
```

**Important Notes on Admin SDK Credentials:**
-   **`GOOGLE_APPLICATION_CREDENTIALS`**: This is the recommended method for deployed environments (like Firebase Hosting with Cloud Functions, Google Cloud Run, etc.). The SDK automatically finds and uses this file.
-   **Individual `FIREBASE_ADMIN_*` vars**: Useful for local development or environments where mounting a file is tricky. **If you paste the `FIREBASE_ADMIN_PRIVATE_KEY` directly into the `.env.local` file, all newline characters (`\n`) within the key *must* be escaped as `\\n`.**

## Run Locally

1.  **Ensure `.env.local` is set up correctly.**
2.  Start the development server:

    ```bash
    npm run dev
    # or
    # yarn dev
    ```
    This usually starts the app on `http://localhost:9004` (as configured in `package.json`).

3.  If you plan to use Genkit features (like the password breach checker), you might need to run the Genkit development server in a separate terminal:
    ```bash
    npm run genkit:dev
    # or
    # npx genkit start -- tsx src/ai/dev.ts
    ```

## Running Tests

*To be added. Currently, no automated tests are configured for this project.*

## Usage & Integration

AuthFlow is designed to be relatively portable. Here's how you can integrate it into another Next.js (App Router) project:

### 1. Copy Core AuthFlow Directories and Files

Copy the following directories and files from this project into the `src` directory of your target project:

-   **`src/app/(auth)`**: Contains the pre-built sign-in, sign-up, and forgot-password pages.
-   **`src/app/api/auth`**: Contains the necessary API backend routes for session management and username-to-email lookups.
-   **`src/app/dashboard`**: Example protected dashboard pages. You can adapt or replace these.
-   **`src/components/auth`**: UI components used by the authentication pages (forms, wrappers, etc.).
-   **`src/components/auth-layout.tsx`**: Layout specifically for authentication pages.
-   **`src/components/dashboard`**: UI components for the example dashboard and settings pages.
-   **`src/components/protected-route.tsx`**: A client component to protect routes that require authentication.
-   **`src/components/logo.tsx`**: (Optional, if you want to use the AuthFlow logo or adapt it).
-   **`src/contexts/auth-context.tsx`**: The React context provider for managing authentication state.
-   **`src/lib/firebase`**: Firebase client and admin configurations, and auth utility functions.
-   **`src/lib/validators/auth.ts`**: Zod schemas for validating authentication forms.
-   **`src/middleware.ts`**: Next.js middleware for protecting routes and handling redirects based on auth state.
-   **`src/hooks/use-toast.ts` & `src/components/ui/toast.tsx`, `src/components/ui/toaster.tsx`**: (If you want to use the same toast notification system).
-   **Relevant ShadCN UI components** from `src/components/ui` that are used by the auth components (e.g., Button, Input, Card, Form, Alert, Dialog, Checkbox, Label, Separator, Avatar etc.). It might be easier to copy the entire `src/components/ui` directory or ensure you have these components set up in your target project using `npx shadcn-ui@latest add ...`.
-   **`src/ai` directory** (Optional): If you want to use the Genkit-based password breach detection or other AI features.

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

### 3. Update `src/app/layout.tsx`

Wrap your root layout's children with `ThemeProvider` (for dark/light mode, optional but used by AuthFlow styles) and `AuthProvider`. Also, include the `Toaster` component for notifications.

```tsx
// src/app/layout.tsx
import type { Metadata } from 'next';
import './globals.css'; // Ensure you have global styles similar to AuthFlow's
import { Toaster } from '@/components/ui/toaster'; // Assuming you copied this
import { AuthProvider } from '@/contexts/auth-context'; // Copied from AuthFlow
import { ThemeProvider } from '@/components/theme-provider'; // Copied or your own
import type { PropsWithChildren } from 'react';

// Optional: Add fonts if AuthFlow's default font ('Inter') is desired
// import { Inter } from 'next/font/google';
// const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Your App Title',
  description: 'Your app description',
};

export default function RootLayout({ children }: PropsWithChildren<{}>) {
  return (
    // Add inter.variable to html tag if using Inter font like AuthFlow
    <html lang="en" suppressHydrationWarning /* className={inter.variable} */ >
      <head>
        {/* Add any specific head elements like fonts if needed */}
      </head>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
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

### 4. Configure `next.config.ts`

Ensure your `next.config.ts` (or `next.config.js`) allows images from `placehold.co` (used by AuthFlow for image placeholders) and your Firebase Storage bucket if you plan to use profile photos.

```ts
// next.config.ts
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true, // Recommended to resolve errors, but can be ignored
  },
  eslint: {
    ignoreDuringBuilds: true, // Recommended to configure ESLint, but can be ignored
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co', // For placeholder images
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com', // General Firebase Storage domain
        // You might want to make pathname more specific if you know your bucket structure,
        // e.g., pathname: '/v0/b/your-project-id.appspot.com/o/**',
      },
      // If your Firebase Storage URLs are in the format `your-project-id.appspot.com`
      // you might need to add it specifically. REPLACE with your actual bucket hostname.
      // {
      //   protocol: 'https',
      //   hostname: 'your-project-id.appspot.com',
      //   pathname: '/**',
      // },
    ],
  },
};

export default nextConfig;
```

### 5. Tailwind CSS and Global Styles

AuthFlow relies on Tailwind CSS and specific global styles (see `src/app/globals.css`). Ensure your target project has Tailwind CSS configured (`tailwind.config.ts`, `postcss.config.js`) and that you copy or adapt the theme variables from AuthFlow's `globals.css` into your project's global CSS file. This is crucial for the UI components to look correct. Pay attention to the HSL color variables for `--background`, `--foreground`, `--primary`, `--accent`, etc.

Your `tailwind.config.ts` should also be set up to use these CSS variables, similar to AuthFlow's.

### 6. Using AuthFlow Features

-   **Protecting Routes**: Use the `ProtectedRoute` client component to wrap pages or layouts that require authentication.
    ```tsx
    // Example: src/app/some-protected-page/page.tsx
    import { ProtectedRoute } from '@/components/protected-route';
    
    export default function SomeProtectedPage() {
      return (
        <ProtectedRoute>
          {/* Your protected content here */}
        </ProtectedRoute>
      );
    }
    ```
-   **Accessing Auth State**: Use the `useAuth` hook in your client components.
    ```tsx
    // Example client component
    'use client';
    import { useAuth } from '@/contexts/auth-context';
    import { Button } from '@/components/ui/button'; // Example

    function MyComponent() {
      const { user, loading, signOut } = useAuth();

      if (loading) return <p>Loading authentication state...</p>;
      if (!user) return <p>Please sign in to see this content.</p>;

      return (
        <div>
          <p>Welcome, {user.displayName || user.email}!</p>
          <Button onClick={signOut}>Sign Out</Button>
        </div>
      );
    }
    ```
-   **Middleware**: The copied `src/middleware.ts` will automatically handle redirects for protected routes and auth pages based on session cookies. No further action is usually needed for this once copied and configured. It ensures that unauthenticated users trying to access `/dashboard` are sent to `/signin`, and authenticated users trying to access `/signin` are sent to `/dashboard`.

### 7. Customization

-   **Logo**: Update `src/components/logo.tsx` or replace its usage in `src/components/auth-layout.tsx` and other relevant places.
-   **Styling**: Adjust Tailwind configuration (`tailwind.config.ts`) and global styles (`src/app/globals.css`) to match your project's branding.
-   **Text & Content**: Modify the text, descriptions, and links (e.g., Terms of Service, Privacy Policy) in the auth pages and components as needed.
-   **Dashboard**: The provided `/dashboard` pages and components are examples. Customize them to fit your application's needs.

By following these steps, you should be able to integrate AuthFlow into a new Next.js project. Remember to test thoroughly, especially the authentication flows and environment variable configurations.

## API Reference

*No dedicated API endpoints are exposed for public consumption. The `/api/auth/*` routes are for internal use by the application to manage session cookies and user data lookups.*

## Deployment

When deploying AuthFlow:

1.  **Environment Variables**: Ensure all necessary environment variables (especially `NEXT_PUBLIC_FIREBASE_*` and `GOOGLE_APPLICATION_CREDENTIALS` or `FIREBASE_ADMIN_*`) are correctly set in your hosting environment. **Never commit your `.env.local` file or service account JSON file to your repository if it's public.**
2.  **Firebase Admin SDK**:
    -   If using `GOOGLE_APPLICATION_CREDENTIALS` pointing to a path, ensure the `serviceAccountKey.json` file is accessible by your deployed application (e.g., by including it in the deployment package or securely mounting it).
    -   If using individual `FIREBASE_ADMIN_*` variables, ensure they are correctly set in the deployment environment. Remember the `FIREBASE_ADMIN_PRIVATE_KEY` needs newlines escaped if set as a single string.
3.  **Firebase Security Rules**: **CRITICAL**: Before going live, ensure your Firebase Authentication settings and Firestore/Storage security rules are properly configured for production to prevent unauthorized access. The default "test mode" rules are insecure.
4.  **Build Command**: Use `npm run build` or `yarn build`.
5.  **Next.js Output**: AuthFlow uses the Next.js App Router. Ensure your hosting provider supports Next.js (preferably version 13.4+ for stable App Router support). Firebase Hosting is a good option.

## Roadmap

-   [ ] Implement multi-factor authentication (MFA).
-   [ ] Add account linking for multiple social providers.
-   [ ] Build out a more comprehensive admin dashboard for user management.
-   [ ] Add full implementation for profile photo uploads to Firebase Storage.

## Contributing

Contributions are welcome! If you have suggestions for improvements, please feel free to open an issue or submit a pull request.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Author & Contact

AuthFlow was developed by Om Prakash.

-   **LinkedIn**: [Om Prakash](https://www.linkedin.com/in/omrakash24d/)
-   **GitHub**: [@omprakash24d](https://github.com/omprakash24d)
-   **Twitter**: [@omprakash25d](https://twitter.com/omprakash25d)

For issues, questions, or contributions, please feel free to open an issue or pull request on the project repository.

## Acknowledgements

-   [Next.js](https://nextjs.org/)
-   [Firebase](https://firebase.google.com/)
-   [Tailwind CSS](https://tailwindcss.com/)
-   [ShadCN UI](https://ui.shadcn.com/)
-   [Genkit](https://firebase.google.com/docs/genkit)
