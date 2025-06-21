// src/app/terms-of-service/page.tsx
// This file defines the Terms of Service page for the application.
// It provides placeholder content for legal terms.

import type { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Metadata for the Terms of Service page.
 */
export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Read the terms of service for using AuthFlow.',
  robots: {
    index: false, // Generally, legal pages are not indexed by search engines.
    follow: false,
  }
};

/**
 * TermsOfServicePage component.
 * Renders the legal text for the Terms of Service.
 * @returns {JSX.Element} The rendered Terms of Service page.
 */
export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-headline">Terms of Service</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-foreground/80">
            <p className="text-sm text-muted-foreground">Last updated: July 27, 2024</p>
            <p>Please read these terms of service carefully before using Our Service.</p>
            
            <h2 className="text-xl font-semibold text-foreground pt-4">1. Acknowledgment</h2>
            <p>These are the Terms of Service governing the use of this Service and the agreement that operates between You and AuthFlow. These Terms of Service set out the rights and obligations of all users regarding the use of the Service.</p>
            <p>Your access to and use of the Service is conditioned on Your acceptance of and compliance with these Terms of Service. These Terms of Service apply to all visitors, users and others who access or use the Service.</p>

            <h2 className="text-xl font-semibold text-foreground pt-4">2. User Accounts</h2>
            <p>When You create an account with Us, You must provide Us information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of Your account on Our Service.</p>
            <p>You are responsible for safeguarding the password that You use to access the Service and for any activities or actions under Your password, whether Your password is with Our Service or a Third-Party Social Media Service.</p>

            <h2 className="text-xl font-semibold text-foreground pt-4">3. Termination</h2>
            <p>We may terminate or suspend Your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if You breach these Terms of Service.</p>
            <p>Upon termination, Your right to use the Service will cease immediately.</p>

            <h2 className="text-xl font-semibold text-foreground pt-4">4. Governing Law</h2>
            <p>The laws of the Country, excluding its conflicts of law rules, shall govern this Terms and Your use of the Service. Your use of the Application may also be subject to other local, state, national, or international laws.</p>

            <h2 className="text-xl font-semibold text-foreground pt-4">5. Contact Us</h2>
            <p>If you have any questions about these Terms of Service, you can contact us.</p>
            
            <p className="pt-8 text-sm text-muted-foreground"><em>This is a placeholder document. Please replace with your own Terms of Service.</em></p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
