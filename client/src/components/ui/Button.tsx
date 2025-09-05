import React from 'react';
import { Button as BootstrapButton, OverlayTrigger, Tooltip } from 'react-bootstrap';

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
  
  // Semantic styling based on the semantic prop
  const getSemanticStyles = () => {
    const baseStyles = {
      background: 'none',
      border: 'none',
      color: '#eee',
      cursor: 'pointer',
    };

    switch (semantic) {
      case 'toolbar':
        return {
          ...baseStyles,
          fontSize: '1.5rem',
          padding: '0.5rem',
        };
      case 'icon-only':
      case 'icon-small':
        return {
          ...baseStyles,
          fontSize: isIconOnly ? '1.2rem' : '1rem',
          padding: '0.25rem 0.5rem',
        };
      case 'filter':
        return {
          ...baseStyles,
          fontSize: '1rem',
          padding: '0.5rem 1rem',
        };
      default:
        return {
          fontSize: '1rem',
          padding: '0.5rem 1rem',
        };
    }
  };

  const semanticStyles = getSemanticStyles();
  const disabledStyles = disabled ? { color: '#999', cursor: 'default' } : {};
  const combinedStyles = { ...semanticStyles, ...disabledStyles };

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
      className={className}
      title={isIconOnly ? undefined : title}
      style={combinedStyles}
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
