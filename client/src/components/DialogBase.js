function DialogBase({isOpen, onClose, title, children, buttons, dialogStyle, childrenStyle}) {
  // Todo: this currently still allows the user to interact with the app outside of the dialog
  return (
    <dialog open={isOpen} onClose={onClose}
      style={{width: 'min(720px, 100vw - 20px)', maxHeight: '90vh', borderRadius: 6, padding: 0, borderWidth: 1, color: 'inherit', overflow: 'hidden',
              position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', ...dialogStyle}}>
      <div style={{display: 'flex', flexDirection: 'column', backgroundColor: '#2a2a2a', width: '100%', height: '100%', maxHeight: 'inherit'}}>
        <button style={{position: 'absolute', top: 0, right: 0, width: 60, height: 60}} onClick={onClose}>
          <i style={{fontSize: 'xx-large'}} className="bi bi-x"/>
        </button>
        <h3 style={{padding: '15px 50px 15px 30px', borderBottom: '1px solid grey', margin: 0}}>
          {title}
        </h3>
        <div style={{padding: 30, flex: 1, overflowY: 'auto', minHeight: 0, ...childrenStyle}}>
          {children}
        </div>
        {buttons ?
        <div style={{padding: '15px 30px', display: 'flex'}}>
          {buttons}
        </div>
        : null}
      </div>
    </dialog>
  );
}

export default DialogBase;