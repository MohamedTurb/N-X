export function SiteFooter() {
  return (
    <footer className="border-t border-zinc-800 px-6 py-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 text-center text-sm uppercase tracking-[0.14em] text-zinc-400 sm:flex-row sm:items-center sm:justify-between sm:text-left sm:tracking-[0.2em]">
        <p className="break-all sm:break-normal">contact@nox-void.com</p>
        <a
          href="https://www.instagram.com/nox__eg?igsh=eHByeGN2OGkzc28x"
          target="_blank"
          rel="noreferrer"
          aria-label="Instagram"
          className="inline-flex items-center justify-center transition-colors hover:text-zinc-100"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-5 w-5"
          >
            <rect x="3" y="3" width="18" height="18" rx="5" ry="5" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
          </svg>
          <span className="sr-only">Instagram</span>
        </a>
      </div>
    </footer>
  );
}
