import React from 'react';
import { Form } from 'react-bootstrap';

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
  style?: React.CSSProperties;
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
  style,
  id,
  options,
  ...props
}) => {
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

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
        className={className}
        style={style}
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
