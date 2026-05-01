import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-md text-center space-y-6">
        <h1 className="text-4xl font-bold">403</h1>

        <h2 className="text-xl font-semibold">
          Access Denied
        </h2>

        <p className="text-muted-foreground">
          You do not have permission to view this page.
        </p>

        <div className="flex gap-3 justify-center">
          <Button asChild>
            <Link href="/dashboard">
              Dashboard
            </Link>
          </Button>

          <Button variant="outline" asChild>
            <Link href="/">
              Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}   