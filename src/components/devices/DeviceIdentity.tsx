import Image from 'next/image';
import { MonitorSmartphone } from 'lucide-react';
import { getDeviceAppearance } from '@/lib/device-appearance';

type Props = {
	name?: string | null;
	location?: string | null;
	children?: React.ReactNode;
};

export function DeviceIdentity({ name, location, children }: Props) {
	const appearance = getDeviceAppearance(name);
	return (
		<div className="flex min-w-0 items-center gap-4">
			<div className="flex size-20 shrink-0 items-center justify-center rounded-2xl border bg-muted/40">
				{appearance.image ? (
					<Image src={appearance.image} alt={`${appearance.label} illustration`} width={72} height={72} />
				) : (
					<MonitorSmartphone className="size-9 text-muted-foreground" aria-hidden="true" />
				)}
			</div>
			<div className="min-w-0">
				<p className="break-words font-semibold">{name || 'Unnamed device'}</p>
				<p className="text-xs font-medium text-muted-foreground">{appearance.label}</p>
				<p className="mt-1 break-words text-sm text-muted-foreground">{location || 'No location assigned'}</p>
				{children}
			</div>
		</div>
	);
}
