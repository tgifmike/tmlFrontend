import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
	CardFooter,
} from '@/components/ui/card';

interface Field {
	label: string;
	value: React.ReactNode;
}

interface Action {
	element: React.ReactNode; // e.g., button, dialog, toggle
}

interface DataCardProps {
	title: string;
	description?: string;
	avatar?: React.ReactNode;
	fields: Field[];
	actions?: Action[];
}

export function DataCard({
	title,
	description,
	avatar,
	fields,
	actions,
}: DataCardProps) {
	return (
		<Card className="bg-accent">
			<CardHeader className="flex flex-row items-center gap-3 p-4">
				{avatar}
				<div>
					<CardTitle className="text-base">{title}</CardTitle>
					{description && <CardDescription>{description}</CardDescription>}
				</div>
			</CardHeader>

			<CardContent className="space-y-3 p-4 pt-0">
				{fields.map((field, idx) => (
					<div key={idx} className="flex justify-between items-center text-sm">
						<span>{field.label}</span>
						{field.value}
					</div>
				))}
			</CardContent>

			{actions && (
				<CardFooter className="flex justify-center gap-2 p-4 pt-0">
					{actions.map((a, idx) => (
						<div key={idx}>{a.element}</div>
					))}
				</CardFooter>
			)}
		</Card>
	);
}
