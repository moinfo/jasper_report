import React, { useState, useCallback } from 'react';
import { Button, Modal, Form, Row, Col, Card } from 'react-bootstrap';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { SketchPicker } from 'react-color';
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-xml';
import 'ace-builds/src-noconflict/theme-github';
import { Rnd } from 'react-rnd';
import { XMLParser } from 'fast-xml-parser';

const BAND_NAMES = ['title', 'pageHeader', 'columnHeader', 'detail', 'columnFooter', 'pageFooter', 'summary'];
const ELEMENT_TYPES = [
  { type: 'staticText', label: 'Static Text' },
  { type: 'textField', label: 'Text Field' },
  { type: 'line', label: 'Line' },
  { type: 'image', label: 'Image' },
];

// Helper to parse JRXML and extract elements from all bands
const parseJrxml = (jrxml) => {
  const parser = new XMLParser();
  const result = parser.parse(jrxml);
  const bands = {};
  BAND_NAMES.forEach(bandName => {
    const bandData = result['jasperReport']?.[bandName];
    if (bandData) {
      const bandArr = Array.isArray(bandData) ? bandData : [bandData];
      bands[bandName] = bandArr.map((band, bandIdx) => {
        const bandContent = band.band || band;
        let elements = [];
        if (!bandContent) return { elements: [] };
        if (bandContent.staticText) {
          (Array.isArray(bandContent.staticText) ? bandContent.staticText : [bandContent.staticText]).forEach((el, idx) => {
            const text = el['text'] || '';
            const reportEl = el['reportElement']?.['@_'] || el['reportElement'] || {};
            elements.push({
              type: 'staticText',
              id: `${bandName}-staticText-${bandIdx}-${idx}`,
              x: parseInt(reportEl.x || 0),
              y: parseInt(reportEl.y || 0),
              width: parseInt(reportEl.width || 100),
              height: parseInt(reportEl.height || 30),
              text,
            });
          });
        }
        if (bandContent.textField) {
          (Array.isArray(bandContent.textField) ? bandContent.textField : [bandContent.textField]).forEach((el, idx) => {
            const text = el['textFieldExpression'] || '';
            const reportEl = el['reportElement']?.['@_'] || el['reportElement'] || {};
            elements.push({
              type: 'textField',
              id: `${bandName}-textField-${bandIdx}-${idx}`,
              x: parseInt(reportEl.x || 0),
              y: parseInt(reportEl.y || 0),
              width: parseInt(reportEl.width || 100),
              height: parseInt(reportEl.height || 30),
              text,
            });
          });
        }
        if (bandContent.line) {
          (Array.isArray(bandContent.line) ? bandContent.line : [bandContent.line]).forEach((el, idx) => {
            const reportEl = el['reportElement']?.['@_'] || el['reportElement'] || {};
            elements.push({
              type: 'line',
              id: `${bandName}-line-${bandIdx}-${idx}`,
              x: parseInt(reportEl.x || 0),
              y: parseInt(reportEl.y || 0),
              width: parseInt(reportEl.width || 100),
              height: parseInt(reportEl.height || 2),
            });
          });
        }
        if (bandContent.image) {
          (Array.isArray(bandContent.image) ? bandContent.image : [bandContent.image]).forEach((el, idx) => {
            const reportEl = el['reportElement']?.['@_'] || el['reportElement'] || {};
            const imageExpr = el['imageExpression'] || '';
            elements.push({
              type: 'image',
              id: `${bandName}-image-${bandIdx}-${idx}`,
              x: parseInt(reportEl.x || 0),
              y: parseInt(reportEl.y || 0),
              width: parseInt(reportEl.width || 100),
              height: parseInt(reportEl.height || 50),
              imageExpr,
            });
          });
        }
        return { elements };
      });
    }
  });
  return bands;
};

// Draggable sidebar element
const SidebarElement = ({ type, label }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'NEW_ELEMENT',
    item: { type },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }), [type]);
  return (
    <div
      ref={drag}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: 'move',
        padding: '10px',
        margin: '5px 0',
        border: '1px dashed #ccc',
        backgroundColor: '#f8f9fa',
        textAlign: 'center',
      }}
    >
      {label}
    </div>
  );
};

// Drop target for each band
const BandDropArea = ({ bandName, bandIdx, children, onDropElement }) => {
  const [{ isOver }, drop] = useDrop({
    accept: 'NEW_ELEMENT',
    drop: (item, monitor) => {
      const offset = monitor.getClientOffset();
      if (offset) {
        onDropElement(item.type, bandName, bandIdx, offset);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });
  return (
    <div
      ref={drop}
      style={{
        minHeight: 60,
        background: isOver ? '#e9ecef' : 'transparent',
        position: 'relative',
        borderBottom: '1px solid #eee',
        marginBottom: 0,
        padding: '8px 0',
      }}
    >
      {children}
    </div>
  );
};

function ReportVisualEditor() {
  const [show, setShow] = useState(false);
  const [designContent, setDesignContent] = useState("");
  const [bands, setBands] = useState({});
  const [loadingDesign, setLoadingDesign] = useState(false);
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
    setLoadingDesign(true);
    fetch("/api/reports/employees/preview", {
      method: "GET",
    })
      .then((response) => response.text())
      .then((content) => {
        setDesignContent(content);
        try {
          const parsedBands = parseJrxml(content);
          setBands(parsedBands);
        } catch (e) {
          setBands({});
        }
        setShow(true);
      })
      .catch((err) => alert("Failed to load design: " + err))
      .finally(() => setLoadingDesign(false));
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

  const handleElementDragStop = (bandName, bandIdx, elIdx, d) => {
    setBands(prev => {
      const newBands = { ...prev };
      newBands[bandName] = newBands[bandName].map((band, bIdx) => {
        if (bIdx !== bandIdx) return band;
        return {
          ...band,
          elements: band.elements.map((el, eIdx) => eIdx === elIdx ? { ...el, x: d.x, y: d.y } : el)
        };
      });
      return newBands;
    });
  };

  // Add new element to band on drop
  const handleDropElement = useCallback((type, bandName, bandIdx, offset) => {
    // Calculate drop position relative to the band area
    const bandDiv = document.getElementById(`band-${bandName}-${bandIdx}`);
    if (!bandDiv) return;
    const rect = bandDiv.getBoundingClientRect();
    const x = Math.round(offset.x - rect.left);
    const y = Math.round(offset.y - rect.top);
    setBands(prev => {
      const newBands = { ...prev };
      newBands[bandName] = newBands[bandName].map((band, bIdx) => {
        if (bIdx !== bandIdx) return band;
        const newElement = {
          type,
          id: `${bandName}-${type}-new-${Date.now()}`,
          x,
          y,
          width: type === 'line' ? 100 : 120,
          height: type === 'line' ? 2 : 30,
          text: type === 'staticText' ? 'Static Text' : (type === 'textField' ? '$F{field}' : ''),
          imageExpr: type === 'image' ? '[Image]' : undefined,
        };
        return {
          ...band,
          elements: [...band.elements, newElement],
        };
      });
      return newBands;
    });
  }, []);

  const BAND_LABELS = {
    title: 'Title',
    pageHeader: 'Page Header',
    columnHeader: 'Column Header',
    detail: 'Detail',
    columnFooter: 'Column Footer',
    pageFooter: 'Page Footer',
    summary: 'Summary',
  };

  return (
    <>
      <Button variant="primary" onClick={handleShow}>
        Visual Editor
      </Button>

      <Modal show={show} onHide={handleClose} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>Visual Report Editor (WYSIWYG - All Bands, Drag to Add)</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <DndProvider backend={HTML5Backend}>
            <Row>
              <Col md={3}>
                <Card>
                  <Card.Header>Elements</Card.Header>
                  <Card.Body>
                    {ELEMENT_TYPES.map((el) => (
                      <SidebarElement key={el.type} type={el.type} label={el.label} />
                    ))}
                  </Card.Body>
                </Card>
                <Card className="mt-3">
                  <Card.Header>Style Settings</Card.Header>
                  <Card.Body>
                    <Form.Group className="mb-3">
                      <Form.Label>Background Color</Form.Label>
                      <SketchPicker
                        color={styleSettings.backgroundColor}
                        onChangeComplete={(color) => setStyleSettings(s => ({ ...s, backgroundColor: color.hex }))}
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Text Color</Form.Label>
                      <SketchPicker
                        color={styleSettings.textColor}
                        onChangeComplete={(color) => setStyleSettings(s => ({ ...s, textColor: color.hex }))}
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Font Size</Form.Label>
                      <Form.Select
                        value={styleSettings.fontSize}
                        onChange={(e) => setStyleSettings(s => ({ ...s, fontSize: e.target.value }))}
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
                        onChange={(e) => setStyleSettings(s => ({ ...s, fontFamily: e.target.value }))}
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
                <div style={{
                  position: 'relative',
                  width: '800px',
                  minHeight: '600px',
                  border: '2px dashed #ccc',
                  background: '#fff',
                  overflow: 'auto',
                  padding: 0,
                }}>
                  {BAND_NAMES.map(bandName => (
                    bands[bandName] && bands[bandName].map((band, bandIdx) => (
                      <BandDropArea
                        key={bandName + '-' + bandIdx}
                        bandName={bandName}
                        bandIdx={bandIdx}
                        onDropElement={handleDropElement}
                      >
                        <div
                          id={`band-${bandName}-${bandIdx}`}
                          style={{ position: 'relative', minHeight: 60 }}
                        >
                          <div style={{ fontWeight: 'bold', fontSize: 13, color: '#888', marginBottom: 2 }}>{BAND_LABELS[bandName]}</div>
                          {band.elements.map((el, elIdx) => (
                            <Rnd
                              key={el.id}
                              size={{ width: el.width, height: el.height }}
                              position={{ x: el.x, y: el.y }}
                              onDragStop={(e, d) => handleElementDragStop(bandName, bandIdx, elIdx, d)}
                              bounds="parent"
                              style={{
                                border: '1px solid #007bff',
                                background: el.type === 'staticText' ? '#f8f9fa' : 'transparent',
                                color: styleSettings.textColor,
                                fontSize: styleSettings.fontSize,
                                fontFamily: styleSettings.fontFamily,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              {el.type === 'staticText' && <span>{el.text}</span>}
                              {el.type === 'textField' && <span>{el.text}</span>}
                              {el.type === 'line' && <div style={{ width: '100%', height: 2, background: '#000' }} />}
                              {el.type === 'image' && <div style={{ width: '100%', height: '100%', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>[Image]</div>}
                            </Rnd>
                          ))}
                        </div>
                      </BandDropArea>
                    ))
                  ))}
                </div>
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