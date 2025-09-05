import React from 'react';
import { Form } from 'react-bootstrap';
import './Input.css'; // Reuse input styles

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface SelectProps {
  label?: string;
  error?: string;
  helperText?: string;
  value?: string | number;
  onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  id?: string;
  options: SelectOption[];
}

const Select: React.FC<SelectProps> = ({
  label,
  error,
  helperText,
  value,
  onChange,
  placeholder,
  disabled = false,
  required = false,
  className = '',
  id,
  options,
  ...props
}) => {
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
  const combinedClassName = `select-app ${className}`.trim();

  return (
    <Form.Group className="mb-3">
      {label && (
        <Form.Label htmlFor={selectId}>
          {label}
          {required && <span className="text-danger"> *</span>}
        </Form.Label>
      )}
      <Form.Select
        id={selectId}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        isInvalid={!!error}
        className={combinedClassName}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Form.Select>
      {error && <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>}
      {helperText && !error && (
        <Form.Text className="text-muted">{helperText}</Form.Text>
      )}
    </Form.Group>
  );
};

export default Select;
