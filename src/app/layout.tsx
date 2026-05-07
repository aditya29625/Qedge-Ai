import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'QuantumEdge AI — Stock Market Prediction & Analysis Platform',
  description: 'World-class AI-powered stock market prediction using LSTM, Transformer, XGBoost, FinBERT, Computer Vision, and Reinforcement Learning. Production-grade quantitative finance platform.',
  keywords: 'AI stock prediction, machine learning trading, LSTM stock forecast, FinBERT sentiment, quantitative finance, algorithmic trading',
  authors: [{ name: 'QuantumEdge AI' }],
  openGraph: {
    title: 'QuantumEdge AI — Stock Market Prediction Platform',
    description: 'Hybrid ML ensemble with LSTM, Transformer, XGBoost and LLM-powered market reasoning',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#06060f" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
