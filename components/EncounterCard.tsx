'use client';

import { EncounterDisplay } from '@/types';

interface EncounterCardProps {
  encounter: EncounterDisplay;
}

export default function EncounterCard({ encounter }: EncounterCardProps) {
  const timeAgo = getTimeAgo(encounter.timestamp);

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all border-2 border-netpass-accent overflow-hidden">
      {/* Avatar and Name */}
      <div className="bg-netpass-secondary text-white px-4 py-4 flex items-center gap-4">
        <img
          src={encounter.avatarUrl}
          alt={encounter.name}
          className="w-16 h-16 rounded border-2 border-white object-cover"
        />
        <div className="flex-1">
          <h3 className="font-bold text-lg">{encounter.name}</h3>
          <p className="text-xs opacity-90">{timeAgo}</p>
        </div>
      </div>

      {/* Message */}
      {encounter.message && (
        <div className="bg-netpass-light border-b-2 border-netpass-accent p-4">
          <p className="text-sm text-netpass-dark italic">"{encounter.message}"</p>
        </div>
      )}

      {/* Contact Info */}
      {encounter.email && (
        <div className="px-4 py-3 text-xs text-netpass-dark bg-gray-50 border-b-2 border-netpass-accent">
          <span className="font-semibold">Contact: </span>
          <span className="break-all">{encounter.email}</span>
        </div>
      )}

      {/* Location and Exchange */}
      <div className="px-4 py-3 space-y-2">
        {encounter.distance !== undefined && (
          <p className="text-xs text-netpass-dark">
            <span className="font-semibold">Distance:</span> {encounter.distance < 1000 ? `${Math.round(encounter.distance)}m` : `${(encounter.distance / 1000).toFixed(1)}km`}
          </p>
        )}
      </div>
    </div>
  );
}

function getTimeAgo(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
}
