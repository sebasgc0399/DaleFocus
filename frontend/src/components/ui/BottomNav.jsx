const BOTTOM_TABS = [
  { id: 'focus', label: 'Focus' },
  { id: 'dashboard', label: 'Dashboard' },
];

function FocusIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="2.5" />
      <path d="M12 2v2.5" />
      <path d="M12 19.5V22" />
      <path d="M2 12h2.5" />
      <path d="M19.5 12H22" />
    </svg>
  );
}

function DashboardIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function BottomNav({ activeTab, onTabChange, hidden = false }) {
  if (hidden) return null;

  const activeIndex = BOTTOM_TABS.findIndex((tab) => tab.id === activeTab);

  const handleArrowNavigation = (event, tabId) => {
    const currentIdx = BOTTOM_TABS.findIndex((tab) => tab.id === tabId);
    let nextIdx = -1;

    if (event.key === 'ArrowRight') {
      nextIdx = (currentIdx + 1) % BOTTOM_TABS.length;
    } else if (event.key === 'ArrowLeft') {
      nextIdx = (currentIdx - 1 + BOTTOM_TABS.length) % BOTTOM_TABS.length;
    } else if (event.key === 'Home') {
      nextIdx = 0;
    } else if (event.key === 'End') {
      nextIdx = BOTTOM_TABS.length - 1;
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onTabChange(tabId);
      return;
    }

    if (nextIdx >= 0) {
      event.preventDefault();
      onTabChange(BOTTOM_TABS[nextIdx].id);
    }
  };

  return (
    <nav className="bottom-nav md:hidden" aria-label="Navegacion principal movil">
      <div role="tablist" className="max-w-4xl mx-auto grid grid-cols-2 px-3 py-1" aria-label="Navegacion">
        {BOTTOM_TABS.map((tab) => {
          const isActive = tab.id === activeTab;
          const tabClasses = [
            'bottom-nav-tab rounded-lg focus-visible:outline-2 focus-visible:outline-primary-500 focus-visible:outline-offset-2',
            isActive ? 'bottom-nav-tab--active' : 'bottom-nav-tab--inactive',
          ]
            .filter(Boolean)
            .join(' ');

          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              tabIndex={isActive ? 0 : -1}
              className={tabClasses}
              onClick={() => onTabChange(tab.id)}
              onKeyDown={(event) => handleArrowNavigation(event, tab.id)}
            >
              {tab.id === 'focus' ? <FocusIcon /> : <DashboardIcon />}
              <span>{tab.label}</span>
              {isActive && <span className="w-1 h-1 rounded-full bg-primary-500" aria-hidden="true" />}
            </button>
          );
        })}
      </div>
      <div className="sr-only">Tab activo: {activeIndex >= 0 ? BOTTOM_TABS[activeIndex].label : 'Focus'}</div>
    </nav>
  );
}

export { BottomNav };
