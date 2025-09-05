import React from 'react';

export interface CheckboxProps {
  checked?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
}

const Checkbox: React.FC<CheckboxProps> = ({
  checked = false,
  onChange,
  label,
  disabled = false,
  className = '',
  id
}) => {
  const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

  // Custom checkbox container styles
  const containerStyles = {
    display: 'block',
    position: 'relative' as const,
    paddingLeft: '35px',
    marginBottom: '12px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: '22px',
    WebkitUserSelect: 'none' as const,
    MozUserSelect: 'none' as const,
    msUserSelect: 'none' as const,
    userSelect: 'none' as const,
    color: disabled ? '#666' : 'white',
  };

  // Hidden input styles
  const inputStyles = {
    position: 'absolute' as const,
    opacity: 0,
    cursor: 'pointer',
    height: 0,
    width: 0,
  };

  // Custom checkmark styles
  const checkmarkStyles = {
    borderRadius: '2px',
    position: 'absolute' as const,
    top: 0,
    left: 0,
    height: '20px',
    width: '20px',
    backgroundColor: disabled ? '#333' : (checked ? 'var(--accent-color, #dc370f)' : '#eee'),
    transition: 'all 0.2s ease',
  };

  // Checkmark after styles (the actual checkmark)
  const checkmarkAfterStyles = checked ? {
    content: '""',
    position: 'absolute' as const,
    display: 'block',
    left: '7px',
    top: '3px',
    width: '4px',
    height: '9px',
    border: 'solid white',
    borderWidth: '0 3px 3px 0',
    transform: 'rotate(45deg)',
  } : {};

  return (
    <label style={containerStyles} className={className}>
      <input
        type="checkbox"
        id={checkboxId}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        style={inputStyles}
      />
      <span
        style={checkmarkStyles}
        onMouseEnter={(e) => {
          if (!disabled && !checked) {
            e.currentTarget.style.backgroundColor = '#ccc';
          }
        }}
        onMouseLeave={(e) => {
          if (!disabled && !checked) {
            e.currentTarget.style.backgroundColor = '#eee';
          }
        }}
      >
        {checked && (
          <span style={checkmarkAfterStyles}></span>
        )}
      </span>
      {label && <span style={{ color: disabled ? '#666' : 'white', fontSize: '1rem', marginLeft: '8px' }}>{label}</span>}
    </label>
  );
};

export default Checkbox;
