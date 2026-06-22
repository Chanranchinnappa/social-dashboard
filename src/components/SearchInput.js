import React, { useRef, useEffect } from 'react';
import { Search, X, Loader2 } from 'lucide-react';

export const SearchInput = React.forwardRef(function SearchInput(
  {
    value = '',
    onChange,
    placeholder = 'Search...',
    disabled = false,
    isLoading = false,
    onClear,
    debounce = 300,
    className = '',
    ...props
  },
  ref
) {
  const internalRef = useRef(null);
  const inputRef = ref || internalRef;
  const timeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleChange = (e) => {
    const newValue = e.target.value;
    if (debounce > 0) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        onChange?.(newValue);
      }, debounce);
    } else {
      onChange?.(newValue);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClear?.();
      inputRef.current?.focus();
    }
  };

  return (
    <div className={['search-input-wrapper', className].filter(Boolean).join(' ')}>
      <Search
        size={18}
        className="search-input-icon"
        aria-hidden="true"
      />
      <input
        ref={inputRef}
        type="text"
        className="search-input"
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        disabled={disabled || isLoading}
        aria-label={placeholder}
        {...props}
      />
      {(value || isLoading) && (
        <button
          type="button"
          className="search-input-clear"
          onClick={onClear}
          disabled={isLoading}
          aria-label="Clear search"
        >
          {isLoading ? (
            <Loader2
              size={16}
              className="search-input-spinner"
              aria-hidden="true"
            />
          ) : (
            <X size={16} aria-hidden="true" />
          )}
        </button>
      )}
    </div>
  );
});
