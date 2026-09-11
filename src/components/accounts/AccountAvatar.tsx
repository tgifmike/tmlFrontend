'use client';

import { Building2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { accountImageSrc } from '@/lib/account-image';
import { cn } from '@/lib/utils';

type Props = {
	image?: string | null;
	name?: string | null;
	className?: string;
};

export function AccountAvatar({ image, name, className }: Props) {
	return (
		<Avatar className={cn('size-11 rounded-xl border bg-background', className)}>
			<AvatarImage src={accountImageSrc(image)} alt={name ? `${name} logo` : 'Account logo'} className="object-contain p-1" />
			<AvatarFallback className="rounded-[inherit] bg-chart-3/10 text-chart-3">
				<Building2 className="h-1/2 w-1/2" aria-hidden="true" />
			</AvatarFallback>
		</Avatar>
	);
}
