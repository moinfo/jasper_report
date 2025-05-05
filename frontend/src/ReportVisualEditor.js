import React, { useState, useCallback, useRef } from 'react';
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
  function elementToXml(el) {
    // Convert color from hex to JRXML format (0xRRGGBB)
    const hexToJRXMLColor = (hex) => hex ? hex.replace('#', '0x') : null;
    
    // Compose style attributes for reportElement
    const reportElementAttrs = [
      `x="${el.x}"`,
      `y="${el.y}"`,
      `width="${el.width}"`,
      `height="${el.height}"`,
      el.backgroundColor ? `backcolor="${hexToJRXMLColor(el.backgroundColor)}"` : '',
      el.backgroundColor ? 'mode="Opaque"' : 'mode="Transparent"',
      el.forecolor ? `forecolor="${hexToJRXMLColor(el.forecolor)}"` : '',
    ].filter(Boolean).join(' ');

    // Compose style attributes for textElement
    const textElementAttrs = [
      el.textAlignment ? `textAlignment="${el.textAlignment}"` : '',
      el.verticalAlignment ? `verticalAlignment="${el.verticalAlignment}"` : '',
    ].filter(Boolean).join(' ');

    const reportElement = `<reportElement ${reportElementAttrs}/>`;
    const textElement = textElementAttrs ? `<textElement ${textElementAttrs}>
      <font size="${el.fontSize || 10}" isBold="${el.isBold || false}"/>
    </textElement>` : '';

    if (el.type === 'staticText') {
      return `<staticText>
        ${reportElement}
        ${textElement}
        <text><![CDATA[${el.text || ''}]]></text>
      </staticText>`;
    }
    if (el.type === 'textField') {
      return `<textField>
        ${reportElement}
        ${textElement}
        <textFieldExpression><![CDATA[${el.text || ''}]]></textFieldExpression>
      </textField>`;
    }
    if (el.type === 'line') {
      return `<line>
        ${reportElement}
        <graphicElement>
          <pen lineWidth="${el.lineWidth || 0.5}" lineColor="${hexToJRXMLColor(el.lineColor || '#000000')}"/>
        </graphicElement>
      </line>`;
    }
    if (el.type === 'image') {
      return `<image>
        ${reportElement}
        <imageExpression><![CDATA[${el.imageExpr || ''}]]></imageExpression>
      </image>`;
    }
    if (el.type === 'rectangle') {
      return `<rectangle>
        ${reportElement}
      </rectangle>`;
    }
    return '';
  }

  function bandXml(band) {
    return `<band height="${band.height || 60}">${band.elements.map(elementToXml).join('')}</band>`;
  }

  // Compose the JRXML with proper formatting and all required parameters/fields
  let jrxml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE jasperReport PUBLIC "-//JasperReports//DTD Report Design//EN" "http://jasperreports.sourceforge.net/dtds/jasperreport.dtd">
<jasperReport xmlns="http://jasperreports.sourceforge.net/jasperreports"
              xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
              xsi:schemaLocation="http://jasperreports.sourceforge.net/jasperreports http://jasperreports.sourceforge.net/xsd/jasperreport.xsd"
              name="employee_report"
              pageWidth="595"
              pageHeight="842"
              columnWidth="555"
              leftMargin="20"
              rightMargin="20"
              topMargin="20"
              bottomMargin="20"
              uuid="e1b1e1b1-1111-1111-1111-111111111111">

    <!-- Style must come first, with proper box structure -->
    <style name="TableCell" mode="Transparent" forecolor="#000000" backcolor="#FFFFFF" fill="Solid" fontName="SansSerif" fontSize="10">
        <box>
            <pen lineWidth="0.5" lineColor="#000000"/>
            <topPen lineWidth="0.5" lineColor="#000000"/>
            <leftPen lineWidth="0.5" lineColor="#000000"/>
            <bottomPen lineWidth="0.5" lineColor="#000000"/>
            <rightPen lineWidth="0.5" lineColor="#000000"/>
        </box>
    </style>

    <!-- Parameters come after style -->
    <parameter name="logoLeft" class="java.io.InputStream"/>
    <parameter name="logoRight" class="java.io.InputStream"/>

    <!-- Fields come after parameters -->
    <field name="name" class="java.lang.String"/>
    <field name="address" class="java.lang.String"/>
    <field name="phone" class="java.lang.String"/>
    <field name="gender" class="java.lang.String"/>`;

  // Add all bands
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
  const [resizing, setResizing] = useState(null); // { bandName, bandIdx, elIdx, startX, startWidth }
  const containerRef = useRef();

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

        // Set default dimensions based on band type and element type
        let defaultWidth, defaultHeight;
        if (bandName === 'title') {
          defaultWidth = type === 'image' ? 60 : 435;
          defaultHeight = type === 'image' ? 60 : 60;
        } else if (bandName === 'columnHeader') {
          defaultWidth = type === 'staticText' ? 140 : 555;
          defaultHeight = 25;
        } else if (bandName === 'detail') {
          defaultWidth = type === 'textField' ? 140 : 555;
          defaultHeight = 20;
        } else {
          defaultWidth = type === 'line' ? 100 : 120;
          defaultHeight = type === 'line' ? 2 : 30;
        }

        // Set default positions based on band type
        if (bandName === 'title') {
          if (type === 'image') {
            x = band.elements.filter(e => e.type === 'image').length === 0 ? 0 : 495;
          } else {
            x = 60;
          }
          y = 0;
        } else if (bandName === 'columnHeader') {
          if (type === 'rectangle') {
            x = 0;
            y = 0;
          } else {
            const widths = [0, 140, 320, 440];
            x = widths[band.elements.filter(e => e.type === 'staticText').length];
            y = 0;
          }
        } else if (bandName === 'detail') {
          if (type === 'rectangle') {
            x = 0;
            y = 0;
          } else {
            const widths = [0, 140, 320, 440];
            x = widths[band.elements.filter(e => e.type === 'textField').length];
            y = 0;
          }
        }

        // Create element with appropriate properties
        const newElement = {
          type,
          id: `${bandName}-${type}-new-${Date.now()}`,
          x,
          y,
          width: defaultWidth,
          height: defaultHeight,
          text: type === 'staticText' ? 
            (bandName === 'title' ? 'Employee Report' : 
             bandName === 'columnHeader' ? ['Name', 'Address', 'Phone', 'Gender'][band.elements.filter(e => e.type === 'staticText').length] : '') :
            (type === 'textField' ? ['$F{name}', '$F{address}', '$F{phone}', '$F{gender}'][band.elements.filter(e => e.type === 'textField').length] : ''),
          forecolor: bandName === 'columnHeader' ? '#FFFFFF' : '#000000',
          backgroundColor: bandName === 'columnHeader' ? '#343a40' : 
                          bandName === 'detail' ? '#f8f9fa' : undefined,
          fontSize: bandName === 'title' ? 28 : 10,
          isBold: bandName === 'title' || bandName === 'columnHeader',
          textAlignment: 'Center',
          verticalAlignment: 'Middle',
          imageExpr: type === 'image' ? (x === 0 ? '$P{logoRight}' : '$P{logoLeft}') : undefined,
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

  // Column resizing logic
  const handleColumnResizeStart = (e, bandName, bandIdx, elIdx) => {
    e.preventDefault();
    setResizing({
      bandName,
      bandIdx,
      elIdx,
      startX: e.clientX,
      startWidth: bands[bandName][bandIdx].elements[elIdx].width,
    });
  };

  React.useEffect(() => {
    if (!resizing) return;
    const handleMouseMove = (e) => {
      const delta = e.clientX - resizing.startX;
      setBands(prev => {
        const newBands = { ...prev };
        const newWidth = Math.max(40, resizing.startWidth + delta);
        newBands[resizing.bandName][resizing.bandIdx].elements[resizing.elIdx].width = newWidth;
        return newBands;
      });
    };
    const handleMouseUp = () => setResizing(null);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizing]);

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
                          ref={containerRef}
                        >
                          <div style={{ fontWeight: 'bold', fontSize: 13, color: '#888', marginBottom: 2 }}>{BAND_LABELS[bandName]}</div>
                          {/* PDF-matching layout for title band */}
                          {bandName === 'title' ? (
                            <div style={{
                              display: 'flex',
                              flexDirection: 'row',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              height: 60,
                              width: 555,
                              margin: '0 auto',
                            }}>
                              <img
                                src={'/organization_logo.png'}
                                onError={e => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/60?text=Logo+Right'; }}
                                alt="Logo Right"
                                style={{ width: 60, height: 60 }}
                              />
                              <div style={{
                                flex: 1,
                                textAlign: 'center',
                                fontWeight: 'bold',
                                fontSize: 40,
                                fontFamily: 'Arial, sans-serif',
                              }}>
                                Employee Report
                              </div>
                              <img
                                src={'/logo.png'}
                                onError={e => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/60?text=Logo+Left'; }}
                                alt="Logo Left"
                                style={{ width: 60, height: 60 }}
                              />
                            </div>
                          ) : (bandName === 'columnHeader' || bandName === 'detail') ? (
                            <div style={{
                              display: 'flex',
                              flexDirection: 'row',
                              width: 555,
                              margin: '0 auto',
                              background: bandName === 'columnHeader' ? '#343a40' : '#fff',
                              border: '1px solid #000',
                              height: band.height,
                            }}>
                              {band.elements.map((el, elIdx) => (
                                <div
                                  key={el.id}
                                  style={{
                                    width: el.width,
                                    minWidth: 40,
                                    height: el.height,
                                    borderRight: elIdx < band.elements.length - 1 ? '1px solid #000' : 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: bandName === 'columnHeader' ? 'center' : 'left',
                                    color: bandName === 'columnHeader' ? '#fff' : '#000',
                                    fontWeight: bandName === 'columnHeader' ? 'bold' : 'normal',
                                    fontSize: el.fontSize,
                                    background: el.backgroundColor,
                                    textAlign: bandName === 'columnHeader' ? 'center' : 'left',
                                    paddingLeft: bandName === 'detail' ? 8 : 0,
                                    position: 'relative',
                                    cursor: 'pointer',
                                  }}
                                  onClick={() => setSelectedElement({ bandName, bandIdx, elIdx })}
                                >
                                  {(el.type === 'staticText' || el.type === 'textField') ? (
                                    selectedElement && selectedElement.bandName === bandName && selectedElement.bandIdx === bandIdx && selectedElement.elIdx === elIdx ? (
                                      <input
                                        value={el.text}
                                        onChange={e => {
                                          const value = e.target.value;
                                          setBands(prev => {
                                            const newBands = { ...prev };
                                            newBands[bandName][bandIdx].elements[elIdx].text = value;
                                            return newBands;
                                          });
                                        }}
                                        onBlur={() => setSelectedElement(null)}
                                        autoFocus
                                        style={{ width: '90%', fontSize: el.fontSize, fontWeight: el.isBold ? 'bold' : 'normal', textAlign: bandName === 'columnHeader' ? 'center' : 'left', background: 'transparent', color: bandName === 'columnHeader' ? '#fff' : '#000', border: 'none' }}
                                      />
                                    ) : (
                                      <span>{el.text}</span>
                                    )
                                  ) : null}
                                  {/* Resizer handle for columnHeader and detail */}
                                  {elIdx < band.elements.length - 1 && (
                                    <div
                                      style={{
                                        position: 'absolute',
                                        right: 0,
                                        top: 0,
                                        width: 6,
                                        height: '100%',
                                        cursor: 'col-resize',
                                        zIndex: 2,
                                      }}
                                      onMouseDown={e => handleColumnResizeStart(e, bandName, bandIdx, elIdx)}
                                    />
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            // Freeform layout for other bands
                            band.elements.map((el, elIdx) => (
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
                                {el.type === 'image' && (
                                  <img
                                    src={el.imageExpr && el.imageExpr.includes('logoRight')
                                      ? '/organization_logo.png'
                                      : el.imageExpr && el.imageExpr.includes('logoLeft')
                                      ? '/logo.png'
                                      : 'https://via.placeholder.com/60?text=Logo'}
                                    alt="Logo"
                                    style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#eee' }}
                                    onError={e => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/60?text=Logo'; }}
                                  />
                                )}
                              </Rnd>
                            ))
                          )}
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