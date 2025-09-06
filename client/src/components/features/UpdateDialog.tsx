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
      <div >
        <div >
          {currentVersion} → {newVersionInfo?.tag_name}
        </div>
        <div >
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
            <p {...props} />
          ),
          code: ({ node, ...props }) => (
            <code
              {...props}
            />
          ),
        }}
      >
        {newVersionInfo?.body}
      </Markdown>
      <a
        
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
