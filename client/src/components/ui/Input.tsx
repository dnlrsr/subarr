import React from 'react';
import { Form } from 'react-bootstrap';

export interface InputProps {
  label?: string;
  error?: string;
  helperText?: string;
  type?: string;
  value?: string | number;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  semantic?: 'small' | 'search' | 'filter';
  id?: string;
  min?: number;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  type = 'text',
  value,
  onChange,
  placeholder,
  disabled = false,
  required = false,
  className = '',
  semantic,
  id,
  min,
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  
  // Input styling based on semantic prop and state
  const getInputStyles = () => {
    const baseStyles = {
      width: '100%',
      backgroundColor: disabled ? '#222' : '#333',
      borderRadius: '4px',
      border: error ? '1px solid var(--danger-color, #f04b4b)' : '1px solid white',
      color: disabled ? '#666' : 'white',
      padding: '8px 12px',
      fontSize: '1rem',
      transition: 'all 0.2s ease',
    };

    switch (semantic) {
      case 'small':
        return {
          ...baseStyles,
          padding: '4px 8px',
          fontSize: '0.875rem',
        };
      case 'search':
        return {
          ...baseStyles,
          borderRadius: '20px',
          paddingLeft: '16px',
        };
      case 'filter':
        return {
          ...baseStyles,
          backgroundColor: '#2a2a2a',
          borderColor: '#444',
        };
      default:
        return baseStyles;
    }
  };

  const inputStyles = getInputStyles();
  const focusStyles = {
    outline: 'none',
    borderColor: error ? 'var(--danger-color, #f04b4b)' : 'var(--accent-color, #dc370f)',
    boxShadow: error 
      ? '0 0 0 2px rgba(240, 75, 75, 0.2)' 
      : '0 0 0 2px rgba(220, 55, 15, 0.2)',
  };

  return (
    <Form.Group className="mb-3">
      {label && (
        <Form.Label htmlFor={inputId}>
          {label}
          {required && <span className="text-danger"> *</span>}
        </Form.Label>
      )}
      <Form.Control
        id={inputId}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        isInvalid={!!error}
        className={className}
        style={inputStyles}
        min={min}
        onFocus={(e) => {
          Object.assign(e.target.style, focusStyles);
        }}
        onBlur={(e) => {
          e.target.style.borderColor = error ? 'var(--danger-color, #f04b4b)' : 'white';
          e.target.style.boxShadow = 'none';
        }}
        {...props}
      />
      {error && (
        <Form.Control.Feedback type="invalid">
          {error}
        </Form.Control.Feedback>
      )}
      {helperText && !error && (
        <Form.Text className="text-muted">
          {helperText}
        </Form.Text>
      )}
    </Form.Group>
  );
};

export default Input;
