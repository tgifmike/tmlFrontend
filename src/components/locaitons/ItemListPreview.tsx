'use client';

import { useState } from "react";

interface ItemListPreviewProps {
	items: string[];
	previewCount?: number;
}

const ItemListPreview: React.FC<ItemListPreviewProps> = ({
	items,
	previewCount = 5,
}) => {
	const [expanded, setExpanded] = useState(false);

	if (!items || items.length === 0) return <span>None</span>;

	const previewItems = expanded ? items : items.slice(0, previewCount);

	return (
		<div>
			<ul className="list-disc ml-4 max-h-40 overflow-y-auto">
				{previewItems.map((item, idx) => (
					<li key={idx}>{item}</li>
				))}
			</ul>
			{items.length > previewCount && (
				<button
					className="text-blue-600 underline mt-1"
					onClick={() => setExpanded(!expanded)}
				>
					{expanded ? 'Show Less' : `Show ${items.length - previewCount} More`}
				</button>
			)}
		</div>
	);
};
