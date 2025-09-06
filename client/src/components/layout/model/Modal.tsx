import React from 'react';
import {
  Modal as BootstrapModal,
  ModalHeaderProps as BootstrapModalHeaderProps,
  ModalProps as BootstrapModalProps,
} from 'react-bootstrap';

interface ModalProps extends BootstrapModalProps {
  children: React.ReactNode;
}

interface ModalDialogProps {
  children: React.ReactNode;
}

interface ModalHeaderProps extends BootstrapModalHeaderProps {
  children: React.ReactNode;
}

interface ModalTitleProps {
  children: React.ReactNode;
}

interface ModalBodyProps {
  children: React.ReactNode;
}

interface ModalFooterProps {
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> & {
  Dialog: React.FC<ModalDialogProps>;
  Header: React.FC<ModalHeaderProps>;
  Title: React.FC<ModalTitleProps>;
  Body: React.FC<ModalBodyProps>;
  Footer: React.FC<ModalFooterProps>;
} = ({ children, ...props }) => {
  return <BootstrapModal {...props}>{children}</BootstrapModal>;
};

Modal.Dialog = BootstrapModal.Dialog;
Modal.Header = BootstrapModal.Header;
Modal.Title = BootstrapModal.Title;
Modal.Body = ({ children }) => {
  return <BootstrapModal.Body>{children}</BootstrapModal.Body>;
};
Modal.Footer = BootstrapModal.Footer;

export default Modal;
