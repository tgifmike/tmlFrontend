
import { ModeToggle } from "@/components/theme/ModeToggle";
import { Table, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";

export default function Home() {
  return (
		<main>
			<div>
				<h1 className="text-4xl p-4">Welcome to the Manager Life!</h1>
			</div>

			<div className="flex gap-4 text-2xl">
			  <Link href="/admin/users">users</Link>
			  <ModeToggle />
			</div>
			
		</main>
	);
}
