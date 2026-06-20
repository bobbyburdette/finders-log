type BottomNavigationProps = {
  active: "collection" | "log" | null;
  onCollection: () => void;
  onLog: () => void;
  onSession: () => void;
};

export function BottomNavigation({ active, onCollection, onLog, onSession }: BottomNavigationProps) {
  return (
    <nav className="bottom-nav" aria-label="Primary">
      <button className={active === "log" ? "bn-tab active" : "bn-tab"} type="button" onClick={onLog}>
        <svg width="26" height="26" viewBox="0 0 492.308 492.308" fill="currentColor" aria-hidden="true">
          <path d="M483.856,24.067c-77.804-11.16-159.893,1.963-237.703,37.817C168.344,26.041,86.255,12.931,8.452,24.067L0,25.274v408.111l11.24-1.611c75.365-10.774,155.077,2.351,230.385,37.88l0.722,0.355l3.297,2.02l0.416-0.196l0.555,0.273l3.522-2.194l0.344-0.162c75.519-35.625,155.231-48.76,230.587-37.976l11.24,1.611V25.274L483.856,24.067z M236.308,445.635c-56.75-24.63-115.567-37.216-173.183-37.216c-14.567,0-29.067,0.808-43.433,2.428V42.452c71.019-8.447,145.577,4.12,216.615,36.519V445.635z M329.49,53.024c23.187-5.99,46.463-9.914,69.644-11.742v118.752l-34.827-26.12l-34.817,26.115V53.024z M472.615,410.846c-71.096-8.043-145.413,3.913-216.615,34.798V78.971c17.749-8.094,35.719-14.949,53.798-20.548v141l54.51-40.894l54.519,40.889V40.042c18.079-0.496,36.046,0.301,53.788,2.41V410.846z" />
          <path d="M47.471,343l2.788,19.49c49.875-7.115,102.663,1.587,152.673,25.197l8.404-17.808C157.827,344.616,101.135,335.317,47.471,343z" />
          <path d="M47.471,264.063l2.788,19.49c49.875-7.13,102.663,1.587,152.673,25.197l8.404-17.808C157.817,265.668,101.135,256.385,47.471,264.063z" />
          <path d="M47.471,185.125l2.788,19.49c49.875-7.125,102.663,1.582,152.673,25.197l8.404-17.808C157.827,186.736,101.135,177.447,47.471,185.125z" />
          <path d="M47.471,106.188l2.788,19.49c49.885-7.13,102.654,1.572,152.673,25.192l8.404-17.808C157.817,107.798,101.135,98.5,47.471,106.188z" />
        </svg>
        The Log
      </button>

      <button className="bn-log" type="button" onClick={onSession}>
        <div className="bn-log-circle">
          <span className="bn-log-plus">+</span>
        </div>
        <span className="bn-log-label">Session</span>
      </button>

      <button
        className={active === "collection" ? "bn-tab active" : "bn-tab"}
        type="button"
        onClick={onCollection}
      >
        <svg
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
        Collection
      </button>
    </nav>
  );
}
