import React from 'react';
import { Col as BootstrapCol, Container as BootstrapContainer, Row as BootstrapRow } from 'react-bootstrap';

export interface ContainerProps {
  children: React.ReactNode;
  fluid?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export interface RowProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export interface ColProps {
  children: React.ReactNode;
  xs?: number | 'auto';
  sm?: number | 'auto';
  md?: number | 'auto';
  lg?: number | 'auto';
  xl?: number | 'auto';
  className?: string;
  style?: React.CSSProperties;
}

export const Container: React.FC<ContainerProps> = ({
  children,
  fluid = false,
  className = '',
  style
}) => {
  return (
    <BootstrapContainer fluid={fluid} className={className} style={style}>
      {children}
    </BootstrapContainer>
  );
};

export const Row: React.FC<RowProps> = ({
  children,
  className = '',
  style
}) => {
  return (
    <BootstrapRow className={className} style={style}>
      {children}
    </BootstrapRow>
  );
};

export const Col: React.FC<ColProps> = ({
  children,
  xs,
  sm,
  md,
  lg,
  xl,
  className = '',
  style
}) => {
  return (
    <BootstrapCol 
      xs={xs} 
      sm={sm} 
      md={md} 
      lg={lg} 
      xl={xl} 
      className={className} 
      style={style}
    >
      {children}
    </BootstrapCol>
  );
};
