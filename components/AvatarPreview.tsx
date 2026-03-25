interface AvatarPreviewProps {
  miiImageUrl: string;
  profile: {
    name: string;
    message: string;
  };
}

export default function AvatarPreview({ miiImageUrl, profile }: AvatarPreviewProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border-2 border-netpass-accent">
      <div className="text-center">
        <h3 className="text-lg font-bold text-netpass-primary mb-2">
          {profile.name || 'Your Mii'}
        </h3>
        <p className="text-sm text-gray-700 mb-6 italic">
          &quot;{profile.message || 'Hello!'}&quot;
        </p>

        {/* Mii Image */}
        <div className="bg-netpass-light border-2 border-netpass-accent rounded-lg p-4 mb-6 flex items-center justify-center min-h-48">
          {miiImageUrl ? (
            <img src={miiImageUrl} alt="Your Mii" className="max-h-40 w-auto" />
          ) : (
            <p className="text-gray-500 text-sm">Loading Mii...</p>
          )}
        </div>

        {/* Info */}
        <div className="bg-netpass-light rounded border-l-4 border-netpass-primary p-4 text-left text-sm text-netpass-dark">
          <p className="font-semibold">Your Mii</p>
          <p className="text-xs text-gray-600 mt-2">
            This is how you will appear to other players.
          </p>
        </div>
      </div>
    </div>
  );
}
