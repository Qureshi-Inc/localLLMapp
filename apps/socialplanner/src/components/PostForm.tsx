'use client';

import { useState, useEffect, FormEvent } from 'react';

export interface FormData {
  title: string;
  caption: string;
  platform: string;
  status: string;
  scheduledAt: string | null;
  campaign: string | null;
  notes: string | null;
  imageUrl: string | null;
}

export interface Post {
  id: string;
  title: string;
  caption: string;
  platform: string;
  status: string;
  scheduledAt: string | null;
  campaign: string | null;
  notes: string | null;
  imageUrl: string | null;
}

interface PostFormProps {
  onSubmit: (data: FormData) => Promise<void>;
  initialData?: Partial<Post>;
  isLoading?: boolean;
  onCancel?: () => void;
}

interface FieldErrors {
  title?: string;
  caption?: string;
  platform?: string;
  status?: string;
}

const PLATFORM_OPTIONS = ['Instagram', 'Facebook', 'LinkedIn', 'X', 'TikTok'];
const STATUS_OPTIONS = ['IDEA', 'DRAFT', 'SCHEDULED', 'PUBLISHED'];

export default function PostForm({ onSubmit, initialData, isLoading, onCancel }: PostFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [caption, setCaption] = useState(initialData?.caption || '');
  const [platform, setPlatform] = useState(initialData?.platform || '');
  const [status, setStatus] = useState(initialData?.status || '');
  const [scheduledAt, setScheduledAt] = useState(initialData?.scheduledAt || '');
  const [campaign, setCampaign] = useState(initialData?.campaign || '');
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || '');

  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    setTitle(initialData?.title || '');
    setCaption(initialData?.caption || '');
    setPlatform(initialData?.platform || '');
    setStatus(initialData?.status || '');
    setScheduledAt(initialData?.scheduledAt || '');
    setCampaign(initialData?.campaign || '');
    setNotes(initialData?.notes || '');
    setImageUrl(initialData?.imageUrl || '');
    setErrors({});
    setTouched({});
  }, [initialData?.title, initialData?.caption, initialData?.platform, initialData?.status, initialData?.scheduledAt, initialData?.campaign, initialData?.notes, initialData?.imageUrl]);

  useEffect(() => {
    if (submitSuccess) {
      const timer = setTimeout(() => {
        setSubmitSuccess(false);
        if (!initialData) {
          setTitle('');
          setCaption('');
          setPlatform('');
          setStatus('');
          setScheduledAt('');
          setCampaign('');
          setNotes('');
          setImageUrl('');
        }
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [submitSuccess, initialData]);

  const validate = (): FieldErrors => {
    const newErrors: FieldErrors = {};
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!caption.trim()) {
      newErrors.caption = 'Caption is required';
    }
    if (!platform) {
      newErrors.platform = 'Platform is required';
    }
    if (!status) {
      newErrors.status = 'Status is required';
    }
    return newErrors;
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    setErrors(validate());
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setTouched({ title: true, caption: true, platform: true, status: true });
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setIsSubmitting(true);
    setSubmitSuccess(false);
    try {
      await onSubmit({
        title: title.trim(),
        caption: caption.trim(),
        platform,
        status,
        scheduledAt: scheduledAt || null,
        campaign: campaign || null,
        notes: notes || null,
        imageUrl: imageUrl || null,
      });
      setSubmitSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasErrors = Object.keys(errors).length > 0 && Object.keys(touched).length > 0;

  const titleError = touched.title ? errors.title : undefined;
  const captionError = touched.caption ? errors.caption : undefined;
  const platformError = touched.platform ? errors.platform : undefined;
  const statusError = touched.status ? errors.status : undefined;

  return (
    <div className="space-y-4 animate-in animate-fade-in">
      {hasErrors && (
        <div className="flex items-start gap-2 bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg text-sm">
          <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <div>
            <p className="font-medium">Please fix the errors below</p>
            {Object.values(errors).map((msg, i) => (
              <p key={i} className="ml-5 mt-0.5 text-xs opacity-80">{msg}</p>
            ))}
          </div>
        </div>
      )}

      {submitSuccess && (
        <div className="flex items-center gap-2 bg-success-50 border border-success-200 text-success-700 px-4 py-3 rounded-lg text-sm">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="font-medium">
            {initialData ? 'Post updated successfully' : 'Post created successfully'}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-surface-900">
            {initialData ? 'Edit Post' : 'Create New Post'}
          </h3>
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
            initialData
              ? 'bg-warning-50 text-warning-700 ring-warning-600/20'
              : 'bg-primary-50 text-primary-700 ring-primary-600/20'
          }`}>
            {initialData ? 'Editing' : 'New'}
          </span>
        </div>

        <div className="space-y-4">
          <div
            className={`transition-colors duration-200 rounded-lg border px-4 py-3 ${
              titleError
                ? 'bg-danger-50 border-danger-300'
                : 'bg-surface-50 border-input focus-within:border-primary focus-within:ring-1 focus-within:ring-primary'
            }`}
          >
            <label
              htmlFor="post-title"
              className="block text-xs font-medium text-surface-500 uppercase tracking-wide mb-1"
            >
              Title
            </label>
            <input
              id="post-title"
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (touched.title) setErrors(validate());
              }}
              onBlur={() => handleBlur('title')}
              className="w-full bg-transparent text-surface-900 placeholder-surface-400 outline-none text-sm disabled:opacity-50"
              placeholder="Enter post title..."
              required
              disabled={isSubmitting || isLoading}
              aria-invalid={!!titleError}
              aria-describedby={titleError ? 'title-error' : undefined}
            />
            {titleError && (
              <p id="title-error" className="mt-1.5 text-xs text-danger-600 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {titleError}
              </p>
            )}
          </div>

          <div
            className={`transition-colors duration-200 rounded-lg border px-4 py-3 ${
              captionError
                ? 'bg-danger-50 border-danger-300'
                : 'bg-surface-50 border-input focus-within:border-primary focus-within:ring-1 focus-within:ring-primary'
            }`}
          >
            <label
              htmlFor="post-caption"
              className="block text-xs font-medium text-surface-500 uppercase tracking-wide mb-1"
            >
              Caption
            </label>
            <textarea
              id="post-caption"
              value={caption}
              onChange={(e) => {
                setCaption(e.target.value);
                if (touched.caption) setErrors(validate());
              }}
              onBlur={() => handleBlur('caption')}
              className="w-full bg-transparent text-surface-900 placeholder-surface-400 outline-none text-sm resize-none disabled:opacity-50"
              placeholder="Write your caption..."
              rows={4}
              required
              disabled={isSubmitting || isLoading}
              aria-invalid={!!captionError}
              aria-describedby={captionError ? 'caption-error' : undefined}
            />
            {captionError && (
              <p id="caption-error" className="mt-1.5 text-xs text-danger-600 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {captionError}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="post-platform" className="block text-xs font-medium text-surface-500 uppercase tracking-wide">
                Platform
              </label>
              <div className="relative">
                <select
                  id="post-platform"
                  value={platform}
                  onChange={(e) => {
                    setPlatform(e.target.value);
                    if (touched.platform) setErrors(validate());
                  }}
                  onBlur={() => handleBlur('platform')}
                  className={`w-full appearance-none bg-surface-50 border border-input rounded-lg px-4 py-2.5 text-sm text-surface-900 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors disabled:opacity-50 cursor-pointer ${
                    platformError ? 'bg-danger-50 border-danger-300' : ''
                  }`}
                  required
                  disabled={isSubmitting || isLoading}
                  aria-invalid={!!platformError}
                  aria-describedby={platformError ? 'platform-error' : undefined}
                >
                  <option value="">Select platform</option>
                  {PLATFORM_OPTIONS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </div>
              {platformError && (
                <p id="platform-error" className="text-xs text-danger-600 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {platformError}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="post-status" className="block text-xs font-medium text-surface-500 uppercase tracking-wide">
                Status
              </label>
              <div className="relative">
                <select
                  id="post-status"
                  value={status}
                  onChange={(e) => {
                    setStatus(e.target.value);
                    if (touched.status) setErrors(validate());
                  }}
                  onBlur={() => handleBlur('status')}
                  className={`w-full appearance-none bg-surface-50 border border-input rounded-lg px-4 py-2.5 text-sm text-surface-900 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors disabled:opacity-50 cursor-pointer ${
                    statusError ? 'bg-danger-50 border-danger-300' : ''
                  }`}
                  required
                  disabled={isSubmitting || isLoading}
                  aria-invalid={!!statusError}
                  aria-describedby={statusError ? 'status-error' : undefined}
                >
                  <option value="">Select status</option>
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </div>
              {statusError && (
                <p id="status-error" className="text-xs text-danger-600 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {statusError}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="post-scheduledAt" className="block text-xs font-medium text-surface-500 uppercase tracking-wide">
                Scheduled At (optional)
              </label>
              <input
                id="post-scheduledAt"
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="w-full bg-surface-50 border border-input rounded-lg px-4 py-2.5 text-sm text-surface-900 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors disabled:opacity-50"
                disabled={isSubmitting || isLoading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="post-campaign" className="block text-xs font-medium text-surface-500 uppercase tracking-wide">
                Campaign (optional)
              </label>
              <input
                id="post-campaign"
                type="text"
                value={campaign}
                onChange={(e) => setCampaign(e.target.value)}
                className="w-full bg-surface-50 border border-input rounded-lg px-4 py-2.5 text-sm text-surface-900 placeholder-surface-400 outline-none transition-colors disabled:opacity-50"
                placeholder="Campaign name"
                disabled={isSubmitting || isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="post-notes" className="block text-xs font-medium text-surface-500 uppercase tracking-wide">
              Notes (optional)
            </label>
            <textarea
              id="post-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-surface-50 border border-input rounded-lg px-4 py-2.5 text-sm text-surface-900 placeholder-surface-400 outline-none transition-colors resize-none disabled:opacity-50"
              placeholder="Internal notes..."
              rows={3}
              disabled={isSubmitting || isLoading}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="post-imageUrl" className="block text-xs font-medium text-surface-500 uppercase tracking-wide">
              Image URL (optional)
            </label>
            <input
              id="post-imageUrl"
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full bg-surface-50 border border-input rounded-lg px-4 py-2.5 text-sm text-surface-900 placeholder-surface-400 outline-none transition-colors disabled:opacity-50"
              placeholder="https://..."
              disabled={isSubmitting || isLoading}
            />
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting || isLoading}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Saving...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={initialData ? 'M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10' : 'M12 4.5v15m7.5-7.5h-15'} />
                </svg>
                {initialData ? 'Update Post' : 'Create Post'}
              </>
            )}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting || isLoading}
              className="inline-flex items-center justify-center px-4 py-2.5 bg-transparent text-surface-600 text-sm font-medium rounded-lg hover:bg-surface-50 focus:outline-none focus:ring-2 focus:ring-surface-300 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
