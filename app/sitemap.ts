import type { MetadataRoute } from 'next';
import { SITE_URL } from './config';

const BASE_URL = SITE_URL;
const LAST_MODIFIED = new Date('2025-01-01');

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: BASE_URL,
      lastModified: LAST_MODIFIED,
      changeFrequency: 'monthly',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/welcome`,
      lastModified: LAST_MODIFIED,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/home`,
      lastModified: LAST_MODIFIED,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/transactions`,
      lastModified: LAST_MODIFIED,
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/automation`,
      lastModified: LAST_MODIFIED,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/settings`,
      lastModified: LAST_MODIFIED,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
  ];
}
