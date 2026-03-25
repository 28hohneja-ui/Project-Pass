'use client';

import { useState } from 'react';
import { processAvatarImage } from '@/lib/avatar';
import AvatarPreview from './AvatarPreview';

interface CharacterCreatorProps {
  onProfileCreated: (profile: {
    name: string;
    message: string;
    avatarUrl: string;
  }) => void;
}

export default function CharacterCreator({ onProfileCreated }: CharacterCreatorProps) {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'create' | 'preview'>('create');
  const [error, setError] = useState('');

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError('');

    try {
      const dataUrl = await processAvatarImage(file);
      setAvatarUrl(dataUrl);
      setStep('preview');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to process avatar';
      setError(message);
      console.error('Avatar upload error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!name.trim()) {
      setError('Please enter a name');
      return;
    }
    if (!avatarUrl) {
      setError('Please upload an avatar');
      return;
    }

    setLoading(true);
    setError('');

    try {
      onProfileCreated({
        name: name.trim(),
        message: message.trim(),
        avatarUrl: avatarUrl
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error saving profile';
      setError(message);
      console.error('Profile creation error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-netpass-light to-white flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-netpass-primary mb-2">Streetpass</h1>
          <p className="text-netpass-dark text-lg">Create Your Profile</p>
        </div>

        {step === 'create' ? (
          <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-netpass-accent">
            <div className="mb-8">
              <label className="block text-sm font-semibold text-netpass-dark mb-3">
                Your Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                maxLength={16}
                className="w-full px-4 py-3 border-2 border-netpass-accent rounded-lg focus:outline-none focus:border-netpass-primary focus:ring-2 focus:ring-netpass-accent/50 text-gray-900"
              />
              <p className="text-xs text-gray-600 mt-2">{name.length}/16 characters</p>
            </div>

            <div className="mb-8">
              <label className="block text-sm font-semibold text-netpass-dark mb-3">
                Personal Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="What will you say to others? (optional)"
                maxLength={64}
                rows={3}
                className="w-full px-4 py-3 border-2 border-netpass-accent rounded-lg focus:outline-none focus:border-netpass-primary focus:ring-2 focus:ring-netpass-accent/50 text-gray-900"
              />
              <p className="text-xs text-gray-600 mt-2">{message.length}/64 characters</p>
            </div>

            <div className="mb-8">
              <label className="block text-sm font-semibold text-netpass-dark mb-3">
                Upload Your Avatar
              </label>
              <p className="text-xs text-netpass-dark mb-4">
                Choose any image - it will be resized to 300x300
              </p>
              <div className="border-2 border-dashed border-netpass-accent rounded-lg p-6 text-center hover:bg-netpass-light transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  disabled={loading}
                  className="hidden"
                  id="avatar-upload"
                />
                <label
                  htmlFor="avatar-upload"
                  className="cursor-pointer block"
                >
                  <div className="text-4xl mb-2">
                    {loading ? 'Processing...' : '📷'}
                  </div>
                  <p className="text-sm font-semibold text-netpass-dark mb-1">
                    {loading ? 'Processing image...' : 'Click to upload'}
                  </p>
                  <p className="text-xs text-gray-600">
                    or drag and drop an image
                  </p>
                </label>
              </div>
              {error && (
                <p className="text-xs text-red-600 mt-3">{error}</p>
              )}
            </div>

            {!avatarUrl && (
              <p className="text-xs text-netpass-dark text-center">
                Upload an avatar image to continue
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-netpass-accent">
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <img
                    src={avatarUrl}
                    alt={name}
                    className="w-32 h-32 rounded-lg border-2 border-netpass-secondary object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-netpass-primary mb-2">{name}</h3>
                  {message && (
                    <p className="text-netpass-dark italic mb-4">"{message}"</p>
                  )}
                  <p className="text-xs text-gray-600">
                    This is how others will see you in Streetpass.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setStep('create');
                  setAvatarUrl('');
                  setError('');
                }}
                className="flex-1 py-3 bg-gray-300 hover:bg-gray-400 text-gray-900 font-bold rounded-lg transition duration-200 border-2 border-gray-500"
              >
                Back
              </button>
              <button
                onClick={handleConfirm}
                disabled={loading || !avatarUrl || !name.trim()}
                className="flex-1 py-3 bg-netpass-primary hover:bg-netpass-dark text-white font-bold rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-netpass-dark"
              >
                {loading ? 'Creating...' : 'Confirm'}
              </button>
            </div>

            {error && (
              <p className="text-xs text-red-600 text-center">{error}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
