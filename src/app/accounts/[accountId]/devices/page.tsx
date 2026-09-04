'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ChevronDown, MonitorSmartphone, RefreshCw, ShieldAlert, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { getDevicesForAccount, revokeIpadDevice } from '@/app/api/deviceApi';
import { getAccountsForUser } from '@/app/api/accountApi';
import { getLocationsByAccountId } from '@/app/api/locationApi';
import type { IpadDevice, User } from '@/app/types';
import LeftNav from '@/components/navBar/LeftNav';
import MobileDrawerNav from '@/components/navBar/MoibileDrawerNav';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSession } from '@/lib/auth/session-context';

const formatDate = (value?: string | null) => value
	? new Date(value).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
	: 'Never';

export default function AccountDevicesPage() {
	const params = useParams<{ accountId: string }>();
	const router = useRouter();
	const { user, loading } = useSession();
	const accountId = params.accountId;
	const [accountName, setAccountName] = useState<string | null>(null);
	const [accountImage, setAccountImage] = useState<string | null>(null);
	const [devices, setDevices] = useState<IpadDevice[]>([]);
	const [busy, setBusy] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [drawerOpen, setDrawerOpen] = useState(false);
	const [showRevoked, setShowRevoked] = useState(false);
	const isManager = user?.appRole === 'MANAGER';

	const load = async (refresh = false) => {
		if (!user?.id || !accountId) return;
		refresh ? setRefreshing(true) : setBusy(true);
		try {
			const accounts = await getAccountsForUser(user.id);
			const account = accounts.data?.find((item) => item.id === accountId);
			if (!account) {
				toast.error('You do not have access to this account.');
				router.push('/accounts');
				return;
			}
			setAccountName(account.accountName);
			setAccountImage(account.imageBase64 || account.accountImage || null);
			const response = await getDevicesForAccount(accountId);
			if (response.error) throw new Error(response.error);
			const locationResponse = await getLocationsByAccountId(accountId);
			const locationsById = new Map((locationResponse.data ?? []).map((location) => [location.id, location.locationName]));
			setDevices((response.data ?? []).map((device) => ({
				...device,
				locationName: device.locationName || (device.locationId ? locationsById.get(device.locationId) : undefined) || null,
			})));
			setError(null);
		} catch (caught) {
			const message = caught instanceof Error ? caught.message : 'Unable to load devices.';
			setError(message);
		} finally {
			setBusy(false);
			setRefreshing(false);
		}
	};

	const revoke = async (device: IpadDevice) => {
		if (!isManager || !window.confirm(`Revoke ${device.deviceName || 'this iPad'}? It will no longer be able to perform line checks.`)) return;
		const response = await revokeIpadDevice(device.id);
		if (response.error) {
			toast.error(response.error);
			return;
		}
		setDevices((current) => current.map((item) => item.id === device.id
			? { ...item, active: false, revokedAt: new Date().toISOString() }
			: item));
		toast.success('Device revoked.');
	};

	const removeRevokedFromView = () => {
		if (!isManager || !devices.some((device) => device.revokedAt)) return;
		if (!window.confirm('Remove all revoked devices from this view? This does not restore access.')) return;
		setDevices((current) => current.filter((device) => !device.revokedAt));
		setShowRevoked(false);
		toast.success('Revoked devices removed from view.');
	};

	useEffect(() => {
		if (!loading) load();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [loading, user?.id, accountId]);

	if (loading || busy) return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Loading devices…</div>;

	return (
		<div className="flex min-h-screen bg-background">
			<aside className="hidden w-64 shrink-0 md:block">
				<LeftNav accountName={accountName} accountImage={accountImage} accountId={accountId} sessionUserRole={user?.appRole} />
			</aside>
			<MobileDrawerNav open={drawerOpen} setOpen={setDrawerOpen} title="Menu">
				<LeftNav accountName={accountName} accountImage={accountImage} accountId={accountId} sessionUserRole={user?.appRole} />
			</MobileDrawerNav>
			<main className="min-w-0 flex-1 p-5 sm:p-8">
				<div className="mx-auto max-w-5xl space-y-6">
					<div className="flex items-start justify-between gap-4">
						<div>
							<p className="text-sm text-muted-foreground">{accountName}</p>
							<h1 className="mt-1 text-3xl font-semibold tracking-tight">Account devices</h1>
							<p className="mt-2 text-sm text-muted-foreground">Enrolled iPads that can perform offline line checks for this account.</p>
						</div>
						<div className="flex flex-wrap justify-end gap-2">
						{isManager && devices.some((device) => device.revokedAt) && <Button variant="outline" size="sm" onClick={removeRevokedFromView}><Trash2 className="mr-2 size-4" /> Remove revoked</Button>}
						<Button variant="outline" size="sm" onClick={() => load(true)} disabled={refreshing}>
							<RefreshCw className={`mr-2 size-4 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
						</Button>
						</div>
					</div>
					{error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"><ShieldAlert className="mr-2 inline size-4" />{error}</div>}
					<Card>
						<CardHeader><CardTitle className="flex items-center gap-2"><MonitorSmartphone className="size-5" /> {devices.length} total device{devices.length === 1 ? '' : 's'}</CardTitle></CardHeader>
						<CardContent>
							{devices.filter((device) => !device.revokedAt).length === 0 ? <div className="py-12 text-center text-sm text-muted-foreground">No active iPads are enrolled for this account.</div> : <div className="space-y-3">{devices.filter((device) => !device.revokedAt).map((device) => <div key={device.id} className="flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-semibold">{device.deviceName || 'Unnamed iPad'}</p><p className="text-sm text-muted-foreground">{device.locationName || 'No location assigned'}</p><p className="mt-1 text-xs text-muted-foreground">Enrolled {formatDate(device.enrolledAt)} · Last seen {formatDate(device.lastSeenAt)}</p></div><div className="flex items-center gap-3"><Badge variant="default">Pin Access Active</Badge>{isManager && <Button variant="outline" size="sm" className="text-destructive" onClick={() => revoke(device)} aria-label={`Revoke ${device.deviceName || 'device'}`} title={`Revoke ${device.deviceName || 'device'}`}>Revoke</Button>}</div></div>)}</div>}
							{devices.some((device) => device.revokedAt) && <div className="mt-5 border-t pt-3"><Button type="button" variant="ghost" className="w-full justify-between" onClick={() => setShowRevoked((open) => !open)}><span>Show revoked devices ({devices.filter((device) => device.revokedAt).length})</span><ChevronDown className={`size-4 transition-transform ${showRevoked ? 'rotate-180' : ''}`} /></Button>{showRevoked && <div className="mt-3 space-y-3">{devices.filter((device) => device.revokedAt).map((device) => <div key={device.id} className="flex items-center justify-between rounded-xl border border-dashed p-4"><div><p className="font-semibold">{device.deviceName || 'Unnamed iPad'}</p><p className="text-sm text-muted-foreground">{device.locationName || 'No location assigned'}</p><p className="text-xs text-muted-foreground">Revoked {formatDate(device.revokedAt)}</p></div><div className="flex items-center gap-3"><Badge variant="secondary">Pin Access Revoked</Badge>{isManager && <Button variant="ghost" size="icon" className="text-destructive" onClick={removeRevokedFromView} aria-label="Remove revoked devices" title="Remove revoked devices"><Trash2 className="size-5" /></Button>}</div></div>)}</div>}</div>}
						</CardContent>
					</Card>
				</div>
			</main>
		</div>
	);
}
