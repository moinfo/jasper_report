import React, { useState } from 'react';
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-xml";
import "ace-builds/src-noconflict/theme-monokai";
import "ace-builds/src-noconflict/ext-language_tools";
import "ace-builds/webpack-resolver";
import { Button, Modal } from 'react-bootstrap';

function ReportTemplateEditor() {
  const [show, setShow] = useState(false);
  const [designContent, setDesignContent] = useState("");
  const [saving, setSaving] = useState(false);

  const handleShow = () => {
    // Fetch the current design when opening the modal
    fetch("/api/reports/employees/preview", {
      method: "GET",
    })
      .then((response) => response.text())
      .then((content) => {
        setDesignContent(content);
        setShow(true);
      })
      .catch((err) => alert("Failed to load design: " + err));
  };

  const handleClose = () => setShow(false);

  const handleSave = () => {
    setSaving(true);
    fetch("/api/reports/employees/design", {
      method: "POST",
      headers: {
        "Content-Type": "text/plain",
      },
      body: designContent,
    })
      .then((response) => {
        if (response.ok) {
          alert("Design updated successfully!");
          handleClose();
        } else {
          throw new Error("Failed to update design");
        }
      })
      .catch((err) => alert("Failed to update design: " + err))
      .finally(() => setSaving(false));
  };

  return (
    <>
      <Button variant="primary" onClick={handleShow}>
        Edit Report Design
      </Button>

      <Modal show={show} onHide={handleClose} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>Edit Report Design</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <AceEditor
            mode="xml"
            theme="monokai"
            value={designContent}
            onChange={setDesignContent}
            name="designEditor"
            editorProps={{ $blockScrolling: true }}
            width="100%"
            height="500px"
            fontSize={14}
            showPrintMargin={true}
            showGutter={true}
            highlightActiveLine={true}
            setOptions={{
              enableBasicAutocompletion: true,
              enableLiveAutocompletion: true,
              enableSnippets: true,
              showLineNumbers: true,
              tabSize: 2,
              useWorker: false
            }}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Design"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default ReportTemplateEditor; 