import type { User } from '@/app/types';
import { Badge } from '@/components/ui/badge';
import { CircleCheck, Mail } from 'lucide-react';

type UserInvitationStatusProps = {
	user: User;
};

export const isUserPendingInvite = (user: User) =>
	user.invited === true && user.firstLogin === true;

export function UserInvitationStatus({ user }: UserInvitationStatusProps) {
	if (isUserPendingInvite(user)) {
		return (
			<Badge
				variant="outline"
				className="gap-1.5 border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300"
			>
				<Mail className="size-3.5" aria-hidden="true" />
				Pending invite
			</Badge>
		);
	}

	if (user.firstLogin !== false) {
		return (
			<Badge
				variant="outline"
				className="gap-1.5 border-muted-foreground/30 bg-muted/50 text-muted-foreground"
				title="The API did not return this user's invitation state"
			>
				<Mail className="size-3.5" aria-hidden="true" />
				Not available
			</Badge>
		);
	}

	return (
		<Badge
			variant="outline"
			className="gap-1.5 border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
		>
			<CircleCheck className="size-3.5" aria-hidden="true" />
			Joined
		</Badge>
	);
}
