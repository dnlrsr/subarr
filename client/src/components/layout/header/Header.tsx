import { faBars, faSearch } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { PlaylistSearchModal } from '../../features';
import { Form, InputGroup, Nav, Navbar } from '../../ui';
import styles from './Header.module.scss';

interface HeaderProps {
  onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { t } = useTranslation();
  const [show, setShow] = useState(false);

  return (
    <Navbar className={styles.container}>
      <PlaylistSearchModal show={show} onHide={() => setShow(false)} />
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
              <FontAwesomeIcon icon={faSearch} />
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder={t('header.searchPlaceholder')}
              onClick={() => setShow(true)}
            />
          </InputGroup>
        </Form>
      </Nav>
    </Navbar>
  );
};

export default Header;
