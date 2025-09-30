
import { ModeToggle } from "@/components/theme/modeToggle";
import Link from "next/link";

export default function Home() {
  return (
    <main>
      <div>
        <h1 className="text-4xl p-4">Welcome to the Manager Life!</h1>
      </div>

      <div className="flex gap-4 p-4">
        <Link href="/admin/users">users</Link>
        <ModeToggle />
      </div>
    </main>
  );
}
