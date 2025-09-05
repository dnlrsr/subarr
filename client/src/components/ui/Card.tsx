import React from 'react';
import { Card as BootstrapCard } from 'react-bootstrap';
import './Card.css';

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
  const semanticClass = semantic ? `card-app-${semantic}` : '';
  const combinedClassName = `card-app ${semanticClass} ${className}`.trim();

  return (
    <BootstrapCard className={combinedClassName} onClick={onClick}>
      {children}
    </BootstrapCard>
  );
};

Card.Header = ({ children, className = '', semantic }) => {
  const semanticClass = semantic ? `card-app-header-${semantic}` : '';
  const combinedClassName = `card-app-header ${semanticClass} ${className}`.trim();
  
  return (
    <BootstrapCard.Header className={combinedClassName}>
      {children}
    </BootstrapCard.Header>
  );
};

Card.Body = ({ children, className = '', semantic }) => {
  const semanticClass = semantic ? `card-app-body-${semantic}` : '';
  const combinedClassName = `card-app-body ${semanticClass} ${className}`.trim();
  
  return (
    <BootstrapCard.Body className={combinedClassName}>
      {children}
    </BootstrapCard.Body>
  );
};

export default Card;
