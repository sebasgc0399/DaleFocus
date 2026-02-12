function SegmentedTabs({
  tabs,
  activeTab,
  onChange,
  disabled = false,
  ariaLabel = 'Selector de pestañas',
}) {
  const activeIndex = tabs.findIndex((t) => t.id === activeTab);

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className="relative flex bg-surface-1 rounded-lg border border-subtle p-1"
    >
      {/* Thumb animado */}
      <div
        className="absolute top-1 bottom-1 bg-surface-0 border border-subtle rounded-md shadow-elevation-1 transition-transform duration-200 ease-out"
        style={{
          width: `calc((100% - 0.5rem) / ${tabs.length})`,
          transform: `translateX(calc(${activeIndex} * 100%))`,
        }}
        aria-hidden="true"
      />

      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            role="tab"
            type="button"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            disabled={disabled}
            onClick={() => onChange(tab.id)}
            onKeyDown={(e) => {
              const currentIdx = tabs.findIndex((t) => t.id === tab.id);
              let nextIdx = -1;
              if (e.key === 'ArrowRight') {
                nextIdx = (currentIdx + 1) % tabs.length;
              } else if (e.key === 'ArrowLeft') {
                nextIdx = (currentIdx - 1 + tabs.length) % tabs.length;
              } else if (e.key === 'Home') {
                nextIdx = 0;
              } else if (e.key === 'End') {
                nextIdx = tabs.length - 1;
              }
              if (nextIdx >= 0) {
                e.preventDefault();
                onChange(tabs[nextIdx].id);
              }
            }}
            className={`relative z-10 flex-1 py-2.5 text-sm font-semibold rounded-md transition-colors duration-200 ease-out
              disabled:opacity-50 disabled:cursor-not-allowed
              ${isActive ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'}
              focus-visible:outline-2 focus-visible:outline-primary-500 focus-visible:outline-offset-2`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

export { SegmentedTabs };
