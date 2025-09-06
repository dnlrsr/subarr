import React from 'react';
import { Card as BootstrapCard } from 'react-bootstrap';
import styles from './Card.module.scss';

export interface CardProps {
  children: React.ReactNode;
  size?: 'grid' | 'list';
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
  Img: typeof BootstrapCard.Img;
  ImgOverlay: typeof BootstrapCard.ImgOverlay;
  Title: typeof BootstrapCard.Title;
  Text: typeof BootstrapCard.Text;
} = ({ children, onClick, size = 'list' }) => {
  return (
    <BootstrapCard
      className={styles.container}
      style={{ width: size === 'grid' ? '18rem' : '100%' }}
      onClick={onClick}
    >
      {children}
    </BootstrapCard>
  );
};
Card.ImgOverlay = BootstrapCard.ImgOverlay;
Card.Title = BootstrapCard.Title;
Card.Text = BootstrapCard.Text;

Card.Header = ({ children, className = '' }) => {
  return (
    <BootstrapCard.Header className={className}>
      {children}
    </BootstrapCard.Header>
  );
};

Card.Img = BootstrapCard.Img;

Card.Body = ({ children, className = '' }) => {
  return (
    <BootstrapCard.Body className={className}>{children}</BootstrapCard.Body>
  );
};

export default Card;
