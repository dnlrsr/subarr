import React from 'react';
import { Button as BootstrapButton, OverlayTrigger, Tooltip } from 'react-bootstrap';

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'info' | 'light' | 'dark' | 'outline-primary' | 'outline-secondary' | 'outline-danger' | 'outline-success' | 'outline-warning' | 'outline-info' | 'outline-light' | 'outline-dark';
  size?: 'sm' | 'lg';
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  title?: string;
  icon?: React.ReactNode;
  iconOnly?: boolean;
  tooltipText?: string;
  children?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size,
  disabled = false,
  type = 'button',
  onClick,
  title,
  icon,
  iconOnly = false,
  tooltipText,
  children,
  ...props
}) => {
  // Determine if we should use icon-only mode
  const isIconOnly = iconOnly || (icon && !children);

  // Content to display in the button
  const buttonContent = (
    <>
      {icon}
      {!isIconOnly && children}
    </>
  );

  const button = (
    <BootstrapButton
      variant={variant}
      size={size}
      disabled={disabled}
      type={type}
      onClick={onClick}
      title={isIconOnly ? undefined : title}
      {...props}
    >
      {buttonContent}
    </BootstrapButton>
  );

  // If it's icon-only and we have tooltip text, wrap with tooltip
  if (isIconOnly && (tooltipText || title)) {
    const tooltipContent = tooltipText || title || '';
    return (
      <OverlayTrigger
        placement="bottom"
        overlay={<Tooltip id={`tooltip-${Math.random()}`}>{tooltipContent}</Tooltip>}
      >
        {button}
      </OverlayTrigger>
    );
  }

  return button;
};

export default Button;
