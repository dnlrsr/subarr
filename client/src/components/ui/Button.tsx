import React from 'react';
import { Button as BootstrapButton, OverlayTrigger, Tooltip } from 'react-bootstrap';
import './Button.css';

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'info' | 'light' | 'dark' | 'outline-primary' | 'outline-secondary' | 'outline-danger' | 'outline-success' | 'outline-warning' | 'outline-info' | 'outline-light' | 'outline-dark';
  semantic?: 'toolbar' | 'pagination' | 'filter' | 'action' | 'icon-small' | 'icon-only';
  size?: 'sm' | 'lg';
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  title?: string;
  icon?: React.ReactNode;
  iconOnly?: boolean;
  tooltipText?: string;
  children?: React.ReactNode;
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
  icon,
  iconOnly = false,
  tooltipText,
  children,
  ...props
}) => {
  // Determine if we should use icon-only mode
  const isIconOnly = iconOnly || (icon && !children);
  const effectiveSemantic = isIconOnly ? 'icon-only' : semantic;
  const semanticClass = effectiveSemantic ? `btn-app-${effectiveSemantic}` : '';
  const combinedClassName = `btn-app ${semanticClass} ${className}`.trim();

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
      className={combinedClassName}
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
