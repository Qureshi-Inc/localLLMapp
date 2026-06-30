'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

import PostForm from '@/components/PostForm';
import Notification from '@/components/Notification';

interface NotificationState {
  message: string;
  type: 'success' | 'error';
}

export default function NewPostPage() {
  const router = useRouter();
  const [notification, setNotification] = useState<NotificationState | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleClearNotification = useCallback(() => {
    setNotification(null);
  }, []);

  const handleSubmit = useCallback(async (data: {
    title: string;
    caption: string;
    platform: string;
    status: string;
    scheduledAt: string | null;
    campaign: string | null;
    notes: string | null;
    imageUrl: string | null;
  }) => {
    setIsLoading(true);
    setNotification(null);

    const mappedData = {
      title: data.title || null,
      caption: data.caption || null,
      platform: data.platform || null,
      status: data.status || null,
      scheduledAt: data.scheduledAt || null,
      campaign: data.campaign || null,
      notes: data.notes || null,
      imageUrl: data.imageUrl || null,
    };

    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mappedData),
      });

      if (res.ok) {
        const newPost = await res.json();
        setNotification({ message: 'Post created successfully!', type: 'success' });
        router.push(`/posts/${newPost.id}`);
      } else {
        const error = await res.json();
        setNotification({ message: error.error || 'Failed to create post', type: 'error' });
      }
    } catch (err) {
      setNotification({ message: 'Failed to create post', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <a href="/" className="inline-flex items-center gap-1 text-sm text-surface-500 hover:text-surface-700 mb-6">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Back
      </a>

      <h1 className="text-2xl font-bold text-surface-900 mb-6">Create New Post</h1>

      {notification && (
        <Notification message={notification.message} type={notification.type} onClose={handleClearNotification} />
      )}

      <PostForm onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  );
}
