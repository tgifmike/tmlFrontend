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
		<Card>
			<CardHeader className="flex flex-row justify-between items-center">
				<CardTitle className="text-sm">{title}</CardTitle>

				<Badge variant={badgeVariant}>{items.length}</Badge>
			</CardHeader>

			<CardContent>
				{items.length === 0 ? (
					<span className="text-muted-foreground text-sm">None</span>
				) : (
					<>
						<ul className="list-disc ml-4 max-h-40 overflow-y-auto text-sm">
							{visibleItems.map((item, i) => (
								<li key={i}>{item}</li>
							))}
						</ul>

						{items.length > previewCount && (
							<Button
								size="sm"
								variant="ghost"
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
