import { useEffect, useState } from 'react';

function SettingsPage() {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.webhook_url) {
          setWebhookUrl(data.webhook_url);
        }
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
        body: JSON.stringify({
          key: 'webhook_url',
          value: webhookUrl,
        }),
      });
  
      if (!res.ok) throw new Error('Failed to save settings');
      setMessage('Webhook URL saved!');
    } catch (err) {
      console.error(err);
      setMessage('Error saving webhook URL');
    }
  };  

  return (
    <div style={{ padding: '20px' }}>
      <h2>App Settings</h2>

      <label>
        Discord Webhook URL:
        <br />
        <input
          type="text"
          value={webhookUrl}
          onChange={e => setWebhookUrl(e.target.value)}
          style={{ width: '100%', maxWidth: '600px', padding: '8px', marginTop: '6px' }}
        />
      </label>

      <br />
      <button onClick={handleSave} style={{ marginTop: '10px' }}>
        Save
      </button>

      {message && (
        <p style={{ marginTop: '10px', color: message.includes('Invalid') ? 'red' : 'lightgreen' }}>
          {message}
        </p>
      )}
    </div>
  );
}

export default SettingsPage;