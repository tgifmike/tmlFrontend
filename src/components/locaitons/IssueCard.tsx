'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface IssueCardProps {
	title: string;
	items: string[];
	variant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

export default function IssueCard({
	title,
	items,
	variant = 'default',
}: IssueCardProps) {
	const [expanded, setExpanded] = useState(false);

	const previewCount = 5;

	if (!items.length) {
		return (
			<Card>
				<CardHeader className="flex flex-row justify-between items-center">
					<CardTitle className="text-sm">{title}</CardTitle>
					<Badge variant="outline">0</Badge>
				</CardHeader>

				<CardContent className="text-muted-foreground text-sm">
					None
				</CardContent>
			</Card>
		);
	}

	const visibleItems = expanded ? items : items.slice(0, previewCount);

	return (
		<Card>
			<CardHeader className="flex flex-row justify-between items-center">
				<CardTitle className="text-sm">{title}</CardTitle>

				<Badge variant={variant}>{items.length}</Badge>
			</CardHeader>

			<CardContent className="space-y-2">
				<ul className="list-disc ml-4 max-h-40 overflow-y-auto text-sm">
					{visibleItems.map((item, idx) => (
						<li key={idx}>{item}</li>
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
			</CardContent>
		</Card>
	);
}
