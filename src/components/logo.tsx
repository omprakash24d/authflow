import { ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity">
      <ShieldCheck className="h-8 w-8" />
      <h1 className="text-2xl font-bold font-headline">AuthFlow</h1>
    </Link>
  );
}
