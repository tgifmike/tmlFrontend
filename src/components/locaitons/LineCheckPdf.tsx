'use client';

import {
	Document,
	Image,
	Page,
	StyleSheet,
	Text,
	View,
} from '@react-pdf/renderer';

import type { Item, LineCheck, LineCheckPhoto } from '@/app/types';

interface LineCheckPdfProps {
	lineCheck: LineCheck;
	accountName?: string;
	accountImage?: string | null;
	locationName?: string;
	brandLogoUrl?: string;
	photosByItemId?: Record<string, LineCheckPhoto[]>;
}

const colors = {
	ink: '#172033',
	muted: '#667085',
	border: '#D9DEE8',
	surface: '#F7F8FA',
	brand: '#345995',
	success: '#18794E',
	successBackground: '#E8F7EF',
	danger: '#B42318',
	dangerBackground: '#FDECEC',
	warning: '#935F00',
	warningBackground: '#FFF4D6',
};

const styles = StyleSheet.create({
	page: {
		paddingTop: 28,
		paddingRight: 32,
		paddingBottom: 34,
		paddingLeft: 32,
		fontFamily: 'Helvetica',
		fontSize: 9,
		color: colors.ink,
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingBottom: 14,
		borderBottomWidth: 1,
		borderBottomColor: colors.border,
	},
	headerCopy: {
		flexGrow: 1,
		paddingRight: 18,
	},
	title: {
		fontSize: 20,
		fontWeight: 700,
		marginBottom: 5,
	},
	subtitle: {
		fontSize: 10,
		color: colors.muted,
	},
	logos: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	brandLogo: {
		width: 82,
		height: 64,
		objectFit: 'contain',
	},
	accountLogo: {
		width: 48,
		height: 48,
		marginLeft: 10,
		borderRadius: 8,
		objectFit: 'cover',
	},
	metaGrid: {
		flexDirection: 'row',
		marginTop: 12,
		padding: 10,
		borderRadius: 7,
		backgroundColor: colors.surface,
	},
	metaColumn: {
		width: '25%',
		paddingRight: 10,
	},
	label: {
		fontSize: 7,
		fontWeight: 700,
		textTransform: 'uppercase',
		color: colors.muted,
		marginBottom: 3,
	},
	metaValue: {
		fontSize: 9,
		fontWeight: 700,
	},
	stationSection: {
		marginTop: 14,
		borderWidth: 1,
		borderColor: colors.border,
		borderRadius: 8,
		overflow: 'hidden',
	},
	stationHeader: {
		paddingVertical: 8,
		paddingHorizontal: 10,
		backgroundColor: '#EEF1F6',
		borderBottomWidth: 1,
		borderBottomColor: colors.border,
	},
	stationName: {
		fontSize: 12,
		fontWeight: 700,
	},
	itemCard: {
		paddingVertical: 10,
		paddingHorizontal: 10,
		borderBottomWidth: 1,
		borderBottomColor: colors.border,
	},
	lastItemCard: {
		borderBottomWidth: 0,
	},
	itemHeading: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		justifyContent: 'space-between',
		marginBottom: 7,
	},
	itemName: {
		fontSize: 11,
		fontWeight: 700,
		maxWidth: '58%',
	},
	statusRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'flex-end',
		maxWidth: '40%',
	},
	pill: {
		paddingVertical: 3,
		paddingHorizontal: 6,
		borderRadius: 8,
		marginLeft: 4,
	},
	pillText: {
		fontSize: 7,
		fontWeight: 700,
	},
	successPill: {
		backgroundColor: colors.successBackground,
	},
	successText: {
		color: colors.success,
	},
	dangerPill: {
		backgroundColor: colors.dangerBackground,
	},
	dangerText: {
		color: colors.danger,
	},
	itemDetails: {
		flexDirection: 'row',
		alignItems: 'flex-start',
	},
	detailColumn: {
		width: '32%',
		paddingRight: 12,
	},
	notesColumn: {
		width: '68%',
	},
	detailText: {
		fontSize: 8,
		lineHeight: 1.45,
		color: colors.ink,
		marginBottom: 2,
	},
	emptyText: {
		fontSize: 8,
		color: colors.muted,
	},
	noteBlock: {
		marginBottom: 6,
	},
	noteText: {
		fontSize: 8,
		lineHeight: 1.5,
	},
	correctionBox: {
		marginTop: 4,
		paddingVertical: 7,
		paddingHorizontal: 8,
		borderWidth: 1,
		borderRadius: 6,
	},
	correctionResolved: {
		borderColor: '#B7E2CA',
		backgroundColor: colors.successBackground,
	},
	correctionPending: {
		borderColor: '#F1D48A',
		backgroundColor: colors.warningBackground,
	},
	correctionHeading: {
		fontSize: 8,
		fontWeight: 700,
		marginBottom: 4,
	},
	warningText: {
		color: colors.warning,
	},
	correctionMeta: {
		fontSize: 7,
		lineHeight: 1.4,
		marginTop: 4,
		color: colors.muted,
	},
	photosSection: {
		marginTop: 8,
	},
	photos: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		alignItems: 'flex-start',
	},
	photoCard: {
		width: 62,
		marginRight: 8,
		marginBottom: 6,
	},
	photo: {
		width: 58,
		height: 48,
		borderRadius: 4,
		objectFit: 'cover',
	},
	photoLabel: {
		fontSize: 6,
		fontWeight: 700,
		marginTop: 3,
		textAlign: 'center',
		color: colors.muted,
	},
	photoNotes: {
		fontSize: 6,
		lineHeight: 1.3,
		marginTop: 2,
		color: colors.muted,
	},
	footer: {
		position: 'absolute',
		left: 32,
		right: 32,
		bottom: 14,
		flexDirection: 'row',
		justifyContent: 'space-between',
		fontSize: 7,
		color: colors.muted,
	},
});

const LineCheckPdf = ({
	lineCheck,
	accountName,
	accountImage,
	locationName,
	brandLogoUrl,
	photosByItemId = {},
}: LineCheckPdfProps) => {
	const normalizedAccountImage = normalizeImageSource(accountImage);
	const stations = lineCheck.stations ?? [];

	return (
		<Document
			title={`Line check - ${locationName || accountName || 'report'}`}
			author="The Manager Life"
			subject="Completed restaurant line check"
		>
			{stations.length > 0 ? (
				stations.map((station, stationIndex) => (
					<Page key={station.id} size="A4" orientation="portrait" style={styles.page} wrap>
						<PdfReportHeader
							accountName={accountName}
							accountImage={normalizedAccountImage}
							locationName={locationName}
							brandLogoUrl={brandLogoUrl}
						/>
						<View style={styles.metaGrid}>
							<MetaItem label="Performed by" value={lineCheck.username || 'Unknown'} />
							<MetaItem label="Started" value={formatDateTime(lineCheck.checkTime)} />
							<MetaItem label="Completed" value={formatDateTime(lineCheck.completedAt)} />
							<MetaItem label="Station" value={`${stationIndex + 1} of ${stations.length}`} />
						</View>
						<View style={styles.stationSection}>
							<View style={styles.stationHeader}>
								<Text style={styles.stationName}>{station.stationName}</Text>
							</View>
							{station.items?.map((item, index) => (
								<PdfItem
									key={item.id}
									item={item}
									photos={item.id ? photosByItemId[item.id] ?? [] : []}
									isLast={index === station.items.length - 1}
								/>
							))}
						</View>
						<PdfFooter />
					</Page>
				))
			) : (
				<Page size="A4" orientation="portrait" style={styles.page}>
					<PdfReportHeader
						accountName={accountName}
						accountImage={normalizedAccountImage}
						locationName={locationName}
						brandLogoUrl={brandLogoUrl}
					/>
					<View style={styles.stationSection}>
						<Text style={styles.emptyText}>No stations were recorded for this line check.</Text>
					</View>
					<PdfFooter />
				</Page>
			)}
		</Document>
	);
};

function PdfReportHeader({
	accountName,
	accountImage,
	locationName,
	brandLogoUrl,
}: {
	accountName?: string;
	accountImage: string | null;
	locationName?: string;
	brandLogoUrl?: string;
}) {
	return (
		<View style={styles.header}>
			<View style={styles.headerCopy}>
				<Text style={styles.title}>Completed Line Check</Text>
				<Text style={styles.subtitle}>
					{accountName || 'Account'} · {locationName || 'Location'}
				</Text>
			</View>
			<View style={styles.logos}>
				{brandLogoUrl && <Image src={brandLogoUrl} style={styles.brandLogo} />}
				{accountImage && <Image src={accountImage} style={styles.accountLogo} />}
			</View>
		</View>
	);
}

function PdfFooter() {
	return (
		<View style={styles.footer} fixed>
			<Text>The Manager Life · Line-check record</Text>
			<Text
				render={({ pageNumber, totalPages }) =>
					`Page ${pageNumber} of ${totalPages}`
				}
			/>
		</View>
	);
}

function MetaItem({ label, value }: { label: string; value: string }) {
	return (
		<View style={styles.metaColumn}>
			<Text style={styles.label}>{label}</Text>
			<Text style={styles.metaValue}>{value}</Text>
		</View>
	);
}

function PdfItem({
	item,
	photos,
	isLast,
}: {
	item: Item;
	photos: LineCheckPhoto[];
	isLast: boolean;
}) {
	const result = getItemResult(item);
	const issues = getItemIssues(item);
	const setupDetails = getSetupDetails(item);
	const hasCorrectionRecord = hasItemCorrection(item);

	return (
		<View style={[styles.itemCard, ...(isLast ? [styles.lastItemCard] : [])]}>
			<View style={styles.itemHeading}>
				<Text style={styles.itemName}>{item.itemName}</Text>
				<View style={styles.statusRow}>
					<PdfPill text={result.text} tone={result.tone} />
					{issues.map((issue) => (
						<PdfPill key={issue} text={issue} tone="danger" />
					))}
				</View>
			</View>

			<View style={styles.itemDetails}>
				<View style={styles.detailColumn}>
					<Text style={styles.label}>Setup</Text>
					{setupDetails.length > 0 ? (
						setupDetails.map((detail) => (
							<Text key={detail} style={styles.detailText}>{detail}</Text>
						))
					) : (
						<Text style={styles.emptyText}>No setup details</Text>
					)}
				</View>

				<View style={styles.notesColumn}>
					{item.templateNotes?.trim() && (
						<PdfNote label="Setup note" text={item.templateNotes.trim()} />
					)}
					{item.observations?.trim() && (
						<PdfNote label="Line-check observation" text={item.observations.trim()} />
					)}
					{!item.templateNotes?.trim() && !item.observations?.trim() && (
						<>
							<Text style={styles.label}>Notes &amp; observations</Text>
							<Text style={styles.emptyText}>None recorded</Text>
						</>
					)}
				</View>
			</View>

			{hasCorrectionRecord && <PdfCorrection item={item} />}

			{photos.length > 0 && (
				<View style={styles.photosSection}>
					<Text style={styles.label}>iPad photos</Text>
					<View style={styles.photos}>
						{photos.map((photo) => (
							<View key={photo.id} style={styles.photoCard} wrap={false}>
								<Image src={photo.url} style={styles.photo} />
								<Text style={styles.photoLabel}>{formatPhotoType(photo.photoType)}</Text>
								{photo.notes?.trim() && (
									<Text style={styles.photoNotes}>{photo.notes.trim()}</Text>
								)}
							</View>
						))}
					</View>
				</View>
			)}
		</View>
	);
}

function PdfCorrection({ item }: { item: Item }) {
	const corrected = item.isCorrected ?? item.corrected ?? false;
	const correctiveNotes = item.correctiveNotes?.trim();

	return (
		<View
			style={[
				styles.correctionBox,
				corrected ? styles.correctionResolved : styles.correctionPending,
			]}
		>
			<Text
				style={[
					styles.correctionHeading,
					corrected ? styles.successText : styles.warningText,
				]}
			>
				{corrected ? 'CORRECTION · RESOLVED' : 'CORRECTION NOTE'}
			</Text>
			<Text style={correctiveNotes ? styles.noteText : styles.emptyText}>
				{correctiveNotes || 'No correction comments recorded.'}
			</Text>
			{corrected && (
				<Text style={styles.correctionMeta}>
					Corrected by {item.correctedByName?.trim() || 'Unknown team member'} ·{' '}
					{formatDateTime(item.correctedAt)}
				</Text>
			)}
		</View>
	);
}

const hasItemCorrection = (item: Item) => Boolean(
	(item.isCorrected ?? item.corrected ?? false) ||
	item.correctiveNotes?.trim() ||
	item.correctedAt ||
	item.correctedByName,
);

function PdfPill({ text, tone }: { text: string; tone: 'success' | 'danger' }) {
	return (
		<View style={[styles.pill, tone === 'success' ? styles.successPill : styles.dangerPill]}>
			<Text style={[styles.pillText, tone === 'success' ? styles.successText : styles.dangerText]}>
				{text}
			</Text>
		</View>
	);
}

function PdfNote({ label, text }: { label: string; text: string }) {
	return (
		<View style={styles.noteBlock}>
			<Text style={styles.label}>{label}</Text>
			<Text style={styles.noteText}>{text}</Text>
		</View>
	);
}

const getSetupDetails = (item: Item) => [
	item.shelfLife && `Shelf life: ${item.shelfLife}`,
	item.panSize && `Container: ${item.panSize}`,
	item.tool && item.toolName && `Tool: ${item.toolName}`,
	item.isPortioned && item.portionSize && `Portion: ${item.portionSize}`,
].filter(Boolean) as string[];

const getItemResult = (item: Item): { text: string; tone: 'success' | 'danger' } => {
	if (item.isMissing) return { text: 'Item missing', tone: 'danger' };
	if (item.tempTaken || item.isTempTaken) {
		if (item.temperature == null) return { text: 'No temperature', tone: 'danger' };
		return {
			text: `${item.temperature}°${formatExpectedRange(item)}`,
			tone: isTemperatureInRange(item) ? 'success' : 'danger',
		};
	}
	return item.itemChecked === true
		? { text: 'Passed', tone: 'success' }
		: { text: 'Needs attention', tone: 'danger' };
};

const getItemIssues = (item: Item) => {
	const issues: string[] = [];
	const temperatureExpected = Boolean(item.tempTaken || item.isTempTaken);
	if (item.isMissing) issues.push('Missing');
	if (temperatureExpected && item.temperature == null) issues.push('Missing temp');
	else if (temperatureExpected && !isTemperatureInRange(item)) issues.push('Out of temp');
	if (!item.isMissing && !temperatureExpected && item.itemChecked !== true) issues.push('Prepped wrong');
	return issues;
};

const isTemperatureInRange = (item: Item) =>
	item.temperature != null &&
	(item.minTemp == null || item.temperature >= item.minTemp) &&
	(item.maxTemp == null || item.temperature <= item.maxTemp);

const formatExpectedRange = (item: Item) => {
	if (item.minTemp != null && item.maxTemp != null) return ` (${item.minTemp}°–${item.maxTemp}°)`;
	if (item.minTemp != null) return ` (${item.minTemp}°+)`;
	if (item.maxTemp != null) return ` (≤${item.maxTemp}°)`;
	return '';
};

const normalizeImageSource = (image?: string | null) => {
	const value = image?.trim();
	if (!value) return null;
	if (/^(data:image\/|https?:\/\/|blob:|\/)/i.test(value)) return value;
	return `data:image/png;base64,${value}`;
};

const formatDateTime = (value?: string | null) => {
	if (!value) return 'Not recorded';
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? 'Not recorded' : date.toLocaleString();
};

const formatPhotoType = (photoType: string) => photoType
	.toLowerCase()
	.replaceAll('_', ' ')
	.replace(/^\w/, (character) => character.toUpperCase());

export default LineCheckPdf;
