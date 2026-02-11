const PADDING_CLASS = {
  sm: 'card card-sm',
  md: 'card',
  lg: 'card card-lg',
};

function Card({
  padding = 'md',
  selected = false,
  muted = false,
  interactive = false,
  className,
  children,
  ...rest
}) {
  const classes = [
    PADDING_CLASS[padding],
    selected && 'card-selected',
    muted && 'card-muted',
    interactive && 'card-interactive',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  );
}

export { Card };
