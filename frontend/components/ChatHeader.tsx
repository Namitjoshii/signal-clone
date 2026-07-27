type ChatHeaderProps = {
  name: string;
  avatar: string;
  isOnline?: boolean;
  onBack?: () => void;
  showBackButton?: boolean;
};

export default function ChatHeader({
  name,
  avatar,
  isOnline,
  onBack,
  showBackButton,
}: ChatHeaderProps) {
  return (
    <header className="flex items-center gap-3 border-b border-signal-border bg-white px-4 py-3">
      {showBackButton && (
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to conversations"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-signal-muted transition-colors hover:bg-signal-hover hover:text-signal-text md:hidden"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
          >
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      <div className="relative shrink-0">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-signal-blue text-sm font-semibold text-white">
          {avatar}
        </div>
        {isOnline && (
          <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-signal-green" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <h2 className="truncate font-semibold text-signal-text">{name}</h2>
        <p className="text-xs text-signal-muted">
          {isOnline ? "Online" : "Offline"}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          aria-label="Voice call"
          className="flex h-9 w-9 items-center justify-center rounded-full text-signal-muted transition-colors hover:bg-signal-hover hover:text-signal-text"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
          >
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
        </button>
        <button
          type="button"
          aria-label="More options"
          className="flex h-9 w-9 items-center justify-center rounded-full text-signal-muted transition-colors hover:bg-signal-hover hover:text-signal-text"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-5 w-5"
          >
            <circle cx="12" cy="5" r="1.5" />
            <circle cx="12" cy="12" r="1.5" />
            <circle cx="12" cy="19" r="1.5" />
          </svg>
        </button>
      </div>
    </header>
  );
}
