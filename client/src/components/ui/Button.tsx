import React from 'react';
import { Button as BootstrapButton } from 'react-bootstrap';
import './Button.css';

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'info' | 'light' | 'dark' | 'outline-primary' | 'outline-secondary' | 'outline-danger' | 'outline-success';
  semantic?: 'toolbar' | 'pagination' | 'filter' | 'action' | 'icon-small';
  size?: 'sm' | 'lg';
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  title?: string;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  semantic,
  size,
  disabled = false,
  type = 'button',
  onClick,
  className = '',
  title,
  children,
  ...props
}) => {
  const semanticClass = semantic ? `btn-app-${semantic}` : '';
  const combinedClassName = `btn-app ${semanticClass} ${className}`.trim();

  return (
    <BootstrapButton
      variant={variant}
      size={size}
      disabled={disabled}
      type={type}
      onClick={onClick}
      className={combinedClassName}
      title={title}
      {...props}
    >
      {children}
    </BootstrapButton>
  );
};

export default Button;
