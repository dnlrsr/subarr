import { faBars } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button, Form, InputGroup, Nav, Navbar } from '../../ui';
import styles from './Header.module.scss';

interface HeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onSearchKeyDown: (
    event: React.KeyboardEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
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
    <Navbar className={styles.container}>
      <div className={styles.leftSection}>
        <button
          className={styles.hamburger + ' d-block d-md-none'}
          onClick={onToggleSidebar}
          aria-label="Open sidebar"
          type="button"
        >
          <FontAwesomeIcon icon={faBars} size="2x" />
        </button>

        <Navbar.Brand as={Link} to="/">
          <img src="/logo192.png" alt="App Icon" width="45" height="45" />
        </Navbar.Brand>
      </div>

      <Nav>
        <Form>
          <InputGroup>
            <InputGroup.Text>
              <i />
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder={t('header.searchPlaceholder')}
              value={searchTerm}
              onChange={e => onSearchChange(e.target.value)}
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
