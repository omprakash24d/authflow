
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
- [Easy Integration Guide](#easy-integration-guide)
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

## Easy Integration Guide

AuthFlow is designed as a **starter kit**, not a drop-in library. The easiest way to use it is to build your application on top of it. However, if you need to integrate its features into an existing Next.js project, this guide provides a clear, step-by-step process.

### Step 1: Copy Core Files

Copy the following directories and files from this project into your target project's `src` directory.

-   **Authentication Logic & Pages**:
    -   `src/app/(auth)`: All sign-in, sign-up, forgot-password pages.
    -   `src/app/api/auth`: Backend routes for session management.
    -   `src/lib/firebase`: All Firebase configuration and utilities.
    -   `src/lib/validators/auth.ts`: Form validation schemas.
    -   `src/lib/rate-limiter.ts`: API security utility.
    -   `src/contexts/auth-context.tsx`: Global authentication provider.
    -   `src/middleware.ts`: Route protection middleware (copy to the root of `src`).

-   **UI Components**:
    -   `src/components/auth`: All components used on auth pages.
    -   `src/components/auth-layout.tsx`: Layout for auth pages.
    -   `src/components/logo.tsx`: App logo.
    -   `src/components/protected-route.tsx`: Client-side route protection wrapper.
    -   `src/components/ui`: Copy all ShadCN UI components. It's easier to copy the entire directory or ensure you have the necessary components (`Button`, `Input`, `Card`, `Form`, `Alert`, `Dialog`, etc.) installed via the ShadCN CLI.
    -   `src/hooks/use-toast.ts` & `src/components/ui/toaster.tsx`: Toast notification system.

-   **Example Protected Content (Optional but Recommended)**:
    -   `src/app/dashboard`: Example protected dashboard.
    -   `src/components/dashboard`: UI components for the dashboard.

-   **AI Features (Optional)**:
    -   `src/ai`: All Genkit flows and configuration.

### Step 2: Install Dependencies

Merge the `dependencies` and `devDependencies` from AuthFlow's `package.json` into your project's `package.json`. Then, run `npm install` or `yarn install`.

**Key Dependencies**: `firebase`, `firebase-admin`, `next-themes`, `react-hook-form`, `zod`, `lucide-react`, `shadcn-ui` components, `genkit` (optional).

### Step 3: Configure `next.config.ts`

Ensure your `next.config.ts` allows images from `placehold.co` (for placeholders), `firebasestorage.googleapis.com` (for user photos), and social provider domains.

```ts
// next.config.ts
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  // ... your other config
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'placehold.co' },
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },
};

export default nextConfig;
```

### Step 4: Configure Tailwind CSS & Global Styles

AuthFlow relies on a specific Tailwind and CSS variable setup for its theming.

1.  **Copy `tailwind.config.ts`**: Replace your `tailwind.config.ts` with AuthFlow's or carefully merge them.
2.  **Copy `globals.css`**: Copy the contents of `src/app/globals.css` into your project's global stylesheet. This file contains the crucial HSL color variables that power the theme.
3.  **Ensure `postcss.config.js` is set up for Tailwind.**

### Step 5: Update Root Layout (`src/app/layout.tsx`)

Wrap your root layout's `body` content with `ThemeProvider` and `AuthProvider`. This enables theme switching and provides global authentication state. Also, add the `<Toaster />` component to enable notifications.

```tsx
// src/app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/auth-context';
import { ThemeProvider } from '@/components/theme-provider';
import type { PropsWithChildren } from 'react';

// ... your metadata

export default function RootLayout({ children }: PropsWithChildren<{}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>{/* Your head tags */}</head>
      <body>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### Step 6: Verify Key Integration Points

-   **Environment Variables**: Ensure your `.env.local` file is populated with all the necessary Firebase credentials as outlined in the "Environment Variables" section.
-   **Middleware**: The `src/middleware.ts` file should now be in your project root. It will automatically protect the `/dashboard` route and handle redirects. You can add more paths to the `PROTECTED_PATHS` array as needed.
-   **Protecting Routes**: To protect any new page you create, wrap its content in the `<ProtectedRoute>` component.

By following these steps, you can successfully integrate AuthFlow's robust authentication system into your own Next.js application.

## API Reference

*No dedicated API endpoints are exposed for public consumption. The `/api/auth/*` routes are for internal use by the application to manage session cookies and user data lookups.*

## Deployment

When deploying AuthFlow:

1.  **Hosting Provider**: Use a provider that supports Next.js, such as **Vercel** or **Firebase Hosting**.
2.  **Environment Variables**: Ensure all necessary environment variables (especially `NEXT_PUBLIC_FIREBASE_*` and `GOOGLE_APPLICATION_CREDENTIALS` or `FIREBASE_ADMIN_*`) are correctly set in your hosting environment. **Never commit your `.env.local` file or service account JSON file to your repository if it's public.**
3.  **Firebase Security Rules**: **CRITICAL**: Before going live, ensure your Firebase Authentication settings and Firestore/Storage security rules are properly configured for production to prevent unauthorized access. The default "test mode" rules are insecure.
4.  **Build Command**: Use `npm run build` or `yarn build`.

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
