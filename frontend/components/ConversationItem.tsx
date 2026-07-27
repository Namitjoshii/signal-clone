type ConversationItemProps = {
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unreadCount?: number;
  isOnline?: boolean;
  isActive?: boolean;
  onClick?: () => void;
};

export default function ConversationItem({
  name,
  avatar,
  lastMessage,
  timestamp,
  unreadCount,
  isOnline,
  isActive,
  onClick,
}: ConversationItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-signal-hover ${
        isActive ? "bg-signal-active" : ""
      }`}
    >
      <div className="relative shrink-0">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-signal-blue text-sm font-semibold text-white">
          {avatar}
        </div>
        {isOnline && (
          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-signal-green" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className="truncate font-semibold text-signal-text">{name}</span>
          <span className="shrink-0 text-xs text-signal-muted">{timestamp}</span>
        </div>
        <div className="mt-0.5 flex items-center justify-between gap-2">
          <p className="truncate text-sm text-signal-muted">{lastMessage}</p>
          {unreadCount != null && unreadCount > 0 && (
            <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-signal-blue px-1.5 text-xs font-medium text-white">
              {unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
