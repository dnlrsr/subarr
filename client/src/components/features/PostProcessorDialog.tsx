import React, { Fragment, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PostProcessor } from '../../types';
import { getErrorResponse, showToast } from '../../utils/utils';
import { Button, DialogBase, Input, Select } from '../ui';

interface PostProcessorData {
  method?: string;
  headers?: Array<{ name?: string; value?: string }>;
  body?: string;
}

interface Template {
  type: 'webhook';
  target: string;
  data: {
    method: string;
    headers: Record<string, string>;
    body: string;
  };
}

interface PostProcessorDialogProps {
  editingItem: PostProcessor | null;
  onClose: () => void;
  onRefreshPostProcessors: () => void;
}

interface PostProcessorDataUIProps {
  postProcessorData: PostProcessorData | null;
  updateData: (data: PostProcessorData) => void;
  showVariablesDialog: () => void;
}

interface VariablesDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const templates: Record<string, Template> = {
  'Discord': {
    type: 'webhook',
    target: 'YOUR_DISCORD_WEBHOOK_URL',
    data: {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: `{
  "username": "Subarr",
  "embeds": [{
    "title": "New Video: [[video.title]]",
    "url": "https://www.youtube.com/watch?v=[[video.video_id]]",
    "thumbnail": {
      "url": "[[video.thumbnail]]"
    },
    "timestamp": "[[video.published_at]]",
    "color": 16711680,
    "footer": {
      "text": "From playlist: [[playlist.title]]"
    }
  }]
}`
    },
  },
  'Raindrop.io': {
    type: 'webhook',
    target: 'https://api.raindrop.io/rest/v1/raindrop',
    data: {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer YOUR_INTEGRATION_TEST_TOKEN',
        'Content-Type': 'application/json'
      },
      body: `{
  "link": "https://www.youtube.com/watch?v=[[video.video_id]]",
  "title": "[[video.title]]",
  "cover": "[[video.thumbnail]]",
  "type": "video"
}`
    },
  },
  'yt-dlp-api': {
    type: 'webhook',
    target: 'YT_DLP_API_WEBHOOK_URL',
    data: {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_API_KEY'
      },
      body: `{
  "url": "https://www.youtube.com/watch?v=[[video.video_id]]",
}`
    },
  },
};

const PostProcessorDataUI: React.FC<PostProcessorDataUIProps> = ({ 
  postProcessorData, 
  updateData, 
  showVariablesDialog 
}) => {
  const { t } = useTranslation();
  
  if (!postProcessorData) {
    return null;
  }

  return (
    <>
      <div>
        <div>{t('common.method')}</div>
        <Select
          value={postProcessorData.method || 'GET'}
          onChange={e => updateData({ ...postProcessorData, method: e.target.value })}
          options={['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map(method => ({ value: method, label: method }))}
        />
      </div>
      <div>
        <div>{t('common.headers')}</div>
        <div>
          {postProcessorData.headers?.map((header, index) =>
            <div key={index}>
              <input 
                type='text' 
                value={header.name || ''}
                onChange={e => updateData({
                  ...postProcessorData, 
                  headers: postProcessorData.headers?.map((h, i) => 
                    i === index ? { name: e.target.value, value: h.value } : h
                  ) || []
                })}
              />
              <input 
                type='text' 
                value={header.value || ''}
                onChange={e => updateData({
                  ...postProcessorData, 
                  headers: postProcessorData.headers?.map((h, i) => 
                    i === index ? { name: h.name, value: e.target.value } : h
                  ) || []
                })}
              />
              <div>
                <Button 
                  variant="danger"
                  size="sm"
                  onClick={() => updateData({
                    ...postProcessorData, 
                    headers: postProcessorData.headers?.filter((_, i) => i !== index) || []
                  })}
                >
                  <i />
                </Button>
              </div>
            </div>
          )}
          <div>
            <Button 
              variant="primary"
              size="sm"
              onClick={() => updateData({
                ...postProcessorData, 
                headers: [...(postProcessorData.headers ?? []), { name: '', value: '' }]
              })}
            >
              <i />
            </Button>
          </div>
        </div>
      </div>
      <div>
        <div>{t('common.body')}</div>
        <div>
          <textarea 
            value={postProcessorData.body || ''}
            onChange={e => updateData({ ...postProcessorData, body: e.target.value })}
          />
          <div>
            <Button 
              variant="secondary"
              onClick={() => showVariablesDialog()}
            >
              f(x)
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

const VariablesDialog: React.FC<VariablesDialogProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const possibleVariables: Array<[string, string]> = [
    ['[[video.title]]', t('postProcessorDialog.variables.videoTitle')],
    ['[[video.thumbnail]]', t('postProcessorDialog.variables.videoThumbnail')],
    ['[[video.video_id]]', t('postProcessorDialog.variables.videoId')],
    ['[[video.published_at]]', t('postProcessorDialog.variables.videoPublishedAt')],
    ['[[playlist.title]]', t('postProcessorDialog.variables.playlistTitle')],
  ];

  return (
    <DialogBase 
      isOpen={isOpen} 
      onClose={onClose} 
      title={t('postProcessorDialog.variables.title')}
    >
      <p>
        {t('postProcessorDialog.variables.description')}
      </p>
      <div>
        {possibleVariables.map((pair, i) =>
          <Fragment key={i}>
            <p>{pair[0]}</p>
            <p>{pair[1]}</p>
          </Fragment>
        )}
      </div>
    </DialogBase>
  );
};

const PostProcessorDialog: React.FC<PostProcessorDialogProps> = ({
  editingItem,
  onClose,
  onRefreshPostProcessors
}) => {
  const { t } = useTranslation();
  const [postProcessor, setPostProcessor] = useState<PostProcessor | null>(null);
  const [postProcessorData, setPostProcessorData] = useState<PostProcessorData | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isVariablesDialogOpen, setIsVariablesDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  
  const postProcessorTypes: Array<'webhook'> = ['webhook'];

  useEffect(() => {
    if (editingItem) {
      const copy = JSON.parse(JSON.stringify(editingItem)); // Create deep copy of editingItem
      setPostProcessor(copy);

      // The UI handles headers as [{name, value}] instead of an object like 'fetch' uses
      const parsedData = JSON.parse(copy.data || '{}');
      setPostProcessorData({
        ...parsedData,
        headers: Object.entries(parsedData.headers || {}).map(([name, value]) => ({ name, value: String(value) })),
      });
    } else {
      setPostProcessor(null);
      setPostProcessorData(null);
      setMessage(null);
    }
  }, [editingItem]);

  const applyTemplate = (templateName: string) => {
    if (!templateName) {
      return;
    }

    const templateData = templates[templateName];

    setPostProcessor((prev) => ({
      id: prev?.id,
      name: templateName === 'yt-dlp-api' ? 'yt-dlp-api' : prev?.name || templateName,
      type: templateData.type,
      target: templateData.target,
      data: ''
    }));

    setPostProcessorData({
      ...templateData.data,
      headers: Object.entries(templateData.data.headers || {}).map(([name, value]) => ({ name, value })),
    });
  };

  const constructFinalWebhook = (): PostProcessor => {
    const data = {
      ...postProcessorData,
      // The UI handles headers as [{name, value}] instead of an object like 'fetch' uses
      headers: postProcessorData?.headers?.reduce((obj: Record<string, string>, { name, value }) => {
        const key = name?.trim();
        if (key) {
          obj[key] = value?.trim?.() ?? value ?? '';
        }
        return obj;
      }, {}) || {}
    };

    return {
      id: postProcessor?.id,
      name: postProcessor?.name || '',
      type: postProcessor?.type || 'webhook',
      target: postProcessor?.target || '',
      data: JSON.stringify(data),
    };
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/postprocessors/${postProcessor?.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error(await getErrorResponse(res));
      }
      
      showToast(`Deleted post processor '${postProcessor?.name}'`, 'success');
      onRefreshPostProcessors();
      onClose();
    } catch (err) {
      console.error(err);
      showToast(`Error deleting post processor: ${err}`, 'error'); 
    }

    onClose();
  };

  const handleTest = async () => {
    try {
      const res = await fetch('/api/postprocessors/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(constructFinalWebhook()),
      });
  
      if (!res.ok) {
        throw new Error(await getErrorResponse(res));
      }
      
      showToast('Test successful', 'success');
    } catch (err) {
      console.error(err);
      showToast(`Test failed: ${err}`, 'error');
    }
  };

  const handleCancel = () => {
    onClose();
  };

  const handleSave = async () => {
    if (!postProcessor?.name) {
      setMessage('Please provide a name for your post processor');
      return;
    }

    if (!postProcessor?.target) {
      setMessage('Post processor target (URL/process) cannot be empty');
      return;
    }

    if (postProcessorData?.body) {
      try {
        JSON.parse(postProcessorData.body); // Validate the body is valid json
      } catch (err) {
        setMessage(`Invalid JSON Body: ${(err as Error).message}`);
        return;
      }
    }

    try {
      // If postProcessor.id exists, that means this isn't a new post processor - so we should update (PUT) rather than create (POST)
      const res = await fetch(`/api/postprocessors${postProcessor.id ? `/${postProcessor.id}` : ''}`, {
        method: postProcessor.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(constructFinalWebhook()),
      });

      if (!res.ok) {
        throw new Error(await getErrorResponse(res));
      }
      
      showToast(`Saved post processor '${postProcessor.name}'`, 'success');
      onRefreshPostProcessors();
      onClose();
    } catch (err) {
      console.error(err);
      showToast(`Error saving post processor: ${err}`, 'error');
    }
  };

  return (
    <div>
      <DialogBase 
        isOpen={postProcessor !== null} 
        onClose={() => handleCancel()} 
        title={`Edit Post Processor: ${postProcessor?.name || 'New'}`}
        buttons={
          <>
            <div >
              <Button 
                variant="danger"
                onClick={() => handleDelete()} 
              >
                Delete
              </Button>
            </div>
            <div >
              <Button 
                variant="secondary"
                onClick={() => handleTest()} 
              >
                Test
              </Button>
            </div>
            <div >
              <Button 
                variant="secondary"
                onClick={() => handleCancel()} 
              >
                Cancel
              </Button>
            </div>
            <div >
              <Button 
                variant="success"
                onClick={() => handleSave()} 
              >
                {t('common.save')}
              </Button>
            </div>
          </>
        }
      >
        <div>
          <div>{t('common.name')}</div>
          <Input 
            type="text"
            value={postProcessor?.name || ''}
            onChange={e => setPostProcessor(prev => prev ? { ...prev, name: e.target.value } : null)}
            disabled={postProcessor?.name === 'yt-dlp-api'} // Prevent renaming the built-in yt-dlp-api processor
          />
          {postProcessor?.name === 'yt-dlp-api' && <p>{t('common.immutable')}</p>}
          <p></p>
        </div>
        <div>
          <div>{t('postProcessorDialog.applyTemplate')}</div>
          <div>
            <div>
              <Select
                value={selectedTemplate}
                onChange={e => setSelectedTemplate(e.target.value)}
                options={[''].concat(Object.keys(templates)).map(template => ({ 
                  value: template, 
                  label: template || 'Select template...' 
                }))}
              />
            </div>
            <div>
              <Button 
                variant="primary"
                onClick={() => applyTemplate(selectedTemplate)}
              >
                <i />
              </Button>
            </div>
          </div>
        </div>
        <div>
          <div>{t('common.type')}</div>
          <Select
            value={postProcessor?.type || 'webhook'}
            onChange={e => setPostProcessor(prev => prev ? { ...prev, type: e.target.value as 'webhook' } : null)}
            options={postProcessorTypes.map(type => ({ value: type, label: type }))}
          />
        </div>
        <div>
          <div>
            {t('postProcessorDialog.url')}
          </div>
          <Input 
            type="text"
            value={postProcessor?.target || ''}
            onChange={e => setPostProcessor(prev => prev ? { ...prev, target: e.target.value } : null)}
          />
        </div>
        <PostProcessorDataUI 
          postProcessorData={postProcessorData}
          updateData={val => setPostProcessorData(val)}
          showVariablesDialog={() => setIsVariablesDialogOpen(true)}
        />
        {message && (
          <p >
            {message}
          </p>
        )}
      </DialogBase>
      <VariablesDialog isOpen={isVariablesDialogOpen} onClose={() => setIsVariablesDialogOpen(false)} />
    </div>
  );
};

export default PostProcessorDialog;
