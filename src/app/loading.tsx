
import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div
      className="flex min-h-screen items-center justify-center bg-background"
      aria-live="polite"
      aria-busy="true"
    >
      <Loader2 className="h-16 w-16 animate-spin text-primary" />
    </div>
  );
}
