import {
  faArrowsRotate,
  faFilter,
  faFloppyDisk,
  faQuestion,
  faTableCells,
  faTrashCan,
} from '@fortawesome/free-solid-svg-icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import ToolbarButton from './toolbar-button/ToolbarButton';
import styles from './Toolbar.module.scss';

interface ToolbarProps {
  actions?: ToolbarAction[];
  viewActions?: ToolbarViewAction[];
  onActionClick?: (action: ToolbarAction | ToolbarViewAction) => void;
}

export enum ToolbarAction {
  SAVE = 'save',
  DELETE = 'delete',
  REFRESH = 'refresh',
}

export enum ToolbarViewAction {
  FILTER = 'filter',
  OPTIONS = 'options',
}

const Toolbar: React.FC<ToolbarProps> = ({ actions, viewActions, onActionClick }) => {
  const { t } = useTranslation();

  return (
    <div className={styles.container}>
      <div className={styles.buttonContainer}>
        {actions?.map(action => (
          <ToolbarButton
            key={action}
            icon={iconMapping(action)}
            onClick={() => onActionClick?.(action)}
            label={
              (
                t('common', { returnObjects: true }) as Record<
                  ToolbarAction,
                  string
                >
              )[action]
            }
          />
        ))}
      </div>
      <div className={styles.buttonContainer}>
        {viewActions?.map(viewAction => (
          <ToolbarButton
            key={viewAction}
            icon={iconMapping(viewAction)}
            onClick={() => onActionClick?.(viewAction)}
            label={
              (
                t('common', { returnObjects: true }) as Record<
                  ToolbarViewAction,
                  string
                >
              )[viewAction]
            }
          />
        ))}
      </div>
    </div>
  );
};

const iconMapping = (action: ToolbarAction | ToolbarViewAction) => {
  switch (action) {
    case ToolbarAction.SAVE:
      return faFloppyDisk;
    case ToolbarAction.DELETE:
      return faTrashCan;
    case ToolbarAction.REFRESH:
      return faArrowsRotate;
    case ToolbarViewAction.FILTER:
      return faFilter;
    case ToolbarViewAction.OPTIONS:
      return faTableCells;
    default:
      return faQuestion;
  }
};

export default Toolbar;
