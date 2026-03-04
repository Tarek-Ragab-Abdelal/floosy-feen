import type { Metadata } from 'next';
import { SITE_URL } from '../config';
import AboutClient from './AboutClient';

export const metadata: Metadata = {
  title: 'About',
  description:
    'Meet Tarek Ragab, the developer behind Floosy Feen — a local-first personal finance tracker. Explore portfolio, GitHub, LinkedIn, and Upwork profiles.',
  alternates: { canonical: `${SITE_URL}/about` },
  openGraph: {
    title: 'About | Floosy Feen',
    description: 'Meet the developer behind Floosy Feen and learn about the app.',
    url: `${SITE_URL}/about`,
  },
};

export default function AboutPage() {
  return <AboutClient />;
}
