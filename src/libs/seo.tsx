import type { Metadata } from "next";
import { siteConfig } from "@/config/siteConfig";

export function getDefaultMetadata(overrides?: Partial<Metadata>): Metadata {
  const metadata: Metadata = {
    title: {
      default: siteConfig.defaultTitle,
      template: siteConfig.titleTemplate,
    },
    description: siteConfig.description,
    applicationName: siteConfig.name,
    keywords: siteConfig.keywords,
    authors: [{ name: siteConfig.author }],
    creator: siteConfig.author,
    publisher: siteConfig.name,
    openGraph: {
      title: siteConfig.defaultTitle,
      description: siteConfig.description,
      url: siteConfig.url,
      siteName: siteConfig.name,
      images: [
        {
          url: siteConfig.ogImage,
          width: 1200,
          height: 630,
          alt: siteConfig.name,
        },
      ],
      locale: siteConfig.locale,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: siteConfig.defaultTitle,
      description: siteConfig.description,
      creator: siteConfig.twitter,
      images: [siteConfig.ogImage],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    icons: {
      icon: '/favicon.ico',
      shortcut: '/favicon.ico',
      apple: siteConfig.logo.transparent,
    },
    metadataBase: new URL(siteConfig.url),
    other: {
      'og:logo': siteConfig.logo.transparent,
    },
  };

  return { ...metadata, ...(overrides || {}) } as Metadata;
}

/**
 * Component to prefetch critical brand images
 * Add this to your root layout for better performance
 */
export function PrefetchImages() {
  return (
    <>
      <link rel="prefetch" href={siteConfig.ogImage} as="image" />
      <link rel="prefetch" href={siteConfig.logo.transparent} as="image" />
      <link rel="prefetch" href={siteConfig.logo.light} as="image" />
      <link rel="prefetch" href={siteConfig.logo.dark} as="image" />
      <link rel="preload" href={siteConfig.logo.transparent} as="image" />
    </>
  );
}

export default getDefaultMetadata;
