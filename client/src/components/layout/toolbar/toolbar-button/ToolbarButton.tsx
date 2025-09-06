import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import styles from './ToolbarButton.module.scss';

type ToolbarButtonProps = {
  label: string;
  icon: IconDefinition;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
};

const ToolbarButton: React.FC<ToolbarButtonProps> = ({
  label,
  icon,
  onClick,
  disabled = false,
}) => {
  return (
    <button
      type="button"
      className={styles.container}
      onClick={onClick}
      disabled={disabled}
    >
      <FontAwesomeIcon icon={icon} className={styles.icon} />
      <span className={styles.label}>{label}</span>
    </button>
  );
};

export default ToolbarButton;
