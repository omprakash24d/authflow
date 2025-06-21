// src/app/privacy-policy/page.tsx
// This file defines the Privacy Policy page for the application.
// It provides placeholder content for legal terms regarding user data.

import type { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Metadata for the Privacy Policy page.
 */
export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Read the privacy policy for AuthFlow.',
  robots: {
    index: false, // Generally, legal pages are not indexed by search engines.
    follow: false,
  }
};

/**
 * PrivacyPolicyPage component.
 * Renders the legal text for the Privacy Policy.
 * @returns {JSX.Element} The rendered Privacy Policy page.
 */
export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-headline">Privacy Policy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-foreground/80">
            <p className="text-sm text-muted-foreground">Last updated: July 27, 2024</p>
            <p>This Privacy Policy describes Our policies and procedures on the collection, use and disclosure of Your information when You use the Service and tells You about Your privacy rights and how the law protects You.</p>
            
            <h2 className="text-xl font-semibold text-foreground pt-4">1. Collecting and Using Your Personal Data</h2>
            <p>While using Our Service, We may ask You to provide Us with certain personally identifiable information that can be used to contact or identify You. Personally identifiable information may include, but is not limited to: Email address, First name and last name, Usage Data.</p>
            
            <h2 className="text-xl font-semibold text-foreground pt-4">2. Use of Your Personal Data</h2>
            <p>The Company may use Personal Data for the following purposes: to provide and maintain our Service, to manage Your Account, to contact You, to provide You with news, special offers and general information about other goods, services and events which we offer.</p>
            
            <h2 className="text-xl font-semibold text-foreground pt-4">3. Security of Your Personal Data</h2>
            <p>The security of Your Personal Data is important to Us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While We strive to use commercially acceptable means to protect Your Personal Data, We cannot guarantee its absolute security.</p>
            
            <h2 className="text-xl font-semibold text-foreground pt-4">4. Changes to this Privacy Policy</h2>
            <p>We may update Our Privacy Policy from time to time. We will notify You of any changes by posting the new Privacy Policy on this page.</p>
            
            <h2 className="text-xl font-semibold text-foreground pt-4">5. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, You can contact us.</p>
            
            <p className="pt-8 text-sm text-muted-foreground"><em>This is a placeholder document. Please replace with your own Privacy Policy.</em></p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
