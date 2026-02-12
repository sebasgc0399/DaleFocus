import { useTranslation } from 'react-i18next';

const VARIANT_CLASS = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
  danger: 'btn-danger',
};

const SIZE_CLASS = {
  sm: 'btn-sm',
  md: '',
  lg: 'btn-lg',
};

function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  loadingText,
  type = 'button',
  className,
  children,
  ...rest
}) {
  const { t } = useTranslation('common');

  const classes = [
    VARIANT_CLASS[variant],
    SIZE_CLASS[size],
    fullWidth && 'w-full',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const resolvedLoadingText = loadingText ?? t('status.loading');

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={classes}
      {...rest}
    >
      {loading ? resolvedLoadingText : children}
    </button>
  );
}

export { Button };
