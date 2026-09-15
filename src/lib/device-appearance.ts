export type DeviceAppearance = {
	label: string;
	image?: string;
};

/** Enrollment currently supplies a name, but no reliable hardware type. */
export function getDeviceAppearance(name?: string | null): DeviceAppearance {
	const value = name?.toLowerCase() ?? '';
	if (/\biphone/.test(value)) return { label: 'iPhone', image: '/devices/iphone.svg' };
	if (/\bipad/.test(value)) return { label: 'iPad', image: '/devices/ipad.svg' };
	const android = /\bandroid\b|\bgalaxy\b|\bpixel\b|\bsamsung\b/.test(value);
	const androidTablet = /\bcpad\b/.test(value) || (android && /\btablet\b|\btab\b/.test(value));
	if (androidTablet) {
		return { label: 'Android tablet', image: '/devices/android-tablet.svg' };
	}
	if (android && /\bphone\b|\bpixel\s*\d|\bgalaxy\s*[saz]\d/.test(value)) {
		return { label: 'Android phone', image: '/devices/android-phone.svg' };
	}
	return { label: 'Device' };
}
