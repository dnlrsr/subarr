import React from 'react';
import {
  Form as BootstrapForm,
  InputGroup as BootstrapInputGroup,
} from 'react-bootstrap';

export interface FormProps {
  children: React.ReactNode;
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void;
  className?: string;
}

export interface FormGroupProps {
  children: React.ReactNode;
  className?: string;
}

export interface FormLabelProps {
  children: React.ReactNode;
  htmlFor?: string;
  className?: string;
}

export interface FormControlProps {
  type?: string;
  value?: string | number;
  onClick?: () => void;
  onChange?: (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  onKeyDown?: (
    event: React.KeyboardEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  as?: 'input' | 'textarea' | 'select';
  rows?: number;
  style?: React.CSSProperties;
}

export interface InputGroupProps {
  children: React.ReactNode;
  className?: string;
}

export interface InputGroupTextProps {
  children: React.ReactNode;
  className?: string;
}

const Form: React.FC<FormProps> & {
  Group: React.FC<FormGroupProps>;
  Label: React.FC<FormLabelProps>;
  Control: React.FC<FormControlProps>;
  Check: React.FC<any>;
} = ({ children, onSubmit, className = '' }) => {
  return (
    <BootstrapForm onSubmit={onSubmit} className={className}>
      {children}
    </BootstrapForm>
  );
};

Form.Group = ({ children, className = '' }) => (
  <BootstrapForm.Group className={className}>{children}</BootstrapForm.Group>
);

Form.Label = ({ children, htmlFor, className = '' }) => (
  <BootstrapForm.Label htmlFor={htmlFor} className={className}>
    {children}
  </BootstrapForm.Label>
);

Form.Control = ({
  type = 'text',
  value,
  onChange,
  onKeyDown,
  onClick,
  placeholder,
  disabled = false,
  required = false,
  className = '',
  as = 'input',
  rows,
  style,
}) => {
  const props: any = {
    type,
    value,
    onChange,
    onKeyDown,
    onClick,
    placeholder,
    disabled,
    required,
    className,
    as,
    style,
  };

  if (as === 'textarea' && rows) {
    props.rows = rows;
  }

  return <BootstrapForm.Control {...props} />;
};

Form.Check = (props: any) => <BootstrapForm.Check {...props} />;

export { Form };
export const FormGroup: React.FC<FormGroupProps> = Form.Group;
export const FormLabel: React.FC<FormLabelProps> = Form.Label;
export const FormControl: React.FC<FormControlProps> = Form.Control;

const InputGroupComponent: React.FC<InputGroupProps> = ({
  children,
  className = '',
}) => {
  return (
    <BootstrapInputGroup className={className}>{children}</BootstrapInputGroup>
  );
};

export const InputGroupText: React.FC<InputGroupTextProps> = ({
  children,
  className = '',
}) => {
  return (
    <BootstrapInputGroup.Text className={className}>
      {children}
    </BootstrapInputGroup.Text>
  );
};

// Attach Text to InputGroup for dot notation access
type InputGroupWithText = typeof InputGroupComponent & {
  Text: typeof InputGroupText;
};

const InputGroup = InputGroupComponent as InputGroupWithText;
InputGroup.Text = InputGroupText;

// Export the enhanced InputGroup
export { InputGroup };
