import React from 'react';
import { Button as BootstrapButton } from 'react-bootstrap';

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'info' | 'light' | 'dark' | 'outline-primary' | 'outline-secondary' | 'outline-danger' | 'outline-success';
  size?: 'sm' | 'lg';
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  title?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size,
  disabled = false,
  type = 'button',
  onClick,
  className = '',
  title,
  style,
  children,
  ...props
}) => {
  return (
    <BootstrapButton
      variant={variant}
      size={size}
      disabled={disabled}
      type={type}
      onClick={onClick}
      className={className}
      title={title}
      style={style}
      {...props}
    >
      {children}
    </BootstrapButton>
  );
};

export default Button;
