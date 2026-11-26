import { Modal } from '../ui.jsx';

function UnsavedChangesDialog({ onKeepEditing, onDiscard }) {
  return (
    <Modal title="Discard changes?" onClose={onKeepEditing}>
      <p className="modal-copy">
        You have unsaved changes. Leave without saving?
      </p>
      <div className="modal-actions">
        <button className="secondary" onClick={onKeepEditing}>
          Keep editing
        </button>
        <button className="danger" onClick={onDiscard}>
          Discard changes
        </button>
      </div>
    </Modal>
  );
}

export default UnsavedChangesDialog;
