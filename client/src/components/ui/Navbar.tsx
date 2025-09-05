import React from 'react';
import { Nav as BootstrapNav, Navbar as BootstrapNavbar } from 'react-bootstrap';

export interface NavbarProps {
  variant?: 'light' | 'dark';
  expand?: boolean | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

export interface NavbarBrandProps {
  as?: React.ElementType;
  to?: string;
  className?: string;
  children: React.ReactNode;
}

export interface NavProps {
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

export interface NavLinkProps {
  as?: React.ElementType;
  to?: string;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  children: React.ReactNode;
}

const NavbarComponent: React.FC<NavbarProps> = ({
  variant,
  expand,
  className,
  style,
  children,
  ...props
}) => {
  return (
    <BootstrapNavbar
      variant={variant}
      expand={expand}
      className={className}
      style={style}
      {...props}
    >
      {children}
    </BootstrapNavbar>
  );
};

const NavbarBrandComponent: React.FC<NavbarBrandProps> = ({
  as,
  to,
  className,
  children,
  ...props
}) => {
  return (
    <BootstrapNavbar.Brand
      as={as}
      to={to}
      className={className}
      {...props}
    >
      {children}
    </BootstrapNavbar.Brand>
  );
};

const NavComponent: React.FC<NavProps> = ({
  className,
  style,
  children,
  ...props
}) => {
  return (
    <BootstrapNav
      className={className}
      style={style}
      {...props}
    >
      {children}
    </BootstrapNav>
  );
};

const NavLinkComponent: React.FC<NavLinkProps> = ({
  as,
  to,
  className,
  style,
  onClick,
  children,
  ...props
}) => {
  return (
    <BootstrapNav.Link
      as={as}
      to={to}
      className={className}
      style={style}
      onClick={onClick}
      {...props}
    >
      {children}
    </BootstrapNav.Link>
  );
};

// Create Nav with Link attached
type NavWithLink = typeof NavComponent & {
  Link: typeof NavLinkComponent;
};

const Nav = NavComponent as NavWithLink;
Nav.Link = NavLinkComponent;

// Create Navbar with Brand attached
type NavbarWithBrand = typeof NavbarComponent & {
  Brand: typeof NavbarBrandComponent;
};

const Navbar = NavbarComponent as NavbarWithBrand;
Navbar.Brand = NavbarBrandComponent;

export { Nav, Navbar, NavbarBrandComponent as NavbarBrand, NavLinkComponent as NavLink };
export default Navbar;
