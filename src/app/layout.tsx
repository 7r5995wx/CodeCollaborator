import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CodeCollaborator - Real-Time Collaborative IDE & Code Execution Engine',
  description: 'Create code sessions, collaborate live with remote cursors, compile and run code in 40+ programming languages, and share execution results in real-time.',
  icons: {
    icon: '/favicon.ico',
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-dark-950 text-slate-100 min-h-screen selection:bg-brand-500 selection:text-white antialiased">
        {children}
      </body>
    </html>
  );
}
