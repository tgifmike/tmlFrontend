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
	const androidTablet =
		/\bcpad(?:\b|\d)/.test(value) ||
		/\b(?:lenovo|yoga|legion|idea)\s+tab(?:let)?\b/.test(value) ||
		/\b(?:amazon\s+)?fire(?:\s+hd)?(?:\s*\d+)?\b|\bkindle\s+fire\b/.test(value) ||
		/\boneplus\s+pad\b|\b(?:xiaomi|redmi)\s+pad\b/.test(value) ||
		/\bsm[-\s]?[xt]\d/.test(value) ||
		(android && /\btablet\b|\btab\b/.test(value));
	if (androidTablet) {
		return { label: 'Android tablet', image: '/devices/android-tablet.svg' };
	}

	const androidPhone =
		/\boneplus\b|\bnord\b/.test(value) ||
		/\bmotorola\b|\bmoto\b|\brazr\b/.test(value) ||
		/\bxiaomi\b|\bredmi\b|\bpoco\b|\boppo\b|\bvivo\b/.test(value) ||
		/\bxperia\b|\bpixel\s+fold\b/.test(value) ||
		/\bsm[-\s]?[sagf]\d/.test(value) ||
		(android && /\bphone\b|\bpixel\s*\d|\bgalaxy\s*[saz]\d/.test(value));
	if (androidPhone) {
		return { label: 'Android phone', image: '/devices/android-phone.svg' };
	}
	return { label: 'Device' };
}
