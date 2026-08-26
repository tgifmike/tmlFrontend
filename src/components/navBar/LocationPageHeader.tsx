'use client';

import type { Dispatch, ReactNode, SetStateAction } from 'react';

import LocationBreadcrumbs from './LocationBreadcrumbs';
import LocationNav from './LocationNav';
import MobileDrawerNav from './MoibileDrawerNav';

type LocationPageHeaderProps = {
	accountId: string;
	locationId: string;
	accountName?: string | null;
	accountImage?: string | null;
	locationName?: string | null;
	pageName?: string | null;
	pageHref?: string;
	parentCrumb?: {
		label: string;
		href: string;
	};
	sessionUserRole?: string;
	drawerOpen: boolean;
	setDrawerOpen: Dispatch<SetStateAction<boolean>>;
	children?: ReactNode;
};

export default function LocationPageHeader({
	accountId,
	locationId,
	accountName,
	accountImage,
	locationName,
	pageName,
	pageHref,
	parentCrumb,
	sessionUserRole,
	drawerOpen,
	setDrawerOpen,
	children,
}: LocationPageHeaderProps) {
	return (
		<header className="sticky top-0 z-20 flex min-h-16 flex-col gap-3 border-b bg-background/95 px-4 py-3 shadow-sm backdrop-blur-xl sm:px-6 lg:flex-row lg:items-center lg:justify-between">
			<div className="flex min-w-0 items-center gap-3">
				<MobileDrawerNav
					open={drawerOpen}
					setOpen={setDrawerOpen}
					title="Menu"
				>
					<LocationNav
						accountName={accountName ?? null}
						accountImage={accountImage}
						accountId={accountId}
						locationId={locationId}
						sessionUserRole={sessionUserRole}
					/>
				</MobileDrawerNav>

				<div className="min-w-0">
					<LocationBreadcrumbs
						accountId={accountId}
						locationId={locationId}
						accountName={accountName}
						locationName={locationName}
						pageName={pageName}
						pageHref={pageHref}
						parentCrumb={parentCrumb}
					/>
				</div>
			</div>

			{children && (
				<div className="flex flex-wrap items-center justify-end gap-2">
					{children}
				</div>
			)}
		</header>
	);
}
