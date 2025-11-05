declare module 'react-animated-weather' {
	import { ComponentType } from 'react';

	export interface ReactAnimatedWeatherProps {
		icon: string;
		color?: string;
		size?: number;
		animate?: boolean;
	}

	const ReactAnimatedWeather: ComponentType<ReactAnimatedWeatherProps>;
	export default ReactAnimatedWeather;
}
