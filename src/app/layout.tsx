import React from 'react';
import type { Metadata, Viewport } from 'next';
import { DM_Sans } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';

// This is the magic line that brings all your styling back!
import '../styles/tailwind.css'; 

// Initialize your custom font
const dmSans = DM_Sans({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Crowd Check AI',
  description: 'Real-Time Crowd Monitoring Dashboard',
  verification: {
    // 🔴 PASTE YOUR ACTUAL GOOGLE CODE STRING HERE:
    google: 'RKX2s4HVwmz8ld60W_fz0nD5U0MPANbP3r8iQMahR8I', 
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={dmSans.className}>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}


// Previous before Meta varification 

// import React from 'react';
// import type { Metadata, Viewport } from 'next';
// import { DM_Sans } from 'next/font/google';
// import { Analytics } from '@vercel/analytics/next';
// import '../styles/tailwind.css';

// const dmSans = DM_Sans({
//   subsets: ['latin'],
//   weight: ['400', '500', '600', '700'],
//   variable: '--font-dm-sans',
//   display: 'swap',
// });

// export const viewport: Viewport = {
//   width: 'device-width',
//   initialScale: 1,
// };

// export const metadata: Metadata = {
//   title: 'CrowdCheck AI — Real-Time Crowd Monitoring Dashboard',
//   description:
//     'Monitor live crowd density across venues with AI-powered occupancy tracking, real-time alerts, and capacity management for operations teams.',
//   icons: {
//     icon: [{ url: '/favicon.ico', type: 'image/x-icon' }],
//   },
// };

// export default function RootLayout({
//   children,
// }: Readonly<{ children: React.ReactNode }>) {
//   return (
//     <html lang="en" className={dmSans.variable}>
//       <body className={dmSans.className}>
//         {children}
//         <Analytics />
//         <script type="module" async src="https://static.rocket.new/rocket-web.js?_cfg=https%3A%2F%2Fcrowdcheck5744back.builtwithrocket.new&_be=https%3A%2F%2Fappanalytics.rocket.new&_v=0.1.19" />
//         <script type="module" defer src="https://static.rocket.new/rocket-shot.js?v=0.0.2" />
//       </body>
//     </html>
//   );
// }
