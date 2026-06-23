import { ScadEditor } from "./ScadEditor";

type CodeEditorModalProps = {
  open: boolean;

  value: string;

  onChange: (value: string) => void;

  onSave: () => void;

  onClose: () => void;
};

export function CodeEditorModal({
  open,
  value,
  onChange,
  onSave,
  onClose
}: CodeEditorModalProps) {

  if (!open) {
    return null;
  }

  return (

    <div className="modal-overlay">

      <div className="code-editor-modal">

        <div className="modal-header">

          <h2>Code</h2>

          <button onClick={onClose}>
            ✕
          </button>

        </div>

        <div className="modal-body">

          <div className="scad-editor-shell">
            <ScadEditor value={value} onChange={onChange} />
          </div>

        </div>

        <div className="modal-footer">

          <div className="footer-left">

            <button>
              {"</>"}
            </button>

          </div>

          <div className="footer-right">

            <button>
              T
            </button>

            <button>
              ⧉
            </button>

            <button
              className="save-button"
              onClick={onSave}
            >
              Save
            </button>

          </div>

        </div>

      </div>

    </div>

  );
}