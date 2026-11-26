import { Modal } from './ui.jsx';

function GlobalOverlays({ toast, confirmRequest, onDismissConfirm }) {
  return (
    <>
      {toast && (
        <div role="status" className="toast">
          ✓ {toast}
        </div>
      )}

      {confirmRequest && (
        <Modal
          title="Please confirm"
          onClose={onDismissConfirm}
        >
          <p className="modal-copy">{confirmRequest.message}</p>
          <div className="modal-actions">
            <button className="secondary" onClick={onDismissConfirm}>
              Keep
            </button>
            <button
              className="danger"
              onClick={() => {
                confirmRequest.onConfirm();
                onDismissConfirm();
              }}
            >
              Confirm
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}

export default GlobalOverlays;
