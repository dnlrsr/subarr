import React from 'react';
import { Form } from 'react-bootstrap';

export interface InputProps {
  label?: string;
  error?: string;
  helperText?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'search';
  value?: string | number;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
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
  id,
  min,
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  
  // Simplified input implementation

  return (
    <Form.Group >
      {label && (
        <Form.Label htmlFor={inputId}>
          {label}
          {required && <span > *</span>}
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
        min={min}
        {...props}
      />
      {error && (
        <Form.Control.Feedback type="invalid">
          {error}
        </Form.Control.Feedback>
      )}
      {helperText && !error && (
        <Form.Text >
          {helperText}
        </Form.Text>
      )}
    </Form.Group>
  );
};

export default Input;
