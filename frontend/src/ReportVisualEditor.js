import React, { useState, useCallback } from 'react';
import { Button, Modal, Form, Row, Col, Card } from 'react-bootstrap';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { SketchPicker } from 'react-color';
import { Rnd } from 'react-rnd';
import { XMLParser } from 'fast-xml-parser';

const BAND_NAMES = ['title', 'pageHeader', 'columnHeader', 'detail', 'columnFooter', 'pageFooter', 'summary'];
const AUTO_ARRANGE_BANDS = ['title', 'columnHeader', 'detail'];

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
        // Auto-arrange fields in title, columnHeader, and detail bands horizontally
        if (AUTO_ARRANGE_BANDS.includes(bandName) && elements.length > 0) {
          const colWidth = 120;
          const y = 10;
          elements = elements.map((el, idx) => ({ ...el, x: 10 + idx * colWidth, y }));
        }
        return { elements };
      });
    }
  });
  return bands;
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

// Helper to serialize bands/elements to JRXML
function bandsToJrxml(bands) {
  // This is a minimal JRXML structure for demonstration. You can expand it as needed.
  function elementToXml(el) {
    const base = `<reportElement x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" />`;
    if (el.type === 'staticText') {
      return `<staticText>${base}<text><![CDATA[${el.text || ''}]]></text></staticText>`;
    }
    if (el.type === 'textField') {
      return `<textField>${base}<textFieldExpression><![CDATA[${el.text || ''}]]></textFieldExpression></textField>`;
    }
    if (el.type === 'line') {
      return `<line>${base}</line>`;
    }
    if (el.type === 'image') {
      return `<image>${base}<imageExpression><![CDATA[${el.imageExpr || ''}]]></imageExpression></image>`;
    }
    return '';
  }
  function bandXml(band) {
    return `<band height="100">${band.elements.map(elementToXml).join('')}</band>`;
  }
  // Compose the JRXML
  let jrxml = `<?xml version="1.0" encoding="UTF-8"?>
<jasperReport name="VisualDesign" pageWidth="595" pageHeight="842" columnWidth="555" leftMargin="20" rightMargin="20" topMargin="20" bottomMargin="20">
  <parameter name="logoRight" class="java.lang.String"/>
  <parameter name="logoLeft" class="java.lang.String"/>
  <field name="name" class="java.lang.String"/>
  <field name="address" class="java.lang.String"/>
  <field name="phone" class="java.lang.String"/>
  <field name="gender" class="java.lang.String"/>
`;
  for (const bandName of BAND_NAMES) {
    if (bands[bandName]) {
      bands[bandName].forEach(band => {
        jrxml += `
<${bandName}>${bandXml(band)}</${bandName}>`;
      });
    }
  }
  jrxml += '\n</jasperReport>';
  return jrxml;
}

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
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);

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
    // Serialize bands/elements to JRXML
    const jrxml = bandsToJrxml(bands);
    fetch("/api/reports/employees/design", {
      method: "POST",
      headers: {
        "Content-Type": "text/plain",
      },
      body: jrxml,
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

  // Update handleDropElement to auto-arrange new fields in detail band
  const handleDropElement = useCallback((type, bandName, bandIdx, offset) => {
    const bandDiv = document.getElementById(`band-${bandName}-${bandIdx}`);
    if (!bandDiv) return;
    const rect = bandDiv.getBoundingClientRect();
    let x = Math.round(offset.x - rect.left);
    let y = Math.round(offset.y - rect.top);
    setBands(prev => {
      const newBands = { ...prev };
      newBands[bandName] = newBands[bandName].map((band, bIdx) => {
        if (bIdx !== bandIdx) return band;
        const defaultWidth = type === 'line' ? 100 : 120;
        const defaultHeight = type === 'line' ? 2 : 30;
        // For title, columnHeader, and detail bands, auto-arrange horizontally
        if (AUTO_ARRANGE_BANDS.includes(bandName)) {
          x = 10 + band.elements.length * defaultWidth;
          y = 10;
        } else {
          // Avoid overlap for other bands
          let newY = y;
          let tries = 0;
          while (band.elements.some(el => {
            return (
              (x < el.x + el.width && x + defaultWidth > el.x) &&
              (newY < el.y + el.height && newY + defaultHeight > el.y)
            );
          }) && tries < 100) {
            newY += defaultHeight + 5;
            tries++;
          }
          y = newY;
        }
        const newElement = {
          type,
          id: `${bandName}-${type}-new-${Date.now()}`,
          x,
          y,
          width: defaultWidth,
          height: defaultHeight,
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

  // Property editor for selected element
  const renderPropertyEditor = () => {
    if (!selectedElement) return null;
    const { bandName, bandIdx, elIdx } = selectedElement;
    const el = bands[bandName]?.[bandIdx]?.elements[elIdx];
    if (!el) return null;
    return (
      <Card className="mt-3">
        <Card.Header>Edit Element</Card.Header>
        <Card.Body>
          {(el.type === 'staticText' || el.type === 'textField') && bandName !== 'detail' ? (
            <Form.Group className="mb-3">
              <Form.Label>Text</Form.Label>
              <Form.Control
                type="text"
                value={el.text}
                onChange={e => {
                  const value = e.target.value;
                  setBands(prev => {
                    const newBands = { ...prev };
                    newBands[bandName] = newBands[bandName].map((band, bIdx) => {
                      if (bIdx !== bandIdx) return band;
                      return {
                        ...band,
                        elements: band.elements.map((elem, idx) => idx === elIdx ? { ...elem, text: value } : elem)
                      };
                    });
                    return newBands;
                  });
                }}
              />
            </Form.Group>
          ) : null}
          {(el.type === 'staticText' || el.type === 'textField') && bandName === 'detail' ? (
            <Form.Group className="mb-3">
              <Form.Label>Text</Form.Label>
              <Form.Control
                type="text"
                value={el.text}
                readOnly
                style={{ background: '#eee', cursor: 'not-allowed' }}
              />
              <Form.Text muted>This is a variable and cannot be edited.</Form.Text>
            </Form.Group>
          ) : null}
          <Form.Group className="mb-3">
            <Form.Label>Font Size</Form.Label>
            <Form.Select
              value={el.fontSize || '12px'}
              onChange={e => {
                const value = e.target.value;
                setBands(prev => {
                  const newBands = { ...prev };
                  newBands[bandName] = newBands[bandName].map((band, bIdx) => {
                    if (bIdx !== bandIdx) return band;
                    return {
                      ...band,
                      elements: band.elements.map((elem, idx) => idx === elIdx ? { ...elem, fontSize: value } : elem)
                    };
                  });
                  return newBands;
                });
              }}
            >
              <option value="10px">10px</option>
              <option value="12px">12px</option>
              <option value="14px">14px</option>
              <option value="16px">16px</option>
              <option value="18px">18px</option>
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Text Color</Form.Label>
            <SketchPicker
              color={el.textColor || '#000000'}
              onChangeComplete={color => {
                setBands(prev => {
                  const newBands = { ...prev };
                  newBands[bandName] = newBands[bandName].map((band, bIdx) => {
                    if (bIdx !== bandIdx) return band;
                    return {
                      ...band,
                      elements: band.elements.map((elem, idx) => idx === elIdx ? { ...elem, textColor: color.hex } : elem)
                    };
                  });
                  return newBands;
                });
              }}
            />
          </Form.Group>
        </Card.Body>
      </Card>
    );
  };

  // Preview handler
  const handlePreview = async () => {
    setPreviewLoading(true);
    setPreviewUrl(null);
    const jrxml = bandsToJrxml(bands);
    try {
      const response = await fetch('/api/employees/preview-live', {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: jrxml,
      });
      if (!response.ok) throw new Error('Failed to generate preview');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
    } catch (err) {
      alert('Failed to generate preview: ' + err);
    } finally {
      setPreviewLoading(false);
    }
  };

  return (
    <>
      <Button variant="primary" onClick={handleShow}>
        Visual Editor
      </Button>

      <Modal show={show} onHide={handleClose} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>Visual Report Editor (WYSIWYG - All Bands, Edit Only)</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <DndProvider backend={HTML5Backend}>
            <Row>
              <Col md={3}>
                {renderPropertyEditor()}
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
                  </Card.Body>
                </Card>
                <Button className="mt-3 w-100" variant="secondary" onClick={handlePreview} disabled={previewLoading}>
                  {previewLoading ? 'Generating Preview...' : 'Preview'}
                </Button>
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
                                color: el.textColor || styleSettings.textColor,
                                fontSize: el.fontSize || styleSettings.fontSize,
                                fontFamily: styleSettings.fontFamily,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                              }}
                              onClick={() => setSelectedElement({ bandName, bandIdx, elIdx })}
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
                {/* Preview Area */}
                {previewUrl && (
                  <div className="mt-4">
                    <h5>Live Preview</h5>
                    <object data={previewUrl} type="application/pdf" width="100%" height="600px">
                      <p>PDF preview is not supported in this browser.</p>
                    </object>
                  </div>
                )}
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