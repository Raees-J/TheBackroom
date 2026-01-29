import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'The Backroom - Manage Stock via WhatsApp',
  description: 'The inventory platform for the real world. Update stock with a voice note.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
