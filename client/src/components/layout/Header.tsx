import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button, Form, InputGroup, Nav, Navbar } from '../ui';

interface HeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onSearchKeyDown: (event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({
  searchTerm,
  onSearchChange,
  onSearchKeyDown,
  onToggleSidebar,
}) => {
  const { t } = useTranslation();
  
  return (
    <Navbar 
      variant="dark" 
      expand="lg" 
      
    >
      <Navbar.Brand as={Link} to="/" >
        <img
          src="/logo192.png"
          alt="App Icon"
          width="30"
          height="30"
          
        />
        {t('header.appName')}
      </Navbar.Brand>
      
      <Button
        variant="outline-light"
        size="sm"
        onClick={onToggleSidebar}
        
      >
        ☰
      </Button>

      <Nav >
        <Form >
          <InputGroup>
            <InputGroup.Text>
              <i />
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder={t('header.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyDown={onSearchKeyDown}
              
            />
            {searchTerm && (
              <Button
                variant="outline-secondary"
                onClick={() => onSearchChange('')}
              >
                <i />
              </Button>
            )}
          </InputGroup>
        </Form>
      </Nav>
    </Navbar>
  );
};

export default Header;
