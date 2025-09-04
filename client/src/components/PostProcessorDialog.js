import { Fragment, useEffect, useState } from "react";
import { getErrorResponse, showToast } from "../utils/utils";
import DialogBase from "./DialogBase";

function PostProcessorDialog({editingItem, onClose, onRefreshPostProcessors}) {
  const [postProcessor, setPostProcessor] = useState(null);
  const [postProcessorData, setPostProcessorData] = useState(null);
  const [message, setMessage] = useState(null);
  const [isVariablesDialogOpen, setIsVariablesDialogOpen] = useState(false);
  const postProcessorTypes = [
    'webhook',
  ];

  const [selectedTemplate, setSelectedTemplate] = useState('');
  const templates = {
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
    // More templates (eg Pushbullet, etc) can be added here as requested
  };

  useEffect(() => {
    if (editingItem) {
      const copy = JSON.parse(JSON.stringify(editingItem)); // Create deep copy of editingItem
      setPostProcessor(copy);

      // The UI handles headers as [{name, value}] instead of an object like 'fetch' uses
      const parsedData = JSON.parse(copy.data);
      setPostProcessorData({
        ...parsedData,
        headers: Object.entries(parsedData.headers || {}).map(([name, value]) => ({ name, value })),
      });
    }
    else {
      setPostProcessor(null);
      setPostProcessorData(null);
      setMessage(null);
    }
  }, [editingItem]);

  const applyTemplate = (templateName) => {
    if (!templateName)
      return;

    const templateData = templates[templateName];

    setPostProcessor({
      ...postProcessor, //Expanding this allows us to keep the id & name (if we're editing an already-existing post processor)
      type: templateData.type,
      target: templateData.target,
    });

    setPostProcessorData({
      ...templateData.data,
      headers: Object.entries(templateData.data.headers || {}).map(([name, value]) => ({ name, value })),
    });
  };

  const constructFinalWebhook = () => {
    const data = {
      ...postProcessorData,
      // The UI handles headers as [{name, value}] instead of an object like 'fetch' uses
      headers: postProcessorData.headers.reduce((obj, { name, value }) => {
        const key = name?.trim();
        if (key) 
          obj[key] = value?.trim?.() ?? value;
        
        return obj;
      }, {})
    };

    return {
      ...postProcessor,
      data: JSON.stringify(data),
    };
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/postprocessors/${postProcessor.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error(await getErrorResponse(res));
      }
      
      showToast(`Deleted post processor '${postProcessor.name}'`, 'success');
      onRefreshPostProcessors();
      onClose();
    }
    catch (err) {
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
    }
    catch (err) {
      console.error(err);
      showToast(`Test failed: ${err}`, 'error');
    }
  };

  const handleCancel = () => {
    onClose();
  };

  const handleSave = async () => {
    if (!postProcessor.name) {
      setMessage('Please provide a name for your post processor');
      return;
    }

    if (!postProcessor.target) {
      setMessage('Post processor target (URL/process) cannot be empty');
      return;
    }

    if (postProcessorData.body) {
      try {
        JSON.parse(postProcessorData.body); // Validate the body is valid json
      }
      catch (err) {
        setMessage(`Invalid JSON Body: ${err.message}`);
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
    }
    catch (err) {
      console.error(err);
      showToast(`Error saving post processor: ${err}`, 'error');
    }
  };

  return (
    <div>
      <DialogBase isOpen={postProcessor !== null} onClose={() => handleCancel()} title={`Edit Post Processor: ${postProcessor?.name || 'New'}`}
        buttons={
        <>
          <button onClick={() => handleDelete()} style={{backgroundColor: 'var(--danger-color)', fontSize: 'medium', padding: '6px 16px', borderRadius: 4, marginRight: 'auto'}}>Delete</button>
          <button onClick={() => handleTest()} style={{backgroundColor: '#393f45', fontSize: 'medium', padding: '6px 16px', borderRadius: 4, marginLeft: 10}}>Test</button>
          <button onClick={() => handleCancel()} style={{backgroundColor: '#393f45', fontSize: 'medium', padding: '6px 16px', borderRadius: 4, marginLeft: 10}}>Cancel</button>
          <button onClick={() => handleSave()} style={{backgroundColor: 'var(--success-color)', fontSize: 'medium', padding: '6px 16px', borderRadius: 4, marginLeft: 10}}>Save</button>
        </>}
      >
        <div className='setting flex-column-mobile'>
          <div style={{minWidth: 175}}>Name</div>
          <input type="text"
            value={postProcessor?.name}
            onChange={e => setPostProcessor({...postProcessor, name: e.target.value})}
          />
        </div>
        <div className='setting flex-column-mobile'>
          <div style={{minWidth: 175}}>Apply template</div>
          <div style={{display: 'flex', width: '100%'}}>
            <select
              style={{marginTop: 0}}
              value={selectedTemplate}
              onChange={e => setSelectedTemplate(e.target.value)}>
              {[''].concat(Object.keys(templates)).map(template =>
                <option key={template} value={template}>{template}</option>
              )}
            </select>
            <button style={{backgroundColor: 'cornflowerblue', marginLeft: 10, borderRadius: 5, width: 40}}
              onClick={() => applyTemplate(selectedTemplate)}>
              <i style={{fontSize: 'x-large'}} className="bi bi-check"/>
            </button>
          </div>
        </div>
        <div className='setting flex-column-mobile'>
          <div style={{minWidth: 175}}>Type</div>
          <select
            value={postProcessor?.type}
            onChange={e => setPostProcessor({...postProcessor, type: e.target.value})}>
            {postProcessorTypes.map(type =>
              <option key={type} value={type}>{type}</option>
            )}
          </select>
        </div>
        <div className='setting flex-column-mobile'>
          <div style={{minWidth: 175}}>{postProcessor?.type === 'webhook' ? 'URL' : 'File path'}</div>
          <input type="text"
            value={postProcessor?.target}
            onChange={e => setPostProcessor({...postProcessor, target: e.target.value})}
          />
        </div>
        <PostProcessorDataUI 
          postProcessorData={postProcessorData}
          type={postProcessor?.type}
          updateData={val => setPostProcessorData(val)}
          showVariablesDialog={() => setIsVariablesDialogOpen(true)}/>
        {message && (
          <p style={{ marginTop: 10, marginBottom: 0, color: 'var(--danger-color)' }}>
            {message}{/* Todo: this message might be off the screen for mobile or small screens (if the dialog body is scrolled up) */}
          </p>
        )}
      </DialogBase>
      <VariablesDialog isOpen={isVariablesDialogOpen} onClose={() => setIsVariablesDialogOpen(false)}/>
    </div>
  );
}

function PostProcessorDataUI({ postProcessorData, type, updateData, showVariablesDialog }) {

  if (!postProcessorData)
    return null;

  return (
    <>
      <div className='setting flex-column-mobile'>
        <div style={{minWidth: 175}}>Method</div>
        <select
          value={postProcessorData.method}
          onChange={e => updateData({...postProcessorData, method: e.target.value})}>
          {['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map(type =>
            <option key={type} value={type}>{type}</option>
          )}
        </select>
      </div>
      <div className='setting flex-column-mobile'>
        <div style={{minWidth: 175}}>Headers</div>
        <div style={{display: 'flex', flexDirection: 'column', width: '100%', alignItems: 'end'}}>
          {postProcessorData.headers?.map((header, index) =>
            <div className='pairedInput' key={index} style={{display: 'flex', width: '100%'}}>
              <input type='text' value={header.name}
                onChange={e => updateData({...postProcessorData, headers: postProcessorData.headers.map((h, i) => i === index ? {name: e.target.value, value: h.value} : h)})}/>
              <input type='text' value={header.value}
                onChange={e => updateData({...postProcessorData, headers: postProcessorData.headers.map((h, i) => i === index ? {name: h.name, value: e.target.value} : h)})}/>
              <button style={{backgroundColor: 'var(--danger-color)', borderRadius: 5, width: 40, margin: '5px 0px 5px 5px'}}
                onClick={() => updateData({...postProcessorData, headers: postProcessorData.headers.filter((h, i) => i !== index)})}>
                <i style={{fontSize: 'x-large'}} className="bi bi-dash"/>
              </button>
            </div>
          )}
          <button style={{backgroundColor: 'cornflowerblue', borderRadius: 5, width: 40}}
            onClick={() => updateData({...postProcessorData, headers: [...(postProcessorData.headers ?? []), {}]})}>
            <i style={{fontSize: 'x-large'}} className="bi bi-plus"/>
          </button>
        </div>
      </div>
      <div className='setting flex-column-mobile'>
        <div style={{minWidth: 175}}>Body</div>
        <div style={{display: 'flex', flexDirection: 'column', width: '100%', alignItems: 'end'}}>
          <textarea style={{resize: 'vertical', width: 'calc(100% - 18px)', minHeight: 125}}
            value={postProcessorData.body}
            onChange={e => updateData({...postProcessorData, body: e.target.value})}
          />
          <button style={{fontFamily: '"Caveat", cursive', fontSize: 'large'}} onClick={() => showVariablesDialog()}>
            <div>f(x)</div>
          </button>
        </div>
      </div>
    </>
  );
}

function VariablesDialog({isOpen, onClose}) {
  const possibleVariables = [ // Todo: might want to support more variables (eg a version of 'published_at' that is human-readable)
    ['[[video.title]]', 'Video title'],
    ['[[video.thumbnail]]', 'Video thumbnail url'],
    ['[[video.video_id]]', 'Video YouTube id'],
    ['[[video.published_at]]', 'Video published timestamp (ISO 8601)'],
    ['[[playlist.title]]', 'Title of source playlist'],
  ]

  return (
    <DialogBase dialogStyle={{width: 400}} childrenStyle={{padding: 10}} isOpen={isOpen} onClose={onClose} title='Variables'>
      <p style={{fontStyle: 'italic'}}>You can use the following variables in the url, path, args, and body of your post-processor to include information about the new video</p>
      <div style={{display: 'grid', gridTemplateColumns: 'auto auto', columnGap: 30}}>
        {possibleVariables.map((pair, i) =>
          <Fragment key={i}>
            <p style={{margin: '10px 0px'}}>{pair[0]}</p>
            <p style={{margin: '10px 0px'}}>{pair[1]}</p>
          </Fragment>
        )}
      </div>
    </DialogBase>
  );
}

export default PostProcessorDialog;