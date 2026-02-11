const VARIANT_CLASS = {
  focus: 'badge badge-focus',
  break: 'badge badge-break',
  info: 'badge badge-info',
  warning: 'badge badge-warning',
  neutral: 'badge badge-neutral',
};

function Badge({ variant = 'neutral', className, children }) {
  const classes = [VARIANT_CLASS[variant], className]
    .filter(Boolean)
    .join(' ');

  return <span className={classes}>{children}</span>;
}

export { Badge };
