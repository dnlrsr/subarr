import { formatDistance } from 'date-fns';
import React from 'react';
import { useTranslation } from 'react-i18next';
import Markdown from 'react-markdown';
import { GitHubRelease } from '../../types';
import { DialogBase } from '../ui';

interface UpdateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentVersion: number | null;
  newVersionInfo: GitHubRelease | null;
}

const UpdateDialog: React.FC<UpdateDialogProps> = ({
  isOpen,
  onClose,
  currentVersion,
  newVersionInfo,
}) => {
  const { t } = useTranslation();
  
  return (
    <DialogBase isOpen={isOpen} onClose={onClose} title={t('updateDialog.title')}>
      <div style={{ display: 'flex' }}>
        <div style={{ minWidth: 80 }}>
          {currentVersion} → {newVersionInfo?.tag_name}
        </div>
        <div style={{ marginLeft: 20, fontStyle: 'italic' }}>
          ({t('updateDialog.released')}{' '}
          {newVersionInfo
            ? formatDistance(new Date(newVersionInfo.published_at), new Date(), {
                addSuffix: true,
              })
            : null}
          )
        </div>
      </div>
      <Markdown
        components={{
          p: ({ node, ...props }) => (
            <p style={{ overflowWrap: 'anywhere' }} {...props} />
          ),
          code: ({ node, ...props }) => (
            <code
              style={{
                backgroundColor: 'lightgray',
                color: 'black',
                padding: '2px 5px',
              }}
              {...props}
            />
          ),
        }}
      >
        {newVersionInfo?.body}
      </Markdown>
      <a
        style={{ overflowWrap: 'anywhere' }}
        href={newVersionInfo?.html_url}
        target="_blank"
        rel="noreferrer"
      >
        {newVersionInfo?.html_url}
      </a>
    </DialogBase>
  );
};

export default UpdateDialog;
