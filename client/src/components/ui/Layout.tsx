import React from 'react';
import { Col as BootstrapCol, Container as BootstrapContainer, Row as BootstrapRow } from 'react-bootstrap';

export interface ContainerProps {
  children: React.ReactNode;
  fluid?: boolean;
}

export interface RowProps {
  children: React.ReactNode;
}

export interface ColProps {
  children: React.ReactNode;
  xs?: number | 'auto';
  sm?: number | 'auto';
  md?: number | 'auto';
  lg?: number | 'auto';
  xl?: number | 'auto';
}

export const Container: React.FC<ContainerProps> = ({
  children,
  fluid = false
}) => {
  return (
    <BootstrapContainer fluid={fluid}>
      {children}
    </BootstrapContainer>
  );
};

export const Row: React.FC<RowProps> = ({
  children
}) => {
  return (
    <BootstrapRow>
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
  xl
}) => {
  return (
    <BootstrapCol 
      xs={xs} 
      sm={sm} 
      md={md} 
      lg={lg} 
      xl={xl}
    >
      {children}
    </BootstrapCol>
  );
};
