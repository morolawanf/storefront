const MAIN_SITE_URL = process.env.NEXT_PUBLIC_MAIN_SITE_URL || 'https://www.rawura.com';

export const siteConfig = {
  name: 'Rawura',
  titleTemplate: '%s | Rawura',
  defaultTitle: 'Rawura - Affordable Quality Products',
  description: 'Rawura Online Store - Your One-Stop Shop for Affordable Quality Products',
  url: MAIN_SITE_URL,
  ogImage: '/images/brand/ogimage.png',
  logo: {
    light: '/images/brand/logoLight.png',
    dark: '/images/brand/logoDark.png',
    transparent: '/images/brand/logoTransparent.png',
    miniLight: '/images/brand/logoMiniLight.png',
    miniDark: '/images/brand/logoMiniDark.png',
  },
  twitter: '@rawura',
  locale: 'en_NG',
  author: 'Rawura',
  keywords: ['ecommerce', 'online store', 'Rawura', 'shop', 'affordable products'],
};

export type SiteConfig = typeof siteConfig;

export async function prefetchImages(imageUrls: string[]) {
  if (imageUrls.length === 0) return;

  try {
    await Promise.all(
      imageUrls.slice(0, 3).map(
        (
          url // Only prefetch first 3 images
        ) => fetch(url, { method: 'HEAD' }).catch(() => null)
      )
    );
  } catch (error) {
    console.error('Image prefetch error:', error);
  }
}
