import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, Row, Col, Card } from 'react-bootstrap';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { SketchPicker } from 'react-color';

const DraggableElement = ({ id, type, children, onDrop }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'element',
    item: { id, type },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={drag}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: 'move',
        padding: '10px',
        margin: '5px',
        border: '1px dashed #ccc',
        backgroundColor: '#f8f9fa',
      }}
    >
      {children}
    </div>
  );
};

const DroppableArea = ({ onDrop, children }) => {
  const [{ isOver }, drop] = useDrop({
    accept: 'element',
    drop: (item) => onDrop(item),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <div
      ref={drop}
      style={{
        minHeight: '200px',
        border: isOver ? '2px dashed #007bff' : '2px dashed #ccc',
        padding: '20px',
        margin: '10px',
        backgroundColor: isOver ? '#e9ecef' : '#fff',
      }}
    >
      {children}
    </div>
  );
};

function ReportVisualEditor() {
  const [show, setShow] = useState(false);
  const [designContent, setDesignContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [selectedElement, setSelectedElement] = useState(null);
  const [styleSettings, setStyleSettings] = useState({
    backgroundColor: '#ffffff',
    textColor: '#000000',
    fontSize: '12px',
    fontFamily: 'Arial',
    borderColor: '#000000',
    borderWidth: '1px',
  });

  const handleShow = () => {
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
          alert("Design saved successfully!");
          handleClose();
        } else {
          throw new Error("Failed to save design");
        }
      })
      .catch((err) => alert("Failed to save design: " + err))
      .finally(() => setSaving(false));
  };

  const handleStyleChange = (property, value) => {
    setStyleSettings(prev => ({
      ...prev,
      [property]: value
    }));
  };

  const handleDrop = (item) => {
    // Update the design content with the new element
    const newElement = `<${item.type} style="background-color: ${styleSettings.backgroundColor}; color: ${styleSettings.textColor}; font-size: ${styleSettings.fontSize}; font-family: ${styleSettings.fontFamily}; border: ${styleSettings.borderWidth} solid ${styleSettings.borderColor};">New ${item.type}</${item.type}>`;
    setDesignContent(prev => prev + newElement);
  };

  return (
    <>
      <Button variant="primary" onClick={handleShow}>
        Visual Editor
      </Button>

      <Modal show={show} onHide={handleClose} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>Visual Report Editor</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <DndProvider backend={HTML5Backend}>
            <Row>
              <Col md={3}>
                <Card>
                  <Card.Header>Elements</Card.Header>
                  <Card.Body>
                    <DraggableElement id="1" type="textField">
                      Text Field
                    </DraggableElement>
                    <DraggableElement id="2" type="staticText">
                      Static Text
                    </DraggableElement>
                    <DraggableElement id="3" type="line">
                      Line
                    </DraggableElement>
                  </Card.Body>
                </Card>
                <Card className="mt-3">
                  <Card.Header>Style Settings</Card.Header>
                  <Card.Body>
                    <Form.Group className="mb-3">
                      <Form.Label>Background Color</Form.Label>
                      <SketchPicker
                        color={styleSettings.backgroundColor}
                        onChangeComplete={(color) => handleStyleChange('backgroundColor', color.hex)}
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Text Color</Form.Label>
                      <SketchPicker
                        color={styleSettings.textColor}
                        onChangeComplete={(color) => handleStyleChange('textColor', color.hex)}
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Font Size</Form.Label>
                      <Form.Select
                        value={styleSettings.fontSize}
                        onChange={(e) => handleStyleChange('fontSize', e.target.value)}
                      >
                        <option value="10px">10px</option>
                        <option value="12px">12px</option>
                        <option value="14px">14px</option>
                        <option value="16px">16px</option>
                        <option value="18px">18px</option>
                      </Form.Select>
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Font Family</Form.Label>
                      <Form.Select
                        value={styleSettings.fontFamily}
                        onChange={(e) => handleStyleChange('fontFamily', e.target.value)}
                      >
                        <option value="Arial">Arial</option>
                        <option value="Times New Roman">Times New Roman</option>
                        <option value="Helvetica">Helvetica</option>
                        <option value="Verdana">Verdana</option>
                      </Form.Select>
                    </Form.Group>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={9}>
                <DroppableArea onDrop={handleDrop}>
                  <div dangerouslySetInnerHTML={{ __html: designContent }} />
                </DroppableArea>
              </Col>
            </Row>
          </DndProvider>
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

export default ReportVisualEditor; 