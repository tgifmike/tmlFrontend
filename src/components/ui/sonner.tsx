// "use client"

// import { useTheme } from "next-themes"
// import { Toaster as Sonner, ToasterProps } from "sonner"

// const Toaster = ({ ...props }: ToasterProps) => {
//   const { theme = "system" } = useTheme()

//   return (
//     <Sonner
//       theme={theme as ToasterProps["theme"]}
//       className="toaster group"
//       style={
//         {
//           "--normal-bg": "var(--popover)",
//           "--normal-text": "var(--popover-foreground)",
//           "--normal-border": "var(--border)",
//         } as React.CSSProperties
//       }
//       {...props}
//     />
//   )
// }

// export { Toaster }

'use client';

import { useTheme } from 'next-themes';
import { Toaster as Sonner, ToasterProps } from 'sonner';

const Toaster = ({ ...props }: ToasterProps) => {
	const { theme = 'system' } = useTheme();

	return (
		<Sonner
			theme={theme as ToasterProps['theme']}
			richColors // ✅ REQUIRED for success/error background colors
			className="toaster group"
			style={
				{
					'--normal-bg': 'var(--popover)',
					'--normal-text': 'var(--popover-foreground)',
					'--normal-border': 'var(--border)',

					// ✅ Custom success colors
					'--success-bg': '#16a34a', // Tailwind green-600
					'--success-text': '#ffffff',
					'--success-border': '#15803d',

					// ❌ Custom error colors
					'--error-bg': '#dc2626', // Tailwind red-600
					'--error-text': '#ffffff',
					'--error-border': '#b91c1c',
				} as React.CSSProperties
			}
			{...props}
		/>
	);
};

export { Toaster };

