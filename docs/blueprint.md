# **App Name**: AuthFlow

## Core Features:

- Authentication System: Supports secure user sign-up and authentication, offering options like email/password, magic links, phone number verification, passkeys, and SSO via Google, GitHub, and Microsoft.
- User Invitation & Waitlist: Allows administrators to invite new users and collects sign-up requests through a waitlist feature with customizable invitation and confirmation templates.
- Session Management: Enables configuration of session lifetimes, inactivity timeouts, and support for multi-session logins, enhancing both security and user experience.
- Access Control & Restrictions: Uses default user permissions to define at sign-up if users can delete their own accounts. Blocklist is implemented so admins can prevent sign ups or logins for specific email, phone number, domain, or Web3 wallet.
- Legal Compliance: Requires consent via checkbox during sign-up for Terms of Service and Privacy Policy, linking to https://indhinditech.com/terms-of-service and https://indhinditech.com.
- Attack Protection: Leverages a tool that monitors password breaches via HaveIBeenPwned during account registration or modification and implements bot protection via Cloudflare Turnstile.
- Notifications & Security Alerts: Notifies users and admins via email or SMS for key events like password resets, email changes, and new device sign-ins. Configurable lockout policies is available as well.

## Style Guidelines:

- Primary color: Deep blue (#3F51B5), offering a sense of security and trust.
- Background color: Light gray (#EEEEEE), to ensure readability and a clean interface.
- Accent color: Teal (#009688), is used for interactive elements, such as buttons and links, to guide the user.
- Body and headline font: 'Inter', sans-serif, providing a modern, neutral, and accessible look, easy to read at various sizes.
- Use flat, outlined icons to maintain a consistent, clean aesthetic across the authentication process.
- A clean and intuitive layout to guide users through authentication steps.
- Subtle animations will be used when a user navigates the pages, but more importantly when sensitive user data must be modified or transmitted.