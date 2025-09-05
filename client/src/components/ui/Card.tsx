import React from 'react';
import { Card as BootstrapCard } from 'react-bootstrap';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  semantic?: 'playlist' | 'video' | 'postprocessor' | 'search-results' | 'clickable';
  onClick?: () => void;
}

export interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
  semantic?: 'toolbar';
}

export interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
  semantic?: 'scroll' | 'filter';
}

const Card: React.FC<CardProps> & {
  Header: React.FC<CardHeaderProps>;
  Body: React.FC<CardBodyProps>;
} = ({
  children,
  className = '',
  semantic,
  onClick
}) => {
  // Base card styles
  const getCardStyles = () => {
    const baseStyles = {
      backgroundColor: 'var(--card-bg, #2a2a2a)',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
      overflow: 'hidden' as const,
      transition: 'all 0.2s ease',
      color: 'inherit',
      textDecoration: 'none',
    };

    switch (semantic) {
      case 'playlist':
      case 'video':
        return {
          ...baseStyles,
          width: '240px',
          cursor: 'pointer',
        };
      case 'postprocessor':
        return {
          ...baseStyles,
          cursor: 'pointer',
        };
      case 'clickable':
        return {
          ...baseStyles,
          cursor: 'pointer',
        };
      default:
        return baseStyles;
    }
  };

  const cardStyles = getCardStyles();

  return (
    <BootstrapCard 
      className={className} 
      onClick={onClick}
      style={cardStyles}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.4)';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.3)';
          e.currentTarget.style.transform = 'translateY(0)';
        }
      }}
    >
      {children}
    </BootstrapCard>
  );
};

Card.Header = ({ children, className = '', semantic }) => {
  const getHeaderStyles = () => {
    const baseStyles = {
      padding: '16px 20px',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      backgroundColor: 'rgba(0, 0, 0, 0.1)',
    };

    switch (semantic) {
      case 'toolbar':
        return {
          ...baseStyles,
          display: 'flex',
          alignItems: 'center',
          padding: '0px 20px',
          gap: '10px',
          backgroundColor: '#262626',
          height: '60px',
          borderBottom: 'none',
        };
      default:
        return baseStyles;
    }
  };
  
  return (
    <BootstrapCard.Header className={className} style={getHeaderStyles()}>
      {children}
    </BootstrapCard.Header>
  );
};

Card.Body = ({ children, className = '', semantic }) => {
  const getBodyStyles = () => {
    const baseStyles = {
      padding: '20px',
    };

    switch (semantic) {
      case 'scroll':
        return {
          ...baseStyles,
          overflowX: 'auto' as const,
        };
      case 'filter':
        return {
          padding: '0',
          backgroundColor: '#333',
        };
      default:
        return baseStyles;
    }
  };
  
  return (
    <BootstrapCard.Body className={className} style={getBodyStyles()}>
      {children}
    </BootstrapCard.Body>
  );
};

export default Card;
