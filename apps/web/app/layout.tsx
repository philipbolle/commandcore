import './globals.css'
import { Inter } from 'next/font/google'
import type { Metadata } from 'next'
import ClientLayout from './ClientLayout'
import Script from 'next/script'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'CommandCore – Autonomous AI SaaS Factory',
    template: '%s | CommandCore'
  },
  description: 'Generate, deploy and grow enterprise-grade SaaS products in days, not months.',
  openGraph: {
    title: 'CommandCore – Autonomous AI SaaS Factory',
    description: 'Generate, deploy and grow enterprise-grade SaaS products in days, not months.',
    url: 'https://commandcore.ai',
    siteName: 'CommandCore',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@CommandCoreAI',
    creator: '@CommandCoreAI',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.className}>
      <body className="min-h-screen bg-black text-white">
        <ClientLayout>{children}</ClientLayout>
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`} strategy="afterInteractive" />
            <Script id="ga-setup" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);} 
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', { page_path: window.location.pathname });
              `}
            </Script>
          </>
        )}
      </body>
    </html>
  )
}
