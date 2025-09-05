import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Toolbar } from '../components';
import { PostProcessorDialog } from '../components/features';
import {
  ToolbarAction,
  ToolbarViewAction,
} from '../components/layout/toolbar/Toolbar';
import { Card, Checkbox, Col, Container, Input, Row } from '../components/ui';
import { PostProcessor, Settings } from '../types';
import { showToast } from '../utils/utils';

const SettingsPage: React.FC = () => {
  const { t } = useTranslation();
  const [ytsubsApiKey, setYtsubsApiKey] = useState<string>('');
  const [excludeShorts, setExcludeShorts] = useState<boolean>(false);
  const [postProcessors, setPostProcessors] = useState<PostProcessor[]>([]);
  const [editingPostProcessor, setEditingPostProcessor] =
    useState<PostProcessor | null>(null);

  const defaultWebhook: PostProcessor = {
    name: '',
    type: 'webhook',
    target: '',
    data: '{"method":"GET"}',
  };

  useEffect(() => {
    refreshPostProcessors();
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const data: Settings = await res.json();

      setYtsubsApiKey(data.ytsubs_apikey ?? '');
      setExcludeShorts((data.exclude_shorts ?? 'false') === 'true');
    } catch (err) {
      console.error('Failed to fetch settings', err);
    }
  };

  const refreshPostProcessors = async () => {
    try {
      const res = await fetch('/api/postprocessors');
      const data: PostProcessor[] = await res.json();
      setPostProcessors(data);
    } catch (err) {
      console.error('Failed to fetch postprocessors', err);
    }
  };

  const handleSave = async () => {
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ytsubs_apikey: ytsubsApiKey,
          exclude_shorts: String(excludeShorts), // SQLite can't store bool
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to save settings');
      }

      showToast(t('settingsPage.savedSettings'), 'success');
    } catch (err) {
      console.error(err);
      showToast(t('settingsPage.errorSavingSettings'), 'error');
    }
  };

  const handlePostProcessorClick = (postProcessor: PostProcessor) => {
    setEditingPostProcessor(postProcessor);
  };

  const handleAddPostProcessor = () => {
    setEditingPostProcessor(defaultWebhook);
  };

  const handleCloseDialog = () => {
    setEditingPostProcessor(null);
  };

  const onActionClick = (action: ToolbarAction | ToolbarViewAction) => {
    console.log('Action clicked:', action);
    if (action === ToolbarAction.SAVE) {
      handleSave();
    }
  };

  return (
    <>
      <Toolbar actions={[ToolbarAction.SAVE]} onActionClick={onActionClick} />

      <Container fluid withToolbar>
        <Row>
          <Col md={8}>
            <div>
              <div>{t('settingsPage.title')}</div>

              <div>
                <div>{t('settingsPage.ytsubsApiKey')}</div>
                <Input
                  type="text"
                  value={ytsubsApiKey}
                  onChange={e => setYtsubsApiKey(e.target.value)}
                  placeholder={t('settingsPage.ytsubsApiKeyPlaceholder')}
                />
              </div>

              <div>
                <div>{t('settingsPage.excludeShorts')}</div>
                <Checkbox
                  checked={excludeShorts}
                  onChange={e => setExcludeShorts(e.target.checked)}
                  label={t('settingsPage.excludeShortsLabel')}
                />
              </div>

              <div>{t('settingsPage.postProcessors')}</div>

              <div>
                {postProcessors.map(postProcessor => (
                  <Card
                    key={postProcessor.id}
                    onClick={() => handlePostProcessorClick(postProcessor)}
                  >
                    <Card.Body>
                      <h3>{postProcessor.name}</h3>
                      <div>
                        <i className="bi bi-broadcast" />
                        <div>{postProcessor.type}</div>
                      </div>
                    </Card.Body>
                  </Card>
                ))}
                <Card onClick={handleAddPostProcessor}>
                  <Card.Body>
                    <div>
                      <i className="bi bi-plus-square" />
                    </div>
                  </Card.Body>
                </Card>
              </div>

              <br />

              <PostProcessorDialog
                editingItem={editingPostProcessor}
                onClose={handleCloseDialog}
                onRefreshPostProcessors={refreshPostProcessors}
              />
            </div>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default SettingsPage;
