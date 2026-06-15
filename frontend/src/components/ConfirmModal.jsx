import { useApp } from "../context/AppContext";

export default function ConfirmModal() {
  const { confirmModal, closeConfirm } = useApp();

  const handleConfirm = () => {
    if (typeof confirmModal.onConfirm === "function") confirmModal.onConfirm();
    closeConfirm();
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && closeConfirm()}>
      <div className="modal modal--confirm">
        <div className="modal-header">
          <h2 className="modal-title">Confirm</h2>
          <button className="modal-close" onClick={closeConfirm} aria-label="Close">✕</button>
        </div>
        <div className="modal-body">
          <p className="confirm-message">{confirmModal.message}</p>
        </div>
        <div className="modal-footer modal-footer--right">
          <button className="btn btn--ghost" onClick={closeConfirm}>Cancel</button>
          <button className="btn btn--danger" onClick={handleConfirm}>Confirm</button>
        </div>
      </div>
    </div>
  );
}
