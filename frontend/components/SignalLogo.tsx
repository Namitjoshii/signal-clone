export default function SignalLogo({ className = "h-16 w-16" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full"
        aria-hidden="true"
      >
        <circle cx="32" cy="32" r="32" fill="#2C6BED" />
        <path
          d="M32 14c-9.94 0-18 8.06-18 18 0 6.28 3.22 11.8 8.1 15.02L20 50l8.5-4.25C29.58 46.58 30.76 47 32 47c9.94 0 18-8.06 18-18S41.94 14 32 14z"
          fill="white"
        />
        <circle cx="24" cy="32" r="2.5" fill="#2C6BED" />
        <circle cx="32" cy="32" r="2.5" fill="#2C6BED" />
        <circle cx="40" cy="32" r="2.5" fill="#2C6BED" />
      </svg>
    </div>
  );
}
