'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Props {
	title: string;
	items: string[];
	severity: 'critical' | 'warning' | 'minor';
}

const severityStyles = {
	critical: 'destructive',
	warning: 'secondary',
	minor: 'outline',
} as const;

export default function IssueCard({ title, items, severity }: Props) {
	const [expanded, setExpanded] = useState(false);

	const previewCount = 5;

	const badgeVariant =
		items.length === 0 ? 'outline' : severityStyles[severity];

	const visibleItems = expanded ? items : items.slice(0, previewCount);

	return (
		<Card className="gap-0 overflow-hidden py-0 shadow-none">
			<CardHeader className="flex flex-row items-center justify-between border-b px-4 py-3">
				<CardTitle className="text-sm">{title}</CardTitle>

				<Badge variant={badgeVariant}>{items.length}</Badge>
			</CardHeader>

			<CardContent className="p-4">
				{items.length === 0 ? (
					<span className="text-sm text-muted-foreground">None recorded</span>
				) : (
					<>
						<ul className="max-h-40 space-y-1.5 overflow-y-auto text-sm">
							{visibleItems.map((item, i) => (
								<li key={`${item}-${i}`} className="flex gap-2">
									<span className="mt-2 size-1.5 shrink-0 rounded-full bg-muted-foreground" />
									<span className="break-words">{item}</span>
								</li>
							))}
						</ul>

						{items.length > previewCount && (
							<Button
								size="sm"
								variant="link"
								className="mt-2 h-auto p-0 text-xs"
								onClick={() => setExpanded(!expanded)}
							>
								{expanded
									? 'Show Less'
									: `Show ${items.length - previewCount} More`}
							</Button>
						)}
					</>
				)}
			</CardContent>
		</Card>
	);
}
