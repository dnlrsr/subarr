import React from 'react';
import { Card as BootstrapCard } from 'react-bootstrap';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> & {
  Header: React.FC<CardHeaderProps>;
  Body: React.FC<CardBodyProps>;
} = ({
  children,
  className = '',
  onClick
}) => {
  return (
    <BootstrapCard 
      className={className} 
      onClick={onClick}
    >
      {children}
    </BootstrapCard>
  );
};

Card.Header = ({ children, className = '' }) => {
  return (
    <BootstrapCard.Header className={className}>
      {children}
    </BootstrapCard.Header>
  );
};

Card.Body = ({ children, className = '' }) => {
  return (
    <BootstrapCard.Body className={className}>
      {children}
    </BootstrapCard.Body>
  );
};

export default Card;
