import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PostProcessorDialog } from '../components/features';
import { Button, Card, Checkbox, Container, Input } from '../components/ui';
import { PostProcessor, Settings } from '../types';
import { showToast } from '../utils/utils';

const SettingsPage: React.FC = () => {
  const { t } = useTranslation();
  const [ytsubsApiKey, setYtsubsApiKey] = useState<string>('');
  const [excludeShorts, setExcludeShorts] = useState<boolean>(false);
  const [postProcessors, setPostProcessors] = useState<PostProcessor[]>([]);
  const [editingPostProcessor, setEditingPostProcessor] = useState<PostProcessor | null>(null);

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

  return (
    <Container fluid style={{ height: '100%' }}>
      <Card>
        <Card.Header semantic="toolbar">
          <Button semantic="toolbar" variant="success" onClick={handleSave} title="Save Settings">
            <i className="bi bi-floppy-fill" />
            <span style={{ fontSize: 'small', marginLeft: 5 }}>{t('common.save')}</span>
          </Button>
        </Card.Header>
        <Card.Body>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: 'calc(100% - 120px)',
            padding: 30,
          }}>
            <div style={{ fontWeight: 'bold', fontSize: 'xx-large' }}>{t('settingsPage.title')}</div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }} className="flex-column-mobile">
            <div style={{ minWidth: 175 }}>{t('settingsPage.ytsubsApiKey')}</div>
            <Input
              type="text"
              value={ytsubsApiKey}
              onChange={(e) => setYtsubsApiKey(e.target.value)}
              placeholder={t('settingsPage.ytsubsApiKeyPlaceholder')}
            />
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }} className="flex-column-mobile">
            <div style={{ minWidth: 175 }}>{t('settingsPage.excludeShorts')}</div>
            <Checkbox
              checked={excludeShorts}
              onChange={(e) => setExcludeShorts(e.target.checked)}
              label={t('settingsPage.excludeShortsLabel')}
            />
          </div>

          <div style={{ marginTop: 50, fontWeight: 'bold', fontSize: 'xx-large' }}>
            {t('settingsPage.postProcessors')}
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: '20px',
            marginTop: '20px'
          }}>
            {postProcessors.map((postProcessor) => (
              <Card 
                key={postProcessor.id} 
                semantic="postprocessor"
                onClick={() => handlePostProcessorClick(postProcessor)}
              >
                <Card.Body>
                  <h3 style={{ fontSize: 'x-large', margin: '0 0 5px 0' }}>
                    {postProcessor.name}
                  </h3>
                  <div style={{
                    display: 'flex',
                    backgroundColor: 'var(--accent-color)',
                    padding: '5px',
                    margin: '10px 0',
                    gap: '5px',
                    borderRadius: '2px',
                    alignItems: 'center'
                  }}>
                    <i
                      className="bi bi-broadcast"
                      style={{ fontSize: 'medium' }}
                    />
                    <div style={{ fontSize: 'small' }}>{postProcessor.type}</div>
                  </div>
                </Card.Body>
              </Card>
            ))}
            <Card
              semantic="postprocessor"
              onClick={handleAddPostProcessor}
            >
              <Card.Body>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <i className="bi bi-plus-square" style={{ fontSize: 'xx-large', color: '#666' }} />
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
        </Card.Body>
      </Card>
    </Container>
  );
};

export default SettingsPage;
