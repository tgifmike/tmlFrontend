import Link from 'next/link';

import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

type LocationBreadcrumbsProps = {
	accountId: string;
	locationId: string;
	accountName?: string | null;
	locationName?: string | null;
	pageName?: string | null;
	pageHref?: string;
	parentCrumb?: {
		label: string;
		href: string;
	};
};

export default function LocationBreadcrumbs({
	accountId,
	locationId,
	accountName,
	locationName,
	pageName,
	pageHref,
	parentCrumb,
}: LocationBreadcrumbsProps) {
	const locationHref = `/accounts/${accountId}/locations/${locationId}`;

	return (
		<Breadcrumb>
			<BreadcrumbList>
				<BreadcrumbItem>
					<BreadcrumbLink asChild>
						<Link href="/accounts">Accounts</Link>
					</BreadcrumbLink>
				</BreadcrumbItem>
				<BreadcrumbSeparator />

				<BreadcrumbItem>
					<BreadcrumbLink asChild>
						<Link href={`/accounts/${accountId}`}>
							{accountName || 'Locations'}
						</Link>
					</BreadcrumbLink>
				</BreadcrumbItem>
				<BreadcrumbSeparator />

				<BreadcrumbItem>
					{pageName ? (
						<BreadcrumbLink asChild>
							<Link href={locationHref}>{locationName || 'Location'}</Link>
						</BreadcrumbLink>
					) : (
						<BreadcrumbPage>{locationName || 'Location'}</BreadcrumbPage>
					)}
				</BreadcrumbItem>

				{pageName && (
					<>
						<BreadcrumbSeparator />
						{parentCrumb && (
							<>
								<BreadcrumbItem>
									<BreadcrumbLink asChild>
										<Link href={parentCrumb.href}>{parentCrumb.label}</Link>
									</BreadcrumbLink>
								</BreadcrumbItem>
								<BreadcrumbSeparator />
							</>
						)}
						<BreadcrumbItem>
							{pageHref ? (
								<BreadcrumbLink asChild>
									<Link href={pageHref}>{pageName}</Link>
								</BreadcrumbLink>
							) : (
								<BreadcrumbPage>{pageName}</BreadcrumbPage>
							)}
						</BreadcrumbItem>
					</>
				)}
			</BreadcrumbList>
		</Breadcrumb>
	);
}
