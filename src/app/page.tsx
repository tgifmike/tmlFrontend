import React from "react";
import Link from "next/link";

export default function Home() {
  return (
    <main>
      <div>
        <h1 className="text-4xl p-4">Welcome to the Manager Life!</h1>
      </div>

      <div>
        <Link href="/admin/users">users</Link>
      </div>
    </main>
  );
}
