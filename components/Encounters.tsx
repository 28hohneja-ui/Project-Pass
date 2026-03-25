import { EncounterDisplay } from '@/types';
import EncounterCard from './EncounterCard';

interface EncountersProps {
  encounters: EncounterDisplay[];
}

export default function Encounters({ encounters }: EncountersProps) {
  if (encounters.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 text-center border-2 border-netpass-accent">
        <h3 className="text-2xl font-bold text-netpass-primary mb-4">
          No encounters yet...
        </h3>
        <p className="text-netpass-dark mb-6">
          Keep the app open and walk around to find people nearby. When you meet
          someone within 100 meters, they will appear here.
        </p>
        <div className="bg-netpass-light rounded border-2 border-netpass-secondary p-6 text-left inline-block">
          <p className="font-semibold text-netpass-dark mb-3">What to expect:</p>
          <ul className="text-sm text-netpass-dark space-y-2">
            <li>Random encounters appear as profile pictures</li>
            <li>Small gifts or messages are exchanged</li>
            <li>You will see their name, message, and more</li>
            <li>Build connections with repeat encounter bonuses</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-netpass-primary mb-6">
        People You Have Met ({encounters.length})
      </h2>

      {/* Grid View of Avatars */}
      <div className="mb-12">
        <p className="text-sm text-netpass-dark mb-4 font-semibold">Gallery</p>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {encounters.map((encounter) => (
            <div
              key={encounter.encounterId}
              className="relative group cursor-pointer"
            >
              <div className="aspect-square rounded-lg overflow-hidden border-2 border-netpass-accent hover:border-netpass-primary transition-all hover:shadow-lg">
                <img
                  src={encounter.avatarUrl}
                  alt={encounter.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-end p-2">
                  <p className="text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity truncate w-full">
                    {encounter.name}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detail View */}
      <h3 className="text-xl font-bold text-netpass-primary mb-4">Details</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {encounters.map((encounter) => (
          <EncounterCard
            key={encounter.encounterId}
            encounter={encounter}
          />
        ))}
      </div>

      {/* Streetpass Tips */}
      <div className="mt-12 bg-netpass-light rounded-lg p-8 border-2 border-netpass-accent">
        <h3 className="font-bold text-lg text-netpass-primary mb-4">
          Streetpass Tips
        </h3>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-netpass-dark">
          <li>Encounters are most fun in public places (malls, parks, trains)</li>
          <li>Each meeting is unique with a random gift or message</li>
          <li>Meet the same person again to unlock special bonuses</li>
          <li>Choose a memorable avatar to stand out</li>
        </ul>
      </div>
    </div>
  );
}
