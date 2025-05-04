import React, { useState, useEffect } from 'react';
import { Button, Form, Modal, Alert } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-xml';
import 'ace-builds/src-noconflict/theme-monokai';
import 'ace-builds/src-noconflict/ext-language_tools';
import 'ace-builds/webpack-resolver';

function ReportTemplateEditor() {
  const [show, setShow] = useState(false);
  const [template, setTemplate] = useState({
    name: '',
    jrxmlContent: '',
    reportType: 'employee_report',
    description: '',
    isActive: true
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const loadTemplate = async () => {
    try {
      const response = await fetch('/api/reports/employees/preview');
      if (!response.ok) throw new Error('Failed to load template');
      const content = await response.text();
      setTemplate(prev => ({ ...prev, jrxmlContent: content }));
    } catch (err) {
      setError('Failed to load template: ' + err.message);
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch('/api/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(template),
      });

      if (!response.ok) throw new Error('Failed to save template');
      
      setSuccess('Template saved successfully!');
      handleClose();
    } catch (err) {
      setError('Failed to save template: ' + err.message);
    }
  };

  useEffect(() => {
    if (show) {
      loadTemplate();
    }
  }, [show]);

  return (
    <>
      <Button variant="primary" onClick={handleShow}>
        Edit Report Design
      </Button>

      <Modal show={show} onHide={handleClose} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>Edit Report Template</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}
          
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Template Name</Form.Label>
              <Form.Control
                type="text"
                value={template.name}
                onChange={(e) => setTemplate({ ...template, name: e.target.value })}
                placeholder="Enter template name"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={template.description}
                onChange={(e) => setTemplate({ ...template, description: e.target.value })}
                placeholder="Enter template description"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>JRXML Content</Form.Label>
              <AceEditor
                mode="xml"
                theme="monokai"
                value={template.jrxmlContent}
                onChange={(value) => setTemplate({ ...template, jrxmlContent: value })}
                name="jrxmlEditor"
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
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Save Template
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default ReportTemplateEditor; 