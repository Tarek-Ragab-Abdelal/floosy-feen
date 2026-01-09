'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRepositories } from '@/contexts/RepositoryContext';

export default function RootPage() {
  const router = useRouter();
  const { settingsRepo, isInitialized } = useRepositories();

  useEffect(() => {
    if (!isInitialized) return;

    settingsRepo.isFirstLaunch().then((isFirst) => {
      if (isFirst) {
        router.push('/welcome');
      } else {
        router.push('/home');
      }
    });
  }, [isInitialized, router, settingsRepo]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    </div>
  );
}
