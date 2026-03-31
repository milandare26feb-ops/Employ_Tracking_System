import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import appCss from '../styles.css?url'

import type { QueryClient } from '@tanstack/react-query'
import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from 'next-themes'
import { authMiddleware } from '@/server/functions/auth'
import { getBaseUrl } from '@/server/functions/request'
import {
  createOGMetaTags,
  generateOGImageUrl,
  OGImageConfig,
  OGMetaTags,
} from '@/lib/og-config'

interface MyRouterContext {
  queryClient: QueryClient
}

const scripts: React.DetailedHTMLProps<
  React.ScriptHTMLAttributes<HTMLScriptElement>,
  HTMLScriptElement
>[] = []

if (import.meta.env.VITE_INSTRUMENTATION_SCRIPT_SRC) {
  scripts.push({
    src: import.meta.env.VITE_INSTRUMENTATION_SCRIPT_SRC,
    type: 'module',
  })
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  loader: async () => {
    const { currentUser } = await authMiddleware()
    const baseUrl = await getBaseUrl()

    return {
      currentUser,
      baseUrl,
    }
  },
  head: ({ loaderData }) => {
    const baseUrl =
      typeof window !== 'undefined'
        ? window.location.origin
        : (loaderData?.baseUrl ?? 'https://imagine.dev')

    const config: OGImageConfig = {
      isCustom: false,
    }

    const ogImageUrl = generateOGImageUrl(config, baseUrl)

    const metadata: OGMetaTags = {
      title: 'Real-Time Marketing Officer Tracking System',
      description:
        'A production-ready PWA with admin dashboard and officer mobile app featuring live GPS tracking, face capture, approval workflows, geo-fencing, and real-time analytics powered by Appwrite.',
      image: ogImageUrl,
      url: typeof window !== 'undefined' ? window.location.href : baseUrl,
    }

    const ogTags = createOGMetaTags(metadata)

    return {
      meta: [
        {
          charSet: 'utf-8',
        },
        {
          name: 'viewport',
          content:
            'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover',
        },
        {
          name: 'mobile-web-app-capable',
          content: 'yes',
        },
        {
          name: 'theme-color',
          content: '#0a0f1e',
          media: '(prefers-color-scheme: dark)',
        },
        {
          title: 'Real-Time Marketing Officer Tracking System',
        },
        {
          name: 'description',
          content:
            'A production-ready PWA with admin dashboard and officer mobile app featuring live GPS tracking, face capture, approval workflows, geo-fencing, and real-time analytics powered by Appwrite.',
        },
        {
          name: 'theme-color',
          content: '#0a0f1e',
        },
        {
          name: 'apple-mobile-web-app-capable',
          content: 'yes',
        },
        {
          name: 'apple-mobile-web-app-status-bar-style',
          content: 'black-translucent',
        },
        ...ogTags.meta,
      ],
      links: [
        {
          rel: 'stylesheet',
          href: appCss,
        },
        {
          rel: 'preconnect',
          href: 'https://fonts.googleapis.com',
        },
        {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com',
          crossOrigin: 'anonymous',
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Rajdhani:wght@300;400;500;600;700&family=JetBrains+Mono:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600&display=swap',
        },
        {
          rel: 'stylesheet',
          href: 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
        },
        {
          rel: 'manifest',
          href: '/manifest.json',
        },
      ],
      scripts: [...scripts],
    }
  },

  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
        <style>{`
          :root {
            --safe-top: env(safe-area-inset-top, 0px);
            --safe-bottom: env(safe-area-inset-bottom, 0px);
            --safe-left: env(safe-area-inset-left, 0px);
            --safe-right: env(safe-area-inset-right, 0px);
          }
          html, body { height: 100%; overflow: hidden; }
          * { -webkit-tap-highlight-color: transparent; box-sizing: border-box; }
          input, button, select, textarea { touch-action: manipulation; }
          .field-label {
            display: block;
            font-size: 11px;
            color: #64748b;
            font-family: 'Rajdhani', sans-serif;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            margin-bottom: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar { width: 4px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e2d4a; border-radius: 2px; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #2a3a5a; }
          * { scrollbar-width: thin; scrollbar-color: #1e2d4a transparent; }
          @media (max-width: 768px) {
            .desktop-only { display: none !important; }
          }
          @media (min-width: 769px) {
            .mobile-only { display: none !important; }
          }
        `}</style>
      </head>
      <body style={{ fontFamily: "'Inter', sans-serif" }}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  )
}
