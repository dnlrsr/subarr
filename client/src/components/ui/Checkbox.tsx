import React from 'react';
import { Form } from 'react-bootstrap';

export interface CheckboxProps {
  checked?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  label?: string;
  disabled?: boolean;
  id?: string;
}

const Checkbox: React.FC<CheckboxProps> = ({
  checked = false,
  onChange,
  label,
  disabled = false,
  id
}) => {
  const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <Form.Check
      type="checkbox"
      id={checkboxId}
      checked={checked}
      onChange={onChange}
      disabled={disabled}
      label={label}
    />
  );
};

export default Checkbox;
