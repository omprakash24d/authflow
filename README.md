
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
- [Deployment](#deployment)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Author & Contact](#author--contact)
- [Acknowledgements](#acknowledgements)

## Overview

AuthFlow aims to provide developers with a production-ready authentication system that can be easily integrated or used as a starting point for new Next.js applications. It handles common authentication flows such as sign-up, sign-in, password reset, social logins, and provides a dynamic dashboard for authenticated users.

## Key Features

-   **Email/Password Authentication**: Secure sign-up and sign-in with email and password.
-   **Username or Email Login**: Users can sign in using either their registered email or username.
-   **Social Logins**: Integrated with Google, GitHub, and Microsoft for easy OAuth sign-in. New social users are assigned a unique, auto-generated username.
-   **Multi-Factor Authentication (MFA/2FA)**: Users can secure their accounts with Time-based One-Time Passwords (TOTP) using authenticator apps like Google Authenticator or Authy.
-   **Password Reset**: "Forgot Password" functionality via email.
-   **Email Verification**: Users are prompted to verify their email address after sign-up.
-   **Session Management**: Uses secure, HTTP-only cookies for session handling.
-   **Route Protection**: Middleware and client-side checks to protect routes requiring authentication.
-   **User Profile Management**: UI for users to update their first name, last name, username, and profile photo (uploads to Firebase Storage).
-   **Dynamic Dashboard**: An engaging dashboard with cards and charts to visualize mock user activity data.
-   **Security Features**:
    -   Password strength indicator.
    -   AI-powered password breach detection (using Genkit and HaveIBeenPwned API).
    -   CSRF protection (implicitly handled by Next.js and cookie settings).
-   **UI & UX**:
    -   Built with ShadCN UI components and Tailwind CSS for a modern, responsive design.
    -   Dark/Light mode support.
    -   Toast notifications for user feedback.
-   **Developer Experience**:
    -   TypeScript for type safety.
    -   Organized project structure with detailed comments.

## Tech Stack

-   **Framework**: Next.js (App Router)
-   **Authentication**: Firebase Authentication (including MFA)
-   **Database**: Firebase Firestore (for user profiles and username lookups)
-   **File Storage**: Firebase Storage (for profile photos)
-   **Styling**: Tailwind CSS
-   **UI Components**: ShadCN UI
-   **Charts**: Recharts
-   **QR Code Generation**: `qrcode` (for MFA setup)
-   **AI (Optional)**: Genkit with Google AI (for password breach detection)
-   **Language**: TypeScript
-   **Form Handling**: React Hook Form with Zod for validation

## Screenshots

<table>
  <tr>
    <td align="center"><strong>Sign In Page</strong></td>
    <td align="center"><strong>Sign Up Page</strong></td>
  </tr>
  <tr>
    <td><img src="public/images/sign_in.png" alt="AuthFlow Sign In Page"></td>
    <td><img src="public/images/sign_up.png" alt="AuthFlow Sign Up Page"></td>
  </tr>
  <tr>
    <td align="center"><strong>Dashboard</strong></td>
    <td align="center"><strong>Account Settings</strong></td>
  </tr>
  <tr>
    <td><img src="public/images/dashboard.png" alt="AuthFlow Dashboard"></td>
    <td><img src="public/images/setting.png" alt="AuthFlow Settings Page"></td>
  </tr>
  <tr>
    <td align="center"><strong>MFA Setup</strong></td>
    <td align="center"><strong>Forgot Password</strong></td>
  </tr>
  <tr>
    <td><img src="public/images/mfa_setup.png" alt="AuthFlow MFA Setup"></td>
    <td><img src="public/images/forgot_password.png" alt="AuthFlow Forgot Password Page"></td>
  </tr>
</table>


## Getting Started

Follow these steps to get a local copy of AuthFlow up and running.

### Prerequisites

-   Node.js (v18 or newer recommended)
-   npm or yarn
-   A Firebase project

### Firebase Project Setup

Follow these steps carefully to configure your Firebase project.

1.  **Create a Firebase Project**: Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.

2.  **Upgrade to Identity Platform (CRITICAL for MFA)**:
    -   In the Firebase Console, go to **Authentication**.
    -   Click the **Sign-in method** tab.
    -   You should see a banner to **"Upgrade to Identity Platform"**. Click it and complete the upgrade. This is a **free** upgrade required for advanced features like MFA.
    -   **Important**: Some advanced Identity Platform features, including TOTP (Authenticator App MFA), require your project to be linked to a **Google Cloud Billing account**. This does not mean you will be charged; it is for identity verification. You will still be on the free tier. You can link a billing account in the [Google Cloud Console](https://console.cloud.google.com/) under "Billing".

3.  **Enable Authentication Methods**:
    -   In your Firebase project, go back to **Authentication** > **Sign-in method**.
    -   Enable **Email/Password**.
    -   Enable desired social providers (Google, GitHub, Microsoft).
    -   To enable MFA, scroll to the "Advanced" section, click "Change" next to "SMS multi-factor authentication", and **enable the "Authenticator app" toggle**.

4.  **Set up Firestore**:
    -   Go to **Firestore Database** and create a database. Start in "test mode" for local development, but **ensure you set up proper security rules before production.**

5.  **Set up Firebase Storage**:
    -   Go to **Storage** and create a storage bucket. You will need to update the security rules to allow users to read/write their own profile photos. A basic rule set is provided below:
    ```
    rules_version = '2';
    service firebase.storage {
      match /b/{bucket}/o {
        match /profile_photos/{userId}/{allPaths=**} {
          allow read;
          allow write: if request.auth != null && request.auth.uid == userId;
        }
      }
    }
    ```

6.  **Generate Service Account Key (for Admin SDK)**:
    -   In Firebase Console: Project settings (gear icon) > Service accounts.
    -   Select "Node.js" and click "Generate new private key". A JSON file will download.

7.  **Get Web App Configuration (for Client SDK)**:
    -   In Firebase Console: Project settings (gear icon) > General tab.
    -   Register a Web app (`</>`) if you haven't. Firebase will provide a `firebaseConfig` object.

## Installation

```bash
git clone https://github.com/omprakash24d/authflow.git
cd authflow
npm install
```

## Environment Variables

Create a file named `.env.local` in the project root and add your Firebase credentials.

**Example `.env.local` structure:**
```env
# Firebase Client SDK Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin SDK Configuration (server-side)
# IMPORTANT: If pasting FIREBASE_ADMIN_PRIVATE_KEY directly, escape newlines (\n) as \\n.
FIREBASE_ADMIN_PROJECT_ID=your_project_id_from_service_account
FIREBASE_ADMIN_CLIENT_EMAIL=your_client_email_from_service_account
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nYOUR_PRIVATE_KEY_CONTENT_HERE\\n-----END PRIVATE KEY-----\\n"

# Genkit (Optional)
GOOGLE_API_KEY=your_google_ai_api_key
```

## Run Locally

Start the development server:
```bash
npm run dev
```
The app will be available at `http://localhost:9004`.

## Easy Integration Guide

AuthFlow is best used as a starter kit. To integrate into an existing Next.js project:
1.  **Copy Core Files**: Copy `src/app/(auth)`, `src/app/api/auth`, `src/lib/firebase`, `src/components/auth`, `src/middleware.ts`, and other relevant files.
2.  **Install Dependencies**: Merge `package.json` dependencies and run `npm install`.
3.  **Configure `next.config.ts`** to allow image domains from Firebase Storage and social providers.
4.  **Configure Tailwind & CSS**: Copy `tailwind.config.ts` and the HSL variables from `src/app/globals.css`.
5.  **Update Root Layout**: Wrap your root layout with `ThemeProvider` and `AuthProvider`.
6.  **Verify Environment Variables** are set up correctly.

## Deployment

1.  **Hosting**: Use a provider like Vercel or Firebase Hosting.
2.  **Environment Variables**: Securely set all environment variables in your hosting provider's settings. **Do not commit `.env.local` to a public repository.**
3.  **Firebase Security Rules**: **CRITICAL**: Before going live, configure production-ready security rules for Firestore and Storage to prevent unauthorized access.

## Roadmap

-   [x] Implement multi-factor authentication (MFA/2FA).
-   [x] Add full implementation for profile photo uploads to Firebase Storage.
-   [x] Build out a dynamic dashboard with stats and charts.
-   [ ] Add account linking for multiple social providers.
-   [ ] Build out a more comprehensive admin panel for user management.

## Contributing

Contributions are welcome! Please feel free to open an issue or submit a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Author & Contact

AuthFlow was developed by Om Prakash.
-   **LinkedIn**: [Om Prakash](https://www.linkedin.com/in/omprakash24d/)
-   **GitHub**: [@omprakash24d](https://github.com/omprakash24d)
-   **Twitter**: [@omprakash24d](https://twitter.com/omprakash24d)

## Acknowledgements

-   [Next.js](https://nextjs.org/)
-   [Firebase](https://firebase.google.com/)
-   [Tailwind CSS](https://tailwindcss.com/)
-   [ShadCN UI](https://ui.shadcn.com/)
-   [Genkit](https://firebase.google.com/docs/genkit)
