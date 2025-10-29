/**
 * Banner Types for Storefront
 * Represents active banners from the backend
 */

export type BannerCategory = 'A' | 'B' | 'C' | 'D' | 'E';

export interface ApiBanner {
  _id: string;
  name: string;
  imageUrl: string;
  pageLink: string;
  headerText?: string;
  mainText?: string;
  CTA?: string;
  fullImage: boolean;
  category: BannerCategory;
  position: number;
  createdAt: string;
}

export interface GroupedBanners {
  A: ApiBanner[];
  B: ApiBanner[];
  C: ApiBanner[];
  D: ApiBanner[];
  E: ApiBanner[];
}
