import React from 'react';
import { Modal } from 'react-bootstrap';
import { DialogBaseProps } from '../../types';

const DialogBase: React.FC<DialogBaseProps> = ({
  isOpen,
  onClose,
  title,
  children,
  buttons
}) => {
  return (
    <Modal show={isOpen} onHide={onClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {children}
      </Modal.Body>
      {buttons && (
        <Modal.Footer>
          {buttons}
        </Modal.Footer>
      )}
    </Modal>
  );
};

export default DialogBase;
