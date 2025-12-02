'use client';

import React from 'react';
import {
	Document,
	Page,
	Text,
	View,
	Image,
	StyleSheet,
	Font,
} from '@react-pdf/renderer';
import { LineCheck } from '@/app/types';

// Register a font that supports Unicode checkmarks
Font.register({
	family: 'DejaVuSans',
	src: 'https://cdn.jsdelivr.net/npm/dejavu-fonts-ttf@2.37.1/ttf/DejaVuSans.ttf',
});



interface Props {
	lineCheck: LineCheck;
	accountName?: string;
	accountImage?: string | null;
}

const styles = StyleSheet.create({
	page: {
  fontSize: 8,
  paddingTop: 15,
  paddingBottom: 15,
  paddingLeft: 15,
  paddingRight: 65, // optimal
  flexDirection: 'column',
  fontFamily: 'DejaVuSans',
  margin: 0,
},


	/* Header */
	headerContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 10,
	},
	headerText: {
		fontSize: 12,
		fontWeight: 'bold',
	},
	accountImage: {
		width: 60,
		height: 60,
		borderRadius: 30,
		objectFit: 'cover',
		overflow: 'hidden',
		marginRight: 40,
	},
	/* Station Section */
	stationSection: {
		marginTop: 10,
		padding: 8,
		borderWidth: 1,
		borderColor: '#000',
		borderRadius: 6,
		//overflow: 'hidden',
	},
	stationHeader: {
		fontSize: 12,
		fontWeight: 'bold',
		marginBottom: 5,
	},

	/* Table */
	tableHeader: {
		flexDirection: 'row',
		borderBottomColor: '#000',
		borderBottomWidth: 1,
		paddingBottom: 4,
		marginBottom: 2,
		// unshaded
	},
	tableRow: {
		flexDirection: 'row',
		paddingVertical: 2,
	},
	shadedRow: {
		flexDirection: 'row',
		backgroundColor: '#f2f2f2',
		paddingVertical: 4,
		paddingHorizontal: 3,
	},

	/* Cell styling */
	cell: {
		// borderRightWidth: 1,
		// borderRightColor: '#ccc',
		paddingHorizontal: 3,
	},
	centeredCell: {
		textAlign: 'center',
		justifyContent: 'center',
		alignItems: 'center',
	},

	itemName: { flex: 1 },
	shelfLife: { flex: 1 },
	container: { flex: 1 },
	tool: { flex: 1 },
	portion: { flex: 1 },
	temp: { flex: 1 },
	checked: { flex: 1 },
	notes: { flex: 1.5 },
	observations: { flex: 1.5 },
});

// Table Header Component
const TableHeader = () => (
	<View style={styles.tableHeader} fixed>
		<Text style={[styles.cell, styles.itemName]}>Item</Text>
		<Text style={[styles.cell, styles.centeredCell, styles.shelfLife]}>
			Shelf Life
		</Text>
		<Text style={[styles.cell, styles.centeredCell, styles.container]}>
			Container
		</Text>
		<Text style={[styles.cell, styles.centeredCell, styles.tool]}>Tool</Text>
		<Text style={[styles.cell, styles.centeredCell, styles.portion]}>
			Portion Size
		</Text>
		<Text style={[styles.cell, styles.centeredCell, styles.temp]}>
			Temp/Checked
		</Text>
		{/* <Text style={[styles.cell, styles.checked]}>Checked</Text> */}
		<Text style={[styles.cell, styles.centeredCell, styles.notes]}>Notes</Text>
		<Text style={[styles.cell, styles.observations]}>Observations</Text>
	</View>
);

const LineCheckPdf: React.FC<Props> = ({
	lineCheck,
	accountName,
	accountImage,
}) => (
	<Document>
		<Page size="A4" orientation="landscape" style={styles.page}>
			{/* HEADER */}
			<View style={styles.headerContainer}>
				<Text style={styles.headerText}>Line Check</Text>
				{accountImage ? (
					<Image
						style={styles.accountImage}
						src={
							accountImage.startsWith('data:image')
								? accountImage
								: `data:image/png;base64,${accountImage}`
						}
					/>
				) : (
					<Text>No Logo added</Text>
				)}
			</View>

			<Text>Started: {new Date(lineCheck.checkTime).toLocaleString()}</Text>
			{accountName && <Text>Account: {accountName}</Text>}
			<Text>Performed by: {lineCheck.username || '-'}</Text>

			{/* STATIONS */}
			{lineCheck.stations?.map((station) => (
				<View key={station.id} style={styles.stationSection} wrap>
					<Text style={styles.stationHeader}>
						Station: {station.stationName}
					</Text>

					{/* Table Header */}
					<TableHeader />

					{/* ROWS */}
					{station.items?.map((item, index) => {
						const shaded = index % 2 === 1;
						const rowStyles = [styles.tableRow];
						if (shaded) rowStyles.push(styles.shadedRow);

						const tempValid =
							item.temperature != null &&
							item.minTemp != null &&
							item.maxTemp != null &&
							item.temperature >= item.minTemp &&
							item.temperature <= item.maxTemp;

						return (
							<View key={item.id} style={rowStyles}>
								<Text style={[styles.cell, styles.itemName]}>
									{item.itemName}
								</Text>
								<Text
									style={[styles.cell, styles.centeredCell, styles.shelfLife]}
								>
									{item.shelfLife || '-'}
								</Text>
								<Text
									style={[styles.cell, styles.centeredCell, styles.container]}
								>
									{item.panSize || '-'}
								</Text>
								<Text style={[styles.cell, styles.centeredCell, styles.tool]}>
									{item.tool ? item.toolName : '-'}
								</Text>
								<Text
									style={[styles.cell, styles.centeredCell, styles.portion]}
								>
									{item.portioned ? item.portionSize : '-'}
								</Text>

								{/* TEMP or CHECKMARK */}
								{item.tempTaken ? (
									<View
										style={[
											styles.cell,
											styles.temp,
											styles.centeredCell,
											{ flexDirection: 'column' },
										]}
									>
										<Text
											style={{
												color: tempValid ? 'green' : 'red',
												fontSize: 10,
											}}
										>
											{item.temperature ?? '-'}°
										</Text>
										{item.minTemp != null && item.maxTemp != null && (
											<Text style={{ fontSize: 6, color: '#555' }}>
												{item.minTemp}° - {item.maxTemp}°
											</Text>
										)}
									</View>
								) : (
									<Text
										style={[
											styles.cell,
											styles.checked,
											styles.centeredCell,
											{
												color: item.ischecked ? 'green' : 'red',
												fontSize: 12,
												fontFamily: 'DejaVuSans',
											},
										]}
									>
										{item.ischecked ? '✓' : '✘'}
									</Text>
								)}

								<Text style={[styles.cell, styles.centeredCell, styles.notes]}>
									{item.templateNotes || '-'}
								</Text>
								<Text style={[styles.cell, styles.observations]}>
									{item.observations || '-'}
								</Text>
							</View>
						);
					})}
				</View>
			))}
		</Page>
	</Document>
);

export default LineCheckPdf;
