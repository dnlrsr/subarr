import React from 'react';
import { Card as BootstrapCard } from 'react-bootstrap';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const Card: React.FC<CardProps> & {
  Header: React.FC<CardHeaderProps>;
  Body: React.FC<CardBodyProps>;
} = ({
  children,
  className = '',
  style,
  onClick
}) => {
  return (
    <BootstrapCard className={className} style={style} onClick={onClick}>
      {children}
    </BootstrapCard>
  );
};

Card.Header = ({ children, className = '', style }) => (
  <BootstrapCard.Header className={className} style={style}>
    {children}
  </BootstrapCard.Header>
);

Card.Body = ({ children, className = '', style }) => (
  <BootstrapCard.Body className={className} style={style}>
    {children}
  </BootstrapCard.Body>
);

export default Card;
