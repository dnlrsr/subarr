import { useEffect, useState } from 'react';

function SettingsPage() {
  const [ytsubsApiKey, setYtsubsApiKey] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        setYtsubsApiKey(data.ytsubs_apikey ?? '');
        setWebhookUrl(data.webhook_url ?? '');
      })
      .catch(err => {
        console.error('Failed to fetch settings', err);
      });
  }, []);

  const handleSave = async () => {
    if (!webhookUrl.startsWith('https://discord.com/api/webhooks/')) {
      setMessage('Invalid webhook URL');
      return;
    }
  
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([{
          key: 'webhook_url',
          value: webhookUrl,
        },
        {
          key: 'ytsubs_apikey',
          value: ytsubsApiKey,
        }]),
      });
  
      if (!res.ok) throw new Error('Failed to save settings');
      setMessage('Saved settings'); //Todo: use a notification toast (or maybe something more sonarr-like) instead of alert
    } catch (err) {
      console.error(err);
      setMessage('Error saving settings'); //Todo: use a notification toast (or maybe something more sonarr-like) instead of alert
    }
  };  

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', padding: '0px 20px', gap: 10, marginRight: 20, backgroundColor: '#262626', height: 60 }}>
        {/* Todo: highlight button icon on color (maybe not red though?) */}
        <button
          onClick={handleSave}
          title="Save Settings"
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            fontSize: '1.5rem',
            cursor: 'pointer'
          }}
        >
          <i className="bi bi-floppy-fill"></i>
          <div style={{fontSize: 'small'}}>Save</div>
        </button>
      </div>
      <div style={{padding: 30}}>
        <div className='setting'>
          <div style={{minWidth: 175}}>YTSubs.app API key</div>
          <input type="text"
            value={ytsubsApiKey}
            onChange={e => setYtsubsApiKey(e.target.value)}
          />
        </div>
        <div className='setting'>
          <div style={{minWidth: 175}}>Discord Webhook URL</div>
          <input type="text"
            value={webhookUrl}
            onChange={e => setWebhookUrl(e.target.value)}
          />
        </div>

        <br />
        {message && (
          <p style={{ marginTop: '10px', color: message.includes('Invalid') ? 'red' : 'lightgreen' }}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

export default SettingsPage;