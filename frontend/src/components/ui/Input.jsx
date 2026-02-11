function Input({
  label,
  error,
  helperText,
  className,
  inputClassName,
  id,
  ...inputProps
}) {
  const inputClasses = [
    'input-base',
    error && 'input-error',
    inputClassName,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="label">
          {label}
        </label>
      )}
      <input id={id} className={inputClasses} {...inputProps} />
      {error && <p className="text-danger-600 text-sm mt-1">{error}</p>}
      {helperText && !error && (
        <p className="text-gray-500 text-sm mt-1">{helperText}</p>
      )}
    </div>
  );
}

export { Input };
