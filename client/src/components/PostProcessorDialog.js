import { Fragment, useEffect, useRef, useState } from "react";
import { getErrorResponse } from "../utils/fetchUtils";

function PostProcessorDialog({editingItem, onClose, onRefreshPostProcessors}) {
  const [postProcessor, setPostProcessor] = useState(null);
  const [postProcessorData, setPostProcessorData] = useState(null);
  const [message, setMessage] = useState(null);
  const [isVariablesDialogOpen, setIsVariablesDialogOpen] = useState(false);
  const postProcessorTypes = [
    'webhook',
    // 'process', // Todo: support 'process'
  ];

  useEffect(() => {
    console.log('editingItem:', editingItem)
    if (editingItem) {
      const copy = JSON.parse(JSON.stringify(editingItem)); // Create deep copy of editingItem
      setPostProcessor(copy);

      // The UI handles headers as [{name, value}] instead of an object like 'fetch' uses
      const parsedData = JSON.parse(copy.data);
      setPostProcessorData({
        ...parsedData,
        headers: Object.entries(parsedData.headers || {}).map(([name, value]) => ({ name, value })),
      });

      dialogRef.current?.showModal();
    }
    else {
      setPostProcessor(null);
      setPostProcessorData(null);
      setMessage(null);
      dialogRef.current?.close();
    }
  }, [editingItem]);

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
      
      alert(`Deleted post processor '${postProcessor.name}'`); //Todo: use a notification toast (or maybe something more sonarr-like) instead of alert
      onRefreshPostProcessors();
      onClose();
    }
    catch (err) {
      console.error(err);
      alert(`Error deleting post processor: ${err}`); //Todo: use a notification toast (or maybe something more sonarr-like) instead of alert
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
      
      alert('Test successful'); //Todo: use a notification toast (or maybe something more sonarr-like) instead of alert
    }
    catch (err) {
      console.error(err);
      alert(`Test failed: ${err}`); //Todo: use a notification toast (or maybe something more sonarr-like) instead of alert
    }
  };

  const handleCancel = () => {
    onClose();
  };

  const handleSave = async () => {
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
      
      alert(`Saved post processor '${postProcessor.name}'`); //Todo: use a notification toast (or maybe something more sonarr-like) instead of alert
      onRefreshPostProcessors();
      onClose();
    }
    catch (err) {
      console.error(err);
      alert(`Error saving post processor: ${err}`); //Todo: use a notification toast (or maybe something more sonarr-like) instead of alert
    }
  };

  const dialogRef = useRef();

  return (
    <dialog ref={dialogRef} style={{width: 720 /* Todo: need mobile sizing */, borderRadius: 6, padding: 0, borderWidth: 1, maxHeight: '90%', color: 'inherit', overflow: 'hidden'}}>
      {/* Todo: have a "template" selector (that can auto-populate for things like Discord, Pushbullet, etc) */}
      <div style={{display: 'flex', flexDirection: 'column', backgroundColor: '#2a2a2a', width: '100%'}}>
        <button style={{position: 'absolute', top: 0, right: 0, width: 60, height: 60}} onClick={() => handleCancel()}>
          <i style={{fontSize: 'xx-large'}} className="bi bi-x"/>
        </button>
        <h3 style={{padding: '15px 50px 15px 30px', borderBottom: '1px solid grey', margin: 0}}>Edit Post Processor: {postProcessor?.name || 'New'}</h3>
        <div style={{padding: 30, flex: 1}}>{/* Todo: scrollable */}
          <div className='setting' /* Todo: might want to use a slightly different styling here */>
            <div style={{minWidth: 175}}>Name</div>
            <input type="text"
              value={postProcessor?.name}
              onChange={e => setPostProcessor({...postProcessor, name: e.target.value})}
            />
          </div>
          <div className='setting' /* Todo: might want to use a slightly different styling here */>
            <div style={{minWidth: 175}}>Type</div>
            <div>
              <select
                value={postProcessor?.type}
                onChange={e => setPostProcessor({...postProcessor, type: e.target.value})}>
                {postProcessorTypes.map(type =>
                  <option key={type} value={type}>{type}</option>
                )}
              </select>
              <div style={{fontSize: 'small', color: 'yellow', marginTop: 5, fontStyle: 'italic'}}>*Only webhook is supported for now - processes (like yt-dlp) will be supported later</div>
            </div>
          </div>
          <div className='setting' /* Todo: might want to use a slightly different styling here */>
            <div style={{minWidth: 175}}>{postProcessor?.type === 'webhook' ? 'URL' : 'File path'}</div>
            <input type="text"
              value={postProcessor?.target}
              onChange={e => setPostProcessor({...postProcessor, target: e.target.value})}
            />
          </div>
          {postProcessorData ?
          <>
            <div className='setting' /* Todo: might want to use a slightly different styling here */>
              <div style={{minWidth: 175}}>Method</div>
              <select
                value={postProcessorData.method}
                onChange={e => setPostProcessorData({...postProcessorData, method: e.target.value})}>
                {['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map(type =>
                  <option key={type} value={type}>{type}</option>
                )}
              </select>
            </div>
            <div className='setting' /* Todo: might want to use a slightly different styling here */>
              <div style={{minWidth: 175}}>Headers</div>
              <div style={{display: 'flex', flexDirection: 'column', width: '100%', alignItems: 'end'}}>
                {postProcessorData.headers?.map((header, index) =>
                  <div key={index} style={{display: 'flex', width: '100%'}}>
                    <input type='text' style={{borderRadius: '4px 0px 0px 4px', marginTop: 0 /* Todo: handle in CSS */}}
                      value={header.name}
                      onChange={e => setPostProcessorData({...postProcessorData, headers: postProcessorData.headers.map((h, i) => i === index ? {name: e.target.value, value: h.value} : h)})}/>
                    <input type='text' style={{borderRadius: '0px 4px 4px 0px', marginTop: 0 /* Todo: handle in CSS */}}
                      value={header.value}
                      onChange={e => setPostProcessorData({...postProcessorData, headers: postProcessorData.headers.map((h, i) => i === index ? {name: h.name, value: e.target.value} : h)})}/>
                    <button style={{backgroundColor: '#f04b4b', borderRadius: 5, width: 40, margin: '5px 0px 5px 5px'}}
                      onClick={() => setPostProcessorData({...postProcessorData, headers: postProcessorData.headers.filter((h, i) => i !== index)})}>
                      <i style={{fontSize: 'x-large'}} className="bi bi-dash"/>
                    </button>
                  </div>
                )}
                <button style={{backgroundColor: 'green', borderRadius: 5, width: 40}}
                  onClick={() => setPostProcessorData({...postProcessorData, headers: [...(postProcessorData.headers ?? []), {}]})}>
                  <i style={{fontSize: 'x-large'}} className="bi bi-plus"/>
                </button>
              </div>
            </div>
            <div className='setting' /* Todo: might want to use a slightly different styling here */>
              <div style={{minWidth: 175}}>Body</div>
              <div style={{display: 'flex', flexDirection: 'column', width: '100%', alignItems: 'end'}}>
                <textarea style={{resize: 'vertical', width: 'calc(100% - 18px)', minHeight: 125}}
                  value={postProcessorData.body}
                  onChange={e => setPostProcessorData({...postProcessorData, body: e.target.value})}
                />
                <button style={{fontFamily: '"Caveat", cursive', fontSize: 'large'}} onClick={() => setIsVariablesDialogOpen(true)}>
                  <div>f(x)</div>
                </button>
              </div>
            </div>
          </>
          : null}
          {message && (
            <p style={{ marginTop: 10, marginBottom: 0, color: 'red' }}>
              {message}
            </p>
          )}
        </div>
        <div style={{padding: '15px 30px', display: 'flex'}}>
          {/* Todo: it looks like these buttons are inheriting "empty button" styles from elsewhere in the app - I should separate those with a class or something better*/}
          {/* Todo: need button hover indicator */}
          <button onClick={() => handleDelete()} style={{backgroundColor: '#f04b4b', fontSize: 'medium', padding: '6px 16px', borderRadius: 4, marginRight: 'auto'}}>Delete</button>
          <button onClick={() => handleTest()} style={{backgroundColor: '#393f45', fontSize: 'medium', padding: '6px 16px', borderRadius: 4, marginLeft: 10}}>Test</button>
          <button onClick={() => handleCancel()} style={{backgroundColor: '#393f45', fontSize: 'medium', padding: '6px 16px', borderRadius: 4, marginLeft: 10}}>Cancel</button>
          <button onClick={() => handleSave()} style={{backgroundColor: '#393f45', fontSize: 'medium', padding: '6px 16px', borderRadius: 4, marginLeft: 10}}>Save</button>
        </div>
      </div>
      <VariablesDialog isOpen={isVariablesDialogOpen} onClose={() => setIsVariablesDialogOpen(false)}/>
    </dialog>
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

  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.showModal();
    }
    else {
      dialogRef.current?.close();
    }
  }, [isOpen]);

  const dialogRef = useRef();

  return (
    <dialog ref={dialogRef} style={{borderRadius: 6, padding: 0, borderWidth: 1, color: 'inherit', overflow: 'hidden', width: 400}}>
      <div style={{display: 'flex', flexDirection: 'column', padding: 10, backgroundColor: '#2a2a2a', width: 'calc(100% - 20px)'}}>
        <button style={{position: 'absolute', top: 0, right: 0, marginRight: 5, width: 30, height: 30}} onClick={() => onClose()}>
          <i style={{fontSize: 'xx-large'}} className="bi bi-x"/>
        </button>
        <h3 style={{padding: 5, borderBottom: '1px solid grey', margin: 0}}>Variables</h3>
        <p style={{fontStyle: 'italic'}}>You can use the following variables in the URL and Body of your post-processor to include information about the new video</p>
        <div style={{display: 'grid', gridTemplateColumns: 'auto auto', columnGap: 30}}>
          {possibleVariables.map((pair, i) =>
            <Fragment key={i}>
              <p style={{margin: '10px 0px'}}>{pair[0]}</p>
              <p style={{margin: '10px 0px'}}>{pair[1]}</p>
            </Fragment>
          )}
        </div>
      </div>
    </dialog>
  );
}

export default PostProcessorDialog;