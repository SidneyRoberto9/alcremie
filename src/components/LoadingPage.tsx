export function LoadingPage() {
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <svg
        aria-hidden="true"
        className="h-28 w-28 animate-spin"
        fill="none"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          className="text-accent-deep"
          d="M12 22C17.5228 22 22 17.5228 22 12H19C19 15.866 15.866 19 12 19V22Z"
          fill="currentColor"
        />
        <path
          className="text-white"
          d="M2 12C2 6.47715 6.47715 2 12 2V5C8.13401 5 5 8.13401 5 12H2Z"
          fill="currentColor"
        />
      </svg>
    </div>
  )
}
