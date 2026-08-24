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
	title: string | React.ReactNode;
	description?: React.ReactNode;
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
		<Card className="gap-0 overflow-hidden rounded-2xl border-border/70 bg-card py-0 shadow-sm transition-shadow hover:shadow-md">
			<CardHeader className="flex flex-row items-center gap-3 bg-gradient-to-br from-card to-muted/25 p-5">
				{avatar && <div className="shrink-0">{avatar}</div>}
				<div className="min-w-0 flex-1">
					<CardTitle className="text-base font-semibold leading-6 text-foreground sm:text-lg">
						{title}
					</CardTitle>
					{description && (
						<CardDescription className="mt-1 line-clamp-2 leading-5">
							{description}
						</CardDescription>
					)}
				</div>
			</CardHeader>

			{fields.length > 0 && (
				<CardContent className="divide-y border-t bg-muted/15 p-0">
					{fields.map((field, idx) => (
						<div
							key={`${field.label}-${idx}`}
							className="grid min-h-12 grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-3 text-sm"
						>
							<span className="font-medium text-muted-foreground">
								{field.label}
							</span>
							<div className="flex min-w-0 items-center justify-end text-right font-medium text-foreground">
								{field.value}
							</div>
						</div>
					))}
				</CardContent>
			)}

			{actions && actions.length > 0 && (
				<CardFooter className="justify-between gap-4 border-t bg-muted/25 px-5 py-3">
					<span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
						Manage
					</span>
					<div className="flex items-center gap-1">
						{actions.map((action, idx) => (
							<div key={idx} className="flex items-center">
								{action.element}
							</div>
						))}
					</div>
				</CardFooter>
			)}
		</Card>
	);
}
