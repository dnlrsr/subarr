import React from 'react';
import { Form } from 'react-bootstrap';
import './Input.css';

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
  const semanticClass = semantic ? `input-app-${semantic}` : '';
  const combinedClassName = `input-app ${semanticClass} ${className}`.trim();

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
        className={combinedClassName}
        min={min}
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
