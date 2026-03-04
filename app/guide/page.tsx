import type { Metadata } from 'next';
import { SITE_URL } from '../config';
import GuideClient from './GuideClient';

export const metadata: Metadata = {
  title: 'How to Use Floosy Feen',
  description:
    'Step-by-step guide on how to use Floosy Feen: create budget streams, log transactions, set up automations, and understand your financial projections.',
  alternates: { canonical: `${SITE_URL}/guide` },
  openGraph: {
    title: 'How to Use Floosy Feen | Step-by-Step Guide',
    description:
      'Learn how to track your finances with Floosy Feen. Create streams, add transactions, automate recurring payments, and visualise your future balance.',
    url: `${SITE_URL}/guide`,
  },
};

export default function GuidePage() {
  return <GuideClient />;
}
