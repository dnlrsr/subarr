import React from 'react';
import { Button, Form, InputGroup, Nav, Navbar } from 'react-bootstrap';
import { Link } from 'react-router-dom';

interface HeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onSearchKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({
  searchTerm,
  onSearchChange,
  onSearchKeyDown,
  onToggleSidebar,
}) => {
  return (
    <Navbar 
      variant="dark" 
      expand="lg" 
      className="px-3"
      style={{ 
        width: '100%',
        minHeight: '56px', // Ensure consistent height
        backgroundColor: '#2a2a2a',
        borderBottom: '1px solid #333'
      }}
    >
      <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
        <img
          src="/logo192.png"
          alt="App Icon"
          width="30"
          height="30"
          className="me-2"
        />
        Subarr
      </Navbar.Brand>
      
      <Button
        variant="outline-light"
        size="sm"
        onClick={onToggleSidebar}
        className="d-lg-none"
      >
        ☰
      </Button>

      <Nav className="ms-auto">
        <Form className="d-flex">
          <InputGroup>
            <InputGroup.Text>
              <i className="bi bi-search" />
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyDown={onSearchKeyDown}
              style={{ minWidth: '200px' }}
            />
            {searchTerm && (
              <Button
                variant="outline-secondary"
                onClick={() => onSearchChange('')}
              >
                <i className="bi bi-x-lg" />
              </Button>
            )}
          </InputGroup>
        </Form>
      </Nav>
    </Navbar>
  );
};

export default Header;
