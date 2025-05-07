import React, {useState, useCallback, useRef, useEffect} from 'react';
import {Button, Modal, Form, Row, Col, Card, Nav, Alert, Spinner, OverlayTrigger, Tooltip} from 'react-bootstrap';
import {DndProvider, useDrag, useDrop} from 'react-dnd';
import {HTML5Backend} from 'react-dnd-html5-backend';
import {SketchPicker} from 'react-color';
import {Rnd} from 'react-rnd';
import {XMLParser} from 'fast-xml-parser';

// Constants
const BAND_NAMES = ['title', 'pageHeader', 'columnHeader', 'detail', 'columnFooter', 'pageFooter', 'summary'];
const AUTO_ARRANGE_BANDS = ['title', 'columnHeader', 'detail'];
const BAND_LABELS = {
    title: 'Title',
    // pageHeader: 'Page Header',
    columnHeader: 'Column Header',
    detail: 'Detail',
    // columnFooter: 'Column Footer',
    // pageFooter: 'Page Footer',
    // summary: 'Summary',
};

// Default field configurations
const DEFAULT_FIELD_CONFIGS = {
    title: {
        staticText: {width: 315, height: 60, x: 120, y: 0},
        image: {width: 60, height: 60, x: 0, y: 0},
        line: {width: 555, height: 2, x: 0, y: 58}
    },
    columnHeader: {
        staticText: {width: 140, height: 25, x: 0, y: 0},
        rectangle: {width: 555, height: 25, x: 0, y: 0},
        line: {width: 555, height: 2, x: 0, y: 24}
    },
    detail: {
        textField: {width: 140, height: 20, x: 0, y: 0},
        rectangle: {width: 555, height: 20, x: 0, y: 0},
        line: {width: 555, height: 1, x: 0, y: 19}
    },
    pageHeader: {
        staticText: {width: 200, height: 30, x: 0, y: 0},
        line: {width: 555, height: 1, x: 0, y: 29}
    },
    pageFooter: {
        staticText: {width: 200, height: 30, x: 0, y: 0},
        textField: {width: 100, height: 20, x: 455, y: 5},
        line: {width: 555, height: 1, x: 0, y: 0}
    },
    columnFooter: {
        staticText: {width: 100, height: 20, x: 0, y: 0},
        line: {width: 555, height: 1, x: 0, y: 0}
    },
    summary: {
        staticText: {width: 100, height: 20, x: 0, y: 0},
        textField: {width: 100, height: 20, x: 455, y: 0}
    }
};

// Toolbar for adding elements
const ElementsToolbar = ({onAddElement}) => {
    const [{isDragging: isStaticTextDragging}, dragStaticText] = useDrag({
        type: 'NEW_ELEMENT',
        item: {type: 'staticText'},
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    const [{isDragging: isTextFieldDragging}, dragTextField] = useDrag({
        type: 'NEW_ELEMENT',
        item: {type: 'textField'},
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    const [{isDragging: isLineDragging}, dragLine] = useDrag({
        type: 'NEW_ELEMENT',
        item: {type: 'line'},
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    const [{isDragging: isImageDragging}, dragImage] = useDrag({
        type: 'NEW_ELEMENT',
        item: {type: 'image'},
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    const [{isDragging: isRectangleDragging}, dragRectangle] = useDrag({
        type: 'NEW_ELEMENT',
        item: {type: 'rectangle'},
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    return (
        <Card className="mb-3">
            <Card.Header>Elements</Card.Header>
            <Card.Body>
                <div className="d-flex flex-wrap justify-content-around">
                    <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip>Drag to add text</Tooltip>}
                    >
                        <Button
                            ref={dragStaticText}
                            variant="outline-primary"
                            className="m-1"
                            style={{opacity: isStaticTextDragging ? 0.5 : 1, cursor: 'move'}}
                            onClick={() => onAddElement('staticText')}
                        >
                            <i className="bi bi-font"></i> Text
                        </Button>
                    </OverlayTrigger>

                    <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip>Drag to add field</Tooltip>}
                    >
                        <Button
                            ref={dragTextField}
                            variant="outline-success"
                            className="m-1"
                            style={{opacity: isTextFieldDragging ? 0.5 : 1, cursor: 'move'}}
                            onClick={() => onAddElement('textField')}
                        >
                            <i className="bi bi-input-cursor-text"></i> Field
                        </Button>
                    </OverlayTrigger>

                    <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip>Drag to add line</Tooltip>}
                    >
                        <Button
                            ref={dragLine}
                            variant="outline-dark"
                            className="m-1"
                            style={{opacity: isLineDragging ? 0.5 : 1, cursor: 'move'}}
                            onClick={() => onAddElement('line')}
                        >
                            <i className="bi bi-hr"></i> Line
                        </Button>
                    </OverlayTrigger>

                    <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip>Drag to add image</Tooltip>}
                    >
                        <Button
                            ref={dragImage}
                            variant="outline-info"
                            className="m-1"
                            style={{opacity: isImageDragging ? 0.5 : 1, cursor: 'move'}}
                            onClick={() => onAddElement('image')}
                        >
                            <i className="bi bi-image"></i> Image
                        </Button>
                    </OverlayTrigger>

                    <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip>Drag to add rectangle</Tooltip>}
                    >
                        <Button
                            ref={dragRectangle}
                            variant="outline-secondary"
                            className="m-1"
                            style={{opacity: isRectangleDragging ? 0.5 : 1, cursor: 'move'}}
                            onClick={() => onAddElement('rectangle')}
                        >
                            <i className="bi bi-square"></i> Rectangle
                        </Button>
                    </OverlayTrigger>
                </div>
            </Card.Body>
        </Card>
    );
};

// Drop target for each band
const BandDropArea = ({bandName, bandIdx, children, onDropElement}) => {
    const [{isOver}, drop] = useDrop({
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

// Helper to parse JRXML and extract elements from all bands
const parseJrxml = (jrxml) => {
    try {
        const parser = new XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: "@_",
            allowBooleanAttributes: true,
            parseAttributeValue: true
        });

        const result = parser.parse(jrxml);
        const bands = {};
        
        // Ensure we have a console log for debugging
        console.log("Parsing JRXML template:", result);

        BAND_NAMES.forEach(bandName => {
            const bandData = result?.jasperReport?.[bandName];
            if (bandData) {
                const bandArr = Array.isArray(bandData) ? bandData : [bandData];
                bands[bandName] = bandArr.map((band, bandIdx) => {
                    const bandContent = band.band || band;
                    let elements = [];

                    if (!bandContent) return {elements: []};

                    // Process static text elements
                    if (bandContent.staticText) {
                        const staticTexts = Array.isArray(bandContent.staticText)
                            ? bandContent.staticText
                            : [bandContent.staticText];

                        staticTexts.forEach((el, idx) => {
                            const text = el.text || '';
                            const reportEl = el.reportElement || {};
                            const attrs = reportEl['@_'] || reportEl;

                            const textElement = el.textElement || {};
                            const textAttrs = textElement['@_'] || {};

                            const font = textElement.font || {};
                            const fontAttrs = font['@_'] || {};

                            elements.push({
                                type: 'staticText',
                                id: `${bandName}-staticText-${bandIdx}-${idx}`,
                                x: parseInt(attrs.x || 0),
                                y: parseInt(attrs.y || 0),
                                width: parseInt(attrs.width || 100),
                                height: parseInt(attrs.height || 30),
                                text: typeof text === 'string' ? text : (text?.['#text'] || ''),
                                backgroundColor: attrs.backcolor ? attrs.backcolor.replace('0x', '#') : undefined,
                                textColor: attrs.forecolor ? attrs.forecolor.replace('0x', '#') : undefined,
                                textAlignment: textAttrs.textAlignment,
                                verticalAlignment: textAttrs.verticalAlignment,
                                fontFamily: fontAttrs.fontName,
                                fontSize: fontAttrs.size,
                                isBold: fontAttrs.isBold === 'true',
                                isItalic: fontAttrs.isItalic === 'true',
                                isUnderline: fontAttrs.isUnderline === 'true',
                            });
                        });
                    }

                    // Process text field elements
                    if (bandContent.textField) {
                        const textFields = Array.isArray(bandContent.textField)
                            ? bandContent.textField
                            : [bandContent.textField];

                        textFields.forEach((el, idx) => {
                            const expression = el.textFieldExpression || '';
                            const reportEl = el.reportElement || {};
                            const attrs = reportEl['@_'] || reportEl;

                            const textElement = el.textElement || {};
                            const textAttrs = textElement['@_'] || {};

                            const font = textElement.font || {};
                            const fontAttrs = font['@_'] || {};

                            elements.push({
                                type: 'textField',
                                id: `${bandName}-textField-${bandIdx}-${idx}`,
                                x: parseInt(attrs.x || 0),
                                y: parseInt(attrs.y || 0),
                                width: parseInt(attrs.width || 100),
                                height: parseInt(attrs.height || 30),
                                text: typeof expression === 'string' ? expression : (expression?.['#text'] || ''),
                                backgroundColor: attrs.backcolor ? attrs.backcolor.replace('0x', '#') : undefined,
                                textColor: attrs.forecolor ? attrs.forecolor.replace('0x', '#') : undefined,
                                textAlignment: textAttrs.textAlignment,
                                verticalAlignment: textAttrs.verticalAlignment,
                                fontFamily: fontAttrs.fontName,
                                fontSize: fontAttrs.size,
                                isBold: fontAttrs.isBold === 'true',
                                isItalic: fontAttrs.isItalic === 'true',
                                isUnderline: fontAttrs.isUnderline === 'true',
                            });
                        });
                    }

                    // Process line elements
                    if (bandContent.line) {
                        const lines = Array.isArray(bandContent.line)
                            ? bandContent.line
                            : [bandContent.line];

                        lines.forEach((el, idx) => {
                            const reportEl = el.reportElement || {};
                            const attrs = reportEl['@_'] || reportEl;

                            const graphicElement = el.graphicElement || {};
                            const pen = graphicElement.pen || {};
                            const penAttrs = pen['@_'] || {};

                            elements.push({
                                type: 'line',
                                id: `${bandName}-line-${bandIdx}-${idx}`,
                                x: parseInt(attrs.x || 0),
                                y: parseInt(attrs.y || 0),
                                width: parseInt(attrs.width || 100),
                                height: parseInt(attrs.height || 2),
                                lineWidth: parseFloat(penAttrs.lineWidth || 0.5),
                                lineColor: penAttrs.lineColor ? penAttrs.lineColor.replace('0x', '#') : '#000000',
                            });
                        });
                    }

                    // Process image elements
                    if (bandContent.image) {
                        const images = Array.isArray(bandContent.image)
                            ? bandContent.image
                            : [bandContent.image];

                        images.forEach((el, idx) => {
                            const reportEl = el.reportElement || {};
                            const attrs = reportEl['@_'] || reportEl;

                            const expression = el.imageExpression || '';

                            elements.push({
                                type: 'image',
                                id: `${bandName}-image-${bandIdx}-${idx}`,
                                x: parseInt(attrs.x || 0),
                                y: parseInt(attrs.y || 0),
                                width: parseInt(attrs.width || 100),
                                height: parseInt(attrs.height || 50),
                                imageExpr: typeof expression === 'string' ? expression : (expression?.['#text'] || ''),
                            });
                        });
                    }

                    // Process rectangle elements
                    if (bandContent.rectangle) {
                        const rectangles = Array.isArray(bandContent.rectangle)
                            ? bandContent.rectangle
                            : [bandContent.rectangle];

                        rectangles.forEach((el, idx) => {
                            const reportEl = el.reportElement || {};
                            const attrs = reportEl['@_'] || reportEl;

                            elements.push({
                                type: 'rectangle',
                                id: `${bandName}-rectangle-${bandIdx}-${idx}`,
                                x: parseInt(attrs.x || 0),
                                y: parseInt(attrs.y || 0),
                                width: parseInt(attrs.width || 100),
                                height: parseInt(attrs.height || 30),
                                backgroundColor: attrs.backcolor ? attrs.backcolor.replace('0x', '#') : undefined,
                            });
                        });
                    }

                    // Calculate band height from the maximum y + height of any element
                    const bandHeight = elements.length > 0
                        ? Math.max(...elements.map(el => el.y + el.height))
                        : 60;

                    return {
                        elements,
                        height: bandHeight
                    };
                });
            } else {
                // Create default empty band if not present
                bands[bandName] = [{
                    elements: [],
                    height: 60
                }];
            }
        });

        return bands;
    } catch (error) {
        console.error("Error parsing JRXML", error);
        // Return default empty bands structure
        const emptyBands = {};
        BAND_NAMES.forEach(bandName => {
            emptyBands[bandName] = [{elements: [], height: 60}];
        });
        return emptyBands;
    }
};

// Helper to serialize bands/elements to JRXML
function bandsToJrxml(originalBands) {
    // Deep clone the bands to avoid modifying the original
    const bands = JSON.parse(JSON.stringify(originalBands));
    function elementToXml(el, bandName) {
        const hexToJRXMLColor = (hex) => {
            if (!hex) return null;

            // Remove the '#' if present
            hex = hex.replace('#', '');

            // JasperReports expects integer values, not hex strings with 0x prefix
            // Convert from hex to decimal
            const r = parseInt(hex.substring(0, 2), 16);
            const g = parseInt(hex.substring(2, 4), 16);
            const b = parseInt(hex.substring(4, 6), 16);

            // Return the integer value as decimal (no 0x prefix)
            return (r << 16) + (g << 8) + b;
        };
        
        // Debug the element being processed - we're using whatever coordinates were set during pre-processing
        console.log(`Processing ${el.type} in ${bandName}, x=${el.x}, y=${el.y}, width=${el.width}, height=${el.height}`);

        // Check if this element should have cell borders (for table-like structure)
        const needsBorders = (bandName === 'columnHeader' || bandName === 'detail') && 
            (el.type === 'staticText' || el.type === 'textField');

        // Include style attribute reference for table cells to get proper borders
        const styleAttr = needsBorders ? `style="TableCell"` : '';
            
        const reportElementAttrs = [
            `x="${el.x}"`,
            `y="${el.y}"`,
            `width="${el.width}"`,
            `height="${el.height}"`,
            el.backgroundColor ? `backcolor="${hexToJRXMLColor(el.backgroundColor)}"` : '',
            `mode="${el.backgroundColor ? 'Opaque' : 'Transparent'}"`,
            el.textColor ? `forecolor="${hexToJRXMLColor(el.textColor)}"` : (el.forecolor ? `forecolor="${hexToJRXMLColor(el.forecolor)}"` : ''),
            styleAttr
        ].filter(Boolean).join(' ');

        const textElementAttrs = [
            el.textAlignment ? `textAlignment="${el.textAlignment}"` : '',
            el.verticalAlignment ? `verticalAlignment="${el.verticalAlignment}"` : '',
        ].filter(Boolean).join(' ');


        // Always set a default fontName and fontSize for JasperReports compatibility
        const fontAttrs = [
            `fontName="${el.fontFamily || 'Arial'}"`,
            `size="${parseInt(el.fontSize) || 12}"`,
            el.isBold ? `isBold="true"` : '',
            el.isItalic ? `isItalic="true"` : '',
            el.isUnderline ? `isUnderline="true"` : '',
        ].filter(Boolean).join(' ');

        const reportElement = `<reportElement ${reportElementAttrs}/>`;
        const textElement = `<textElement ${textElementAttrs}><font ${fontAttrs}/></textElement>`;

        if (el.type === 'staticText') {
            return `<staticText>
        ${reportElement}
        ${textElement}
        <text><![CDATA[${el.text || ''}]]></text>
      </staticText>`;
        }
        if (el.type === 'textField') {
            // Add evaluation time for page variables
            const isPageVariable = el.text && el.text.includes('$V{PAGE_NUMBER}');
            const evaluationTime = isPageVariable ? 'evaluationTime="Report"' : '';

            // Add pattern for numeric fields if needed
            const pattern = el.pattern ? `pattern="${el.pattern}"` : '';

            // Add stretch with overflow for text fields
            const textAdjust = `textAdjust="StretchHeight"`;

            return `<textField ${evaluationTime} ${pattern} ${textAdjust}>
      ${reportElement}
      ${textElement}
      <textFieldExpression><![CDATA[${el.text || '""'}]]></textFieldExpression>
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

    function bandXml(band, bandName) {
        // Console log to debug element positions
        console.log(`Processing band ${bandName} with ${band.elements.length} elements`);
        
        // Determine appropriate band height
        let bandHeight = band.height || 60;
        
        // Ensure minimum heights for each band type
        if (bandName === 'title') {
            bandHeight = Math.max(bandHeight, 60); // Title needs at least 60px height
        } else if (bandName === 'columnHeader') {
            bandHeight = Math.max(bandHeight, 25); // Column header needs at least 25px
        } else if (bandName === 'detail') {
            bandHeight = Math.max(bandHeight, 20); // Detail needs at least 20px
        }
        
        // Pre-process elements for special positioning before XML generation
        if (bandName === 'title') {
            // Ensure title elements have correct positioning
            band.elements.forEach(el => {
                if (el.type === 'image') {
                    if (el.imageExpr && el.imageExpr.includes('logoLeft')) {
                        el.x = 0;
                        el.y = 0;
                        el.width = 60;
                        el.height = 60;
                    } else if (el.imageExpr && el.imageExpr.includes('logoRight')) {
                        el.x = 495;
                        el.y = 0;
                        el.width = 60;
                        el.height = 60;
                    }
                } else if (el.type === 'staticText') {
                    el.x = 120;
                    el.y = 0;
                    el.width = 315;
                    el.height = 60;
                }
            });
        } else if (bandName === 'columnHeader' || bandName === 'detail') {
            // Get the column header/detail elements into the right positions
            const columnPositions = [0, 140, 320, 440];
            const columnWidths = [140, 180, 120, 115];
            
            // Create a rectangle first for the background if it doesn't exist
            let hasRectangle = band.elements.some(el => el.type === 'rectangle');
            if (!hasRectangle) {
                // Add a background rectangle
                band.elements.unshift({
                    type: 'rectangle',
                    id: `${bandName}-rectangle-background`,
                    x: 0,
                    y: 0,
                    width: 555,
                    height: bandName === 'columnHeader' ? 25 : 20,
                    backgroundColor: bandName === 'columnHeader' ? '#343a40' : '#f8f9fa',
                });
            }
            
            // Process text elements (static text or text fields)
            // Sort elements to ensure proper rendering order (rectangle first, then text elements)
            band.elements.sort((a, b) => {
                // Put rectangles first
                if (a.type === 'rectangle' && b.type !== 'rectangle') return -1;
                if (a.type !== 'rectangle' && b.type === 'rectangle') return 1;
                
                // For text elements, sort by their x position
                return a.x - b.x;
            });
            
            // Ensure that text elements have the right positions based on columns
            band.elements.forEach(el => {
                if ((el.type === 'staticText' || el.type === 'textField') && el.text) {
                    const fieldIndex = ['name', 'address', 'phone', 'gender'].findIndex(field => 
                        el.text.toLowerCase().includes(field.toLowerCase()));
                    
                    if (fieldIndex !== -1) {
                        el.x = columnPositions[fieldIndex];
                        el.y = 0;
                        el.width = columnWidths[fieldIndex];
                        el.height = bandName === 'columnHeader' ? 25 : 20;
                    }
                } else if (el.type === 'rectangle') {
                    el.x = 0;
                    el.y = 0;
                    el.width = 555;
                    el.height = bandName === 'columnHeader' ? 25 : 20;
                }
            });
        }
        
        // Generate the XML for the band
        return `<band height="${bandHeight}">${band.elements.map(el => elementToXml(el, bandName)).join('')}</band>`;
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
    <${bandName}>${bandXml(band, bandName)}</${bandName}>`;
            });
        }
    }

    jrxml += '\n</jasperReport>';
    return jrxml;
}

// Main component
function ReportVisualEditor() {
    const [show, setShow] = useState(false);
    const [designContent, setDesignContent] = useState("");
    const [bands, setBands] = useState({});
    const [activeBand, setActiveBand] = useState('title');
    const [loadingDesign, setLoadingDesign] = useState(false);
    const [saving, setSaving] = useState(false);
    const [selectedElement, setSelectedElement] = useState(null);
    const [showPreview, setShowPreview] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [resizing, setResizing] = useState(null);
    const [statusMessage, setStatusMessage] = useState(null);
    const [elementGridSnap, setElementGridSnap] = useState(true);
    const [showGridLines, setShowGridLines] = useState(true);
    const [resizeHelper, setResizeHelper] = useState({width: 0, height: 0});

    const containerRef = useRef();
    const sidebarRef = useRef();

    // Setup keyboard shortcuts
    useEffect(() => {
        if (!show) return;

        const handleKeyDown = (e) => {
            // Delete element with Delete key
            if (e.key === 'Delete' && selectedElement) {
                handleDeleteElement();
                e.preventDefault();
            }

            // Copy element with Ctrl+C
            if (e.key === 'c' && e.ctrlKey && selectedElement) {
                handleCopyElement();
                e.preventDefault();
            }

            // Paste element with Ctrl+V
            if (e.key === 'v' && e.ctrlKey) {
                handlePasteElement();
                e.preventDefault();
            }

            // Undo with Ctrl+Z
            if (e.key === 'z' && e.ctrlKey) {
                // Implement undo functionality
                e.preventDefault();
            }

            // Toggle grid with G
            if (e.key === 'g' && e.ctrlKey) {
                setShowGridLines(prev => !prev);
                e.preventDefault();
            }

            // Arrow keys to nudge elements
            if (selectedElement && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                nudgeSelectedElement(e.key, e.shiftKey ? 10 : 1);
                e.preventDefault();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [show, selectedElement]);

    // Nudge selected element with arrow keys
    const nudgeSelectedElement = (direction, amount = 1) => {
        if (!selectedElement) return;

        const {bandName, bandIdx, elIdx} = selectedElement;

        setBands(prev => {
            const newBands = {...prev};
            const element = newBands[bandName][bandIdx].elements[elIdx];

            switch (direction) {
                case 'ArrowUp':
                    element.y = Math.max(0, element.y - amount);
                    break;
                case 'ArrowDown':
                    element.y = element.y + amount;
                    break;
                case 'ArrowLeft':
                    element.x = Math.max(0, element.x - amount);
                    break;
                case 'ArrowRight':
                    element.x = element.x + amount;
                    break;
                default:
                    break;
            }

            return newBands;
        });
    };

    // Copy the selected element to clipboard
    const handleCopyElement = () => {
        if (!selectedElement) return;

        const {bandName, bandIdx, elIdx} = selectedElement;
        const elementToCopy = bands[bandName][bandIdx].elements[elIdx];

        localStorage.setItem('reportEditorClipboard', JSON.stringify(elementToCopy));
        setStatusMessage({text: 'Element copied to clipboard', type: 'success'});

        // Auto-clear status message
        setTimeout(() => setStatusMessage(null), 2000);
    };

    // Paste element from clipboard
    const handlePasteElement = () => {
        const clipboardData = localStorage.getItem('reportEditorClipboard');
        if (!clipboardData) return;

        try {
            const element = JSON.parse(clipboardData);

            // Add offset to position to make it clear it's a copy
            const newElement = {
                ...element,
                id: `${element.type}-copy-${Date.now()}`,
                x: element.x + 20,
                y: element.y + 20
            };

            // Add to active band
            setBands(prev => {
                const newBands = {...prev};
                newBands[activeBand][0].elements.push(newElement);
                return newBands;
            });

            setStatusMessage({text: 'Element pasted', type: 'success'});

            // Auto-clear status message
            setTimeout(() => setStatusMessage(null), 2000);
        } catch (error) {
            console.error("Failed to paste element", error);
            setStatusMessage({text: 'Failed to paste element', type: 'danger'});

            // Auto-clear status message
            setTimeout(() => setStatusMessage(null), 2000);
        }
    };

    // Delete the selected element
    const handleDeleteElement = () => {
        if (!selectedElement) return;

        const {bandName, bandIdx, elIdx} = selectedElement;

        setBands(prev => {
            const newBands = {...prev};
            newBands[bandName][bandIdx].elements = newBands[bandName][bandIdx].elements.filter((_, idx) => idx !== elIdx);
            return newBands;
        });

        setSelectedElement(null);
        setStatusMessage({text: 'Element deleted', type: 'success'});

        // Auto-clear status message
        setTimeout(() => setStatusMessage(null), 2000);
    };

    // Open modal and load design
    const handleShow = () => {
        setLoadingDesign(true);
        setStatusMessage({text: 'Loading report design...', type: 'info'});
        
        // Fetch the saved design from the server
        fetch("/api/reports/employees/preview")
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to load design: ${response.status} ${response.statusText}`);
                }
                return response.text();
            })
            .then(designXml => {
                console.log("Loaded design from server, length:", designXml.length);
                console.log("First 200 chars:", designXml.substring(0, 200));
                
                if (!designXml || designXml.length < 100) {
                    throw new Error("Loaded design is empty or invalid");
                }
                
                // Parse the design XML into bands
                try {
                    setDesignContent(designXml);
                    const parsedBands = parseJrxml(designXml);
                    console.log("Parsed bands from server design:", parsedBands);
                    setBands(parsedBands);
                    
                    // Always ensure the title band is selected by default
                    setActiveBand('title');
                    
                    // Add a slight delay to ensure title band renders first
                    setTimeout(() => {
                        // Force focus on title elements
                        const titleBandElement = document.getElementById('band-title-0');
                        if (titleBandElement) {
                            console.log("Title band found, scrolling to it");
                            titleBandElement.scrollIntoView({ behavior: 'smooth' });
                        }
                    }, 200);
                    
                    // Show the editor
                    setShow(true);
                    setStatusMessage({text: 'Design loaded successfully', type: 'success'});
                    setTimeout(() => setStatusMessage(null), 2000);
                } catch (e) {
                    console.error("Failed to parse JRXML from server", e);
                    throw new Error("Failed to parse JRXML from server: " + e.message);
                }
            })
            .catch(error => {
                console.error("Error loading design:", error);
                setStatusMessage({text: error.message, type: 'danger'});
                
                // Use a default template as fallback
                console.log("Loading default template as fallback");
                
                // Fetch the default template from backend resources
                fetch("/api/reports/employees/preview")
                    .then(response => response.text())
                    .then(defaultTemplate => {
                        try {
                            setDesignContent(defaultTemplate);
                            const parsedBands = parseJrxml(defaultTemplate);
                            setBands(parsedBands);
                            setActiveBand('title');
                            setShow(true);
                            setStatusMessage({text: 'Loaded default template', type: 'warning'});
                        } catch (e) {
                            console.error("Failed to parse default template", e);
                            setBands({});
                            setStatusMessage({text: 'Failed to load any template: ' + e.message, type: 'danger'});
                        }
                    });
            })
            .finally(() => {
                setLoadingDesign(false);
            });
    };

    const handleClose = () => {
        // Ask for confirmation if there are unsaved changes
        if (designContent !== bandsToJrxml(bands)) {
            if (window.confirm("You have unsaved changes. Are you sure you want to close?")) {
                setShow(false);
                resetEditorState();
            }
        } else {
            setShow(false);
            resetEditorState();
        }
    };

    const resetEditorState = () => {
        setDesignContent("");
        setBands({});
        setSelectedElement(null);
        setShowPreview(false);
        setPreviewUrl(null);
        setStatusMessage(null);
        setActiveBand('title');
    };

    const handleSave = () => {
        setSaving(true);
        
        // Generate JRXML from current bands state instead of using a hard-coded template
        console.log("Generating JRXML from current bands state:", bands);
        
        // Convert the current bands state to JRXML
        const jrxml = bandsToJrxml(bands);
        
        // Debug log
        console.log("Generated dynamic JRXML based on editor state");
        
        // Debug log to see what's being saved
        console.log("Saving fixed JRXML template to database");

        console.log("Saving JRXML template to database, length:", jrxml.length);
        console.log("First 200 chars of template:", jrxml.substring(0, 200));
        
        // Fix: Ensure we're using the correct endpoint path
        fetch("/api/reports/employees/design", {
            method: "POST",
            headers: {
                "Content-Type": "text/plain",
            },
            body: jrxml,
        })
            .then((response) => {
                console.log("Save response status:", response.status);
                console.log("Save response ok:", response.ok);
                
                return response.text()
                    .then(text => {
                        console.log("Save response body:", text || "(empty)");
                        
                        // Return both the response and the text
                        return { response, text };
                    });
            })
            .then(({ response, text }) => {
                if (response.ok) {
                    setStatusMessage({text: `Design updated successfully! Server says: ${text}`, type: 'success'});
                    setDesignContent(jrxml); // Update the original content to mark as saved
                    
                    console.log("Verifying save by fetching the saved design back");
                    
                    // Verify saved design by immediately fetching it back
                    setTimeout(() => {
                        fetch("/api/reports/employees/preview")
                            .then(r => {
                                console.log("Verification fetch status:", r.status);
                                return r.text();
                            })
                            .then(savedContent => {
                                console.log("Verification: Saved design length:", savedContent.length);
                                console.log("Verification: First 100 chars:", savedContent.substring(0, 100));
                                
                                if (savedContent.length < 100) {
                                    setStatusMessage({
                                        text: 'Warning: Saved design may be incomplete! Only ' + 
                                              savedContent.length + ' characters retrieved.',
                                        type: 'warning'
                                    });
                                } else {
                                    // Double check that what we saved is what we get back
                                    const jrxmlFirstLine = jrxml.split("\n")[0].trim();
                                    const savedFirstLine = savedContent.split("\n")[0].trim();
                                    
                                    console.log("Original first line:", jrxmlFirstLine);
                                    console.log("Saved first line:", savedFirstLine);
                                    
                                    if (jrxmlFirstLine !== savedFirstLine) {
                                        setStatusMessage({
                                            text: 'Warning: Saved content doesn\'t match what was sent!',
                                            type: 'warning'
                                        });
                                    }
                                }
                            })
                            .catch(err => {
                                console.error("Verification failed:", err);
                                setStatusMessage({
                                    text: 'Warning: Could not verify save operation: ' + err.message,
                                    type: 'warning'
                                });
                            });
                    }, 1000);
                } else {
                    throw new Error("Failed to update design: " + text || response.statusText);
                }
            })
            .catch((err) => {
                console.error("Failed to update design", err);
                setStatusMessage({text: 'Failed to update design: ' + err.message, type: 'danger'});
            })
            .finally(() => setSaving(false));
    };

    const handleElementDragStop = (bandName, bandIdx, elIdx, d) => {
        setBands(prev => {
            const newBands = {...prev};
            newBands[bandName] = newBands[bandName].map((band, bIdx) => {
                if (bIdx !== bandIdx) return band;

                const updatedElements = [...band.elements];
                // Apply grid snap if enabled
                let x = d.x;
                let y = d.y;

                if (elementGridSnap) {
                    x = Math.round(x / 5) * 5;
                    y = Math.round(y / 5) * 5;
                }

                updatedElements[elIdx] = {
                    ...updatedElements[elIdx],
                    x,
                    y
                };

                return {
                    ...band,
                    elements: updatedElements
                };
            });
            return newBands;
        });
    };

    // Element resize handler
    const handleElementResizeStop = (bandName, bandIdx, elIdx, ref, position) => {
        setBands(prev => {
            const newBands = {...prev};
            const band = newBands[bandName][bandIdx];

            // Get new dimensions
            let width = ref.offsetWidth;
            let height = ref.offsetHeight;

            // Apply grid snap if enabled
            if (elementGridSnap) {
                width = Math.round(width / 5) * 5;
                height = Math.round(height / 5) * 5;
            }

            // Update element dimensions and position
            newBands[bandName][bandIdx].elements[elIdx] = {
                ...band.elements[elIdx],
                width,
                height,
                x: position.x,
                y: position.y
            };

            // Update band height if element extends below current height
            const elemBottom = position.y + height;
            if (elemBottom > band.height) {
                newBands[bandName][bandIdx].height = elemBottom + 10; // Add padding
            }

            return newBands;
        });

        // Reset resize helper
        setResizeHelper({width: 0, height: 0});
    };

    // Update handleDropElement to auto-arrange new fields in detail band
    const handleDropElement = useCallback((type, bandName, bandIdx, offset) => {
        const bandDiv = document.getElementById(`band-${bandName}-${bandIdx}`);
        if (!bandDiv) return;

        const rect = bandDiv.getBoundingClientRect();
        let x = Math.round(offset.x - rect.left);
        let y = Math.round(offset.y - rect.top);

        // Apply grid snap if enabled
        if (elementGridSnap) {
            x = Math.round(x / 5) * 5;
            y = Math.round(y / 5) * 5;
        }

        setBands(prev => {
            const newBands = {...prev};
            const band = prev[bandName][bandIdx];

            // Set default dimensions based on band type and element type
            const defaultConfig = DEFAULT_FIELD_CONFIGS[bandName]?.[type];
            let defaultWidth = defaultConfig?.width || 120;
            let defaultHeight = defaultConfig?.height || 30;

            // Auto-position for columnHeader and detail bands
            if (AUTO_ARRANGE_BANDS.includes(bandName)) {
                const elementCount = band.elements.filter(e => e.type === type).length;

                // For column headers and detail fields, arrange horizontally
                if ((bandName === 'columnHeader' && type === 'staticText') ||
                    (bandName === 'detail' && type === 'textField')) {
                    const columnPositions = [0, 140, 280, 420];
                    x = columnPositions[elementCount % columnPositions.length];
                    y = 0;
                }

                // For title band, center large text and position logos
                if (bandName === 'title') {
                    if (type === 'image') {
                        // Left or right logo
                        x = elementCount % 2 === 0 ? 0 : 495;
                        y = 0;
                    } else if (type === 'staticText') {
                        // Center title text
                        x = 120;
                        y = 0;
                    }
                }
            }

            // Create element with appropriate properties
            const newElement = {
                type,
                id: `${bandName}-${type}-${Date.now()}`,
                x,
                y,
                width: defaultWidth,
                height: defaultHeight,
                text: getDefaultText(type, bandName, band),
                forecolor: bandName === 'columnHeader' ? '#FFFFFF' : '#000000',
                backgroundColor: bandName === 'columnHeader' ? '#343a40' :
                    bandName === 'detail' ? '#f8f9fa' : undefined,
                fontSize: bandName === 'title' ? 28 : 10,
                isBold: bandName === 'title' || bandName === 'columnHeader',
                textAlignment: bandName === 'title' || bandName === 'columnHeader' ? 'Center' : 'Left',
                verticalAlignment: 'Middle',
                imageExpr: type === 'image' ? (x < 200 ? '$P{logoLeft}' : '$P{logoRight}') : undefined,
                lineWidth: type === 'line' ? 1 : undefined,
                lineColor: type === 'line' ? '#000000' : undefined,
            };

            // Update band elements
            newBands[bandName] = newBands[bandName].map((b, bIdx) => {
                if (bIdx !== bandIdx) return b;

                const updatedElements = [...b.elements, newElement];
                const elemBottom = y + defaultHeight;
                const newHeight = Math.max(b.height, elemBottom + 10); // Add padding

                return {
                    ...b,
                    elements: updatedElements,
                    height: newHeight
                };
            });

            return newBands;
        });

        // Show success message
        setStatusMessage({text: `Added ${type} to ${BAND_LABELS[bandName]}`, type: 'success'});
        setTimeout(() => setStatusMessage(null), 2000);
    }, [elementGridSnap]);

    // Get default text for new elements
    const getDefaultText = (type, bandName, band) => {
        if (type === 'staticText') {
            if (bandName === 'title') return 'Employee Report';
            if (bandName === 'columnHeader') {
                const headers = ['Name', 'Address', 'Phone', 'Gender'];
                return headers[band.elements.filter(e => e.type === 'staticText').length % headers.length];
            }
            if (bandName === 'pageHeader') return 'Employee Details';
            if (bandName === 'pageFooter') return 'Page';
            if (bandName === 'summary') return 'Total Employees:';
            return 'Label';
        }

        if (type === 'textField') {
            if (bandName === 'detail') {
                // These must match the exact field names provided in your Java controller
                const fields = ['$F{name}', '$F{address}', '$F{phone}', '$F{gender}'];
                return fields[band.elements.filter(e => e.type === 'textField').length % fields.length];
            }
            if (bandName === 'pageFooter') return '$V{PAGE_NUMBER}';
            if (bandName === 'summary') return '$V{REPORT_COUNT}';
            // Change this default to prevent invalid field references
            return '""';  // Empty string instead of $F{field}
        }

        return '';
    };

    // Add an element via toolbar button click
    const handleAddElement = (type) => {
        const bandName = activeBand;
        const bandIdx = 0; // Always use first band for now

        // Default position in center of visible band area
        let x = 100;
        let y = 20;

        handleDropElement(type, bandName, bandIdx, {x: x + 50, y: y + 50});
    };

    // Column resizing helper functions
    const handleColumnResizeStart = (e, bandName, bandIdx, elIdx) => {
        e.preventDefault();
        e.stopPropagation();

        setResizing({
            bandName,
            bandIdx,
            elIdx,
            startX: e.clientX,
            startWidth: bands[bandName][bandIdx].elements[elIdx].width,
        });
    };

    useEffect(() => {
        if (!resizing) return;

        const handleMouseMove = (e) => {
            const delta = e.clientX - resizing.startX;
            const newWidth = Math.max(40, resizing.startWidth + delta);

            // Update temporary resize helper for visual feedback
            setResizeHelper({width: newWidth, height: 0});

            // Update actual element dimensions
            setBands(prev => {
                const newBands = {...prev};
                const band = newBands[resizing.bandName][resizing.bandIdx];
                band.elements[resizing.elIdx].width = newWidth;
                return newBands;
            });
        };

        const handleMouseUp = () => {
            setResizing(null);
            setResizeHelper({width: 0, height: 0});
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [resizing]);

    // Clear selection when clicking outside elements
    const handleModalBodyClick = (e) => {
        if (sidebarRef.current && sidebarRef.current.contains(e.target)) {
            // Click is inside the sidebar, do not clear selection
            return;
        }

        // Check if click is on a band header
        const bandHeaderClicked = e.target.classList &&
            (e.target.classList.contains('band-header') ||
                e.target.parentElement.classList.contains('band-header'));

        if (!bandHeaderClicked) {
            setSelectedElement(null);
        }
    };

    // Preview handler - shows the current design from the editor
    const handlePreview = async () => {
        setPreviewLoading(true);
        setPreviewUrl(null);
        
        try {
            // Generate JRXML from current bands state
            console.log("Generating JRXML from current bands state for preview:", bands);
            
            // Convert the current bands state to JRXML
            const savedJrxml = bandsToJrxml(bands);
            
            console.log("Using dynamically generated template for preview, length:", savedJrxml.length);
            console.log("First 200 chars:", savedJrxml.substring(0, 200));
            
            // Generate preview using the current design
            const previewResponse = await fetch('/api/employees/preview-live', {
                method: 'POST',
                headers: {'Content-Type': 'text/plain'},
                body: savedJrxml,
            });

            if (!previewResponse.ok) {
                throw new Error(`Server error: ${previewResponse.status} ${previewResponse.statusText}`);
            }

            const blob = await previewResponse.blob();
            const url = URL.createObjectURL(blob);
            setPreviewUrl(url);
            setShowPreview(true);
            
            // Set success message
            setStatusMessage({text: 'Preview of saved design generated successfully!', type: 'success'});
            
            // Auto-clear success message after 2 seconds
            setTimeout(() => setStatusMessage(null), 2000);
        } catch (err) {
            console.error("Failed to generate preview", err);
            setStatusMessage({text: 'Failed to generate preview: ' + err.message, type: 'danger'});
        } finally {
            setPreviewLoading(false);
        }
    };

    // Property editor for selected element
    const renderPropertyEditor = () => {
        if (!selectedElement) return null;

        const {bandName, bandIdx, elIdx} = selectedElement;
        const element = bands[bandName]?.[bandIdx]?.elements[elIdx];

        if (!element) return null;

        return (
            <Card className="mb-3">
                <Card.Header>
                    <div className="d-flex justify-content-between align-items-center">
                        <span>{element.type.charAt(0).toUpperCase() + element.type.slice(1)} Properties</span>
                        <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={handleDeleteElement}
                            title="Delete element (Delete)"
                        >
                            <i className="bi bi-trash"></i>
                        </Button>
                    </div>
                </Card.Header>
                <Card.Body>
                    {/* Position and Size */}
                    <Row>
                        <Col xs={6}>
                            <Form.Group className="mb-2">
                                <Form.Label>X Position</Form.Label>
                                <Form.Control
                                    type="number"
                                    min="0"
                                    value={element.x}
                                    onChange={e => {
                                        const value = parseInt(e.target.value) || 0;
                                        setBands(prev => {
                                            const newBands = {...prev};
                                            newBands[bandName][bandIdx].elements[elIdx].x = value;
                                            return newBands;
                                        });
                                    }}
                                />
                            </Form.Group>
                        </Col>
                        <Col xs={6}>
                            <Form.Group className="mb-2">
                                <Form.Label>Y Position</Form.Label>
                                <Form.Control
                                    type="number"
                                    min="0"
                                    value={element.y}
                                    onChange={e => {
                                        const value = parseInt(e.target.value) || 0;
                                        setBands(prev => {
                                            const newBands = {...prev};
                                            newBands[bandName][bandIdx].elements[elIdx].y = value;
                                            return newBands;
                                        });
                                    }}
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col xs={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Width</Form.Label>
                                <Form.Control
                                    type="number"
                                    min="10"
                                    value={element.width}
                                    onChange={e => {
                                        const value = parseInt(e.target.value) || 10;
                                        setBands(prev => {
                                            const newBands = {...prev};
                                            newBands[bandName][bandIdx].elements[elIdx].width = value;
                                            return newBands;
                                        });
                                    }}
                                />
                            </Form.Group>
                        </Col>
                        <Col xs={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Height</Form.Label>
                                <Form.Control
                                    type="number"
                                    min="1"
                                    value={element.height}
                                    onChange={e => {
                                        const value = parseInt(e.target.value) || 1;
                                        setBands(prev => {
                                            const newBands = {...prev};
                                            newBands[bandName][bandIdx].elements[elIdx].height = value;
                                            return newBands;
                                        });
                                    }}
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    {/* Element-specific properties */}
                    {(element.type === 'staticText' || element.type === 'textField') && (
                        <>
                            <Form.Group className="mb-3">
                                <Form.Label>Text</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={2}
                                    value={element.text}
                                    readOnly={element.type === 'textField' && bandName === 'detail'}
                                    disabled={element.type === 'textField' && bandName === 'detail'}
                                    onChange={e => {
                                        const value = e.target.value;
                                        setBands(prev => {
                                            const newBands = {...prev};
                                            newBands[bandName][bandIdx].elements[elIdx].text = value;
                                            return newBands;
                                        });
                                    }}
                                />
                                {element.type === 'textField' && bandName === 'detail' && (
                                    <Form.Text muted>Field variables cannot be edited directly.</Form.Text>
                                )}
                            </Form.Group>

                            <Row>
                                <Col xs={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Text Alignment</Form.Label>
                                        <Form.Select
                                            value={element.textAlignment || 'Left'}
                                            onChange={e => {
                                                const value = e.target.value;
                                                setBands(prev => {
                                                    const newBands = {...prev};
                                                    newBands[bandName][bandIdx].elements[elIdx].textAlignment = value;
                                                    return newBands;
                                                });
                                            }}
                                        >
                                            <option value="Left">Left</option>
                                            <option value="Center">Center</option>
                                            <option value="Right">Right</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col xs={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Vertical Alignment</Form.Label>
                                        <Form.Select
                                            value={element.verticalAlignment || 'Top'}
                                            onChange={e => {
                                                const value = e.target.value;
                                                setBands(prev => {
                                                    const newBands = {...prev};
                                                    newBands[bandName][bandIdx].elements[elIdx].verticalAlignment = value;
                                                    return newBands;
                                                });
                                            }}
                                        >
                                            <option value="Top">Top</option>
                                            <option value="Middle">Middle</option>
                                            <option value="Bottom">Bottom</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row>
                                <Col xs={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Font Size</Form.Label>
                                        <Form.Select
                                            value={element.fontSize || '12'}
                                            onChange={e => {
                                                const value = e.target.value;
                                                setBands(prev => {
                                                    const newBands = {...prev};
                                                    newBands[bandName][bandIdx].elements[elIdx].fontSize = value;
                                                    return newBands;
                                                });
                                            }}
                                        >
                                            <option value="8">8</option>
                                            <option value="10">10</option>
                                            <option value="12">12</option>
                                            <option value="14">14</option>
                                            <option value="16">16</option>
                                            <option value="18">18</option>
                                            <option value="20">20</option>
                                            <option value="24">24</option>
                                            <option value="28">28</option>
                                            <option value="36">36</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col xs={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Font Family</Form.Label>
                                        <Form.Select
                                            value={element.fontFamily || 'Arial'}
                                            onChange={e => {
                                                const value = e.target.value;
                                                setBands(prev => {
                                                    const newBands = {...prev};
                                                    newBands[bandName][bandIdx].elements[elIdx].fontFamily = value;
                                                    return newBands;
                                                });
                                            }}
                                        >
                                            <option value="Arial">Arial</option>
                                            <option value="Times New Roman">Times New Roman</option>
                                            <option value="Courier New">Courier New</option>
                                            <option value="Georgia">Georgia</option>
                                            <option value="Verdana">Verdana</option>
                                            <option value="Helvetica">Helvetica</option>
                                            <option value="SansSerif">SansSerif</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row>
                                <Col xs={12}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="me-2">Text Style</Form.Label>
                                        <Form.Check
                                            inline
                                            type="checkbox"
                                            label="Bold"
                                            checked={element.isBold || false}
                                            onChange={e => {
                                                const checked = e.target.checked;
                                                setBands(prev => {
                                                    const newBands = {...prev};
                                                    newBands[bandName][bandIdx].elements[elIdx].isBold = checked;
                                                    return newBands;
                                                });
                                            }}
                                        />
                                        <Form.Check
                                            inline
                                            type="checkbox"
                                            label="Italic"
                                            checked={element.isItalic || false}
                                            onChange={e => {
                                                const checked = e.target.checked;
                                                setBands(prev => {
                                                    const newBands = {...prev};
                                                    newBands[bandName][bandIdx].elements[elIdx].isItalic = checked;
                                                    return newBands;
                                                });
                                            }}
                                        />
                                        <Form.Check
                                            inline
                                            type="checkbox"
                                            label="Underline"
                                            checked={element.isUnderline || false}
                                            onChange={e => {
                                                const checked = e.target.checked;
                                                setBands(prev => {
                                                    const newBands = {...prev};
                                                    newBands[bandName][bandIdx].elements[elIdx].isUnderline = checked;
                                                    return newBands;
                                                });
                                            }}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Form.Group className="mb-3">
                                <Form.Label>Text Color</Form.Label>
                                <SketchPicker
                                    color={element.textColor || '#000000'}
                                    disableAlpha
                                    presetColors={['#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#00FFFF', '#FF00FF']}
                                    onChangeComplete={color => {
                                        setBands(prev => {
                                            const newBands = {...prev};
                                            newBands[bandName][bandIdx].elements[elIdx].textColor = color.hex;
                                            return newBands;
                                        });
                                    }}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Background Color</Form.Label>
                                <Form.Check
                                    type="checkbox"
                                    label="Enable Background"
                                    checked={!!element.backgroundColor}
                                    onChange={e => {
                                        const checked = e.target.checked;
                                        setBands(prev => {
                                            const newBands = {...prev};
                                            newBands[bandName][bandIdx].elements[elIdx].backgroundColor = checked ? '#FFFFFF' : undefined;
                                            return newBands;
                                        });
                                    }}
                                />
                                {element.backgroundColor && (
                                    <SketchPicker
                                        color={element.backgroundColor}
                                        disableAlpha
                                        presetColors={['#FFFFFF', '#F8F9FA', '#E9ECEF', '#DEE2E6', '#CED4DA', '#ADB5BD', '#6C757D', '#343A40']}
                                        onChangeComplete={color => {
                                            setBands(prev => {
                                                const newBands = {...prev};
                                                newBands[bandName][bandIdx].elements[elIdx].backgroundColor = color.hex;
                                                return newBands;
                                            });
                                        }}
                                    />
                                )}
                            </Form.Group>
                        </>
                    )}

                    {element.type === 'line' && (
                        <>
                            <Form.Group className="mb-3">
                                <Form.Label>Line Width</Form.Label>
                                <Form.Control
                                    type="number"
                                    min="0.1"
                                    step="0.1"
                                    value={element.lineWidth || 0.5}
                                    onChange={e => {
                                        const value = parseFloat(e.target.value) || 0.5;
                                        setBands(prev => {
                                            const newBands = {...prev};
                                            newBands[bandName][bandIdx].elements[elIdx].lineWidth = value;
                                            return newBands;
                                        });
                                    }}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Line Color</Form.Label>
                                <SketchPicker
                                    color={element.lineColor || '#000000'}
                                    disableAlpha
                                    presetColors={['#000000', '#333333', '#666666', '#999999', '#CCCCCC', '#FF0000', '#00FF00', '#0000FF']}
                                    onChangeComplete={color => {
                                        setBands(prev => {
                                            const newBands = {...prev};
                                            newBands[bandName][bandIdx].elements[elIdx].lineColor = color.hex;
                                            return newBands;
                                        });
                                    }}
                                />
                            </Form.Group>
                        </>
                    )}

                    {element.type === 'image' && (
                        <Form.Group className="mb-3">
                            <Form.Label>Image Source</Form.Label>
                            <Form.Select
                                value={element.imageExpr || ''}
                                onChange={e => {
                                    const value = e.target.value;
                                    setBands(prev => {
                                        const newBands = {...prev};
                                        newBands[bandName][bandIdx].elements[elIdx].imageExpr = value;
                                        return newBands;
                                    });
                                }}
                            >
                                <option value="">Select image source</option>
                                <option value="$P{logoLeft}">Left Logo ($P&#123;logoLeft&#125;)</option>
                                <option value="$P{logoRight}">Right Logo ($P&#123;logoRight&#125;)</option>
                            </Form.Select>
                        </Form.Group>
                    )}

                    {element.type === 'rectangle' && (
                        <Form.Group className="mb-3">
                            <Form.Label>Background Color</Form.Label>
                            <SketchPicker
                                color={element.backgroundColor || '#FFFFFF'}
                                disableAlpha
                                presetColors={['#FFFFFF', '#F8F9FA', '#E9ECEF', '#DEE2E6', '#CED4DA', '#ADB5BD', '#6C757D', '#343A40']}
                                onChangeComplete={color => {
                                    setBands(prev => {
                                        const newBands = {...prev};
                                        newBands[bandName][bandIdx].elements[elIdx].backgroundColor = color.hex;
                                        return newBands;
                                    });
                                }}
                            />
                        </Form.Group>
                    )}
                </Card.Body>
            </Card>
        );
    };

    // Band settings panel
    const renderBandSettings = () => {
        if (!activeBand || !bands[activeBand]?.[0]) return null;

        const band = bands[activeBand][0];

        return (
            <Card className="mb-3">
                <Card.Header>Band Settings</Card.Header>
                <Card.Body>
                    <Form.Group className="mb-3">
                        <Form.Label>Band Height</Form.Label>
                        <Form.Control
                            type="number"
                            min="20"
                            value={band.height || 60}
                            onChange={e => {
                                const value = parseInt(e.target.value) || 60;
                                setBands(prev => {
                                    const newBands = {...prev};
                                    newBands[activeBand][0].height = value;
                                    return newBands;
                                });
                            }}
                        />
                    </Form.Group>
                </Card.Body>
            </Card>
        );
    };

    // Toolbar settings panel
    const renderToolbarSettings = () => {
        return (
            <Card className="mb-3">
                <Card.Header>Settings</Card.Header>
                <Card.Body>
                    <Form.Group className="mb-3">
                        <Form.Check
                            type="switch"
                            id="grid-snap-switch"
                            label="Snap to Grid"
                            checked={elementGridSnap}
                            onChange={e => setElementGridSnap(e.target.checked)}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Check
                            type="switch"
                            id="show-grid-switch"
                            label="Show Grid Lines"
                            checked={showGridLines}
                            onChange={e => setShowGridLines(e.target.checked)}
                        />
                    </Form.Group>

                    <div className="d-grid gap-2">
                        <Button
                            onClick={handlePreview}
                            variant="primary"
                            disabled={previewLoading}
                            className="mb-2"
                        >
                            {previewLoading ? (
                                <>
                                    <Spinner
                                        as="span"
                                        animation="border"
                                        size="sm"
                                        role="status"
                                        aria-hidden="true"
                                        className="me-2"
                                    />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-eye me-2"></i>
                                    Preview Report
                                </>
                            )}
                        </Button>

                        <Button
                            onClick={handleSave}
                            variant="success"
                            disabled={saving}
                        >
                            {saving ? (
                                <>
                                    <Spinner
                                        as="span"
                                        animation="border"
                                        size="sm"
                                        role="status"
                                        aria-hidden="true"
                                        className="me-2"
                                    />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-save me-2"></i>
                                    Save Report
                                </>
                            )}
                        </Button>
                    </div>
                </Card.Body>
            </Card>
        );
    };

    // Render a single element
    const renderElement = (element, bandName, bandIdx, elIdx) => {
        const isSelected = selectedElement &&
            selectedElement.bandName === bandName &&
            selectedElement.bandIdx === bandIdx &&
            selectedElement.elIdx === elIdx;

        // Base style for selected elements
        const selectedStyle = isSelected ? {
            border: '2px solid #007bff',
            boxShadow: '0 0 0 1px rgba(0, 123, 255, 0.5)',
            zIndex: 3
        } : {};

        // For automated bands like columnHeader and detail
        if ((bandName === 'columnHeader' || bandName === 'detail') &&
            (element.type === 'staticText' || element.type === 'textField')) {
            return (
                <div
                    key={element.id}
                    style={{
                        width: element.width,
                        minWidth: 40,
                        height: element.height,
                        borderRight: elIdx < bands[bandName][bandIdx].elements.length - 1 ? '1px solid #000' : 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: bandName === 'columnHeader' ? 'center' : 'left',
                        color: element.textColor || (bandName === 'columnHeader' ? '#fff' : '#000'),
                        fontWeight: element.isBold ? 'bold' : 'normal',
                        fontStyle: element.isItalic ? 'italic' : 'normal',
                        textDecoration: element.isUnderline ? 'underline' : 'none',
                        fontSize: `${element.fontSize || 10}px`,
                        fontFamily: element.fontFamily || 'Arial',
                        background: element.backgroundColor || (bandName === 'columnHeader' ? '#343a40' : '#fff'),
                        textAlign: element.textAlignment?.toLowerCase() || (bandName === 'columnHeader' ? 'center' : 'left'),
                        paddingLeft: bandName === 'detail' ? 8 : 0,
                        position: 'relative',
                        cursor: 'pointer',
                        ...selectedStyle
                    }}
                    onClick={e => {
                        e.stopPropagation();
                        setSelectedElement({bandName, bandIdx, elIdx});
                    }}
                >
                    <span>{element.text}</span>

                    {/* Resizer handle for columns */}
                    {elIdx < bands[bandName][bandIdx].elements.length - 1 && (
                        <div
                            style={{
                                position: 'absolute',
                                right: 0,
                                top: 0,
                                width: 6,
                                height: '100%',
                                cursor: 'col-resize',
                                background: isSelected ? 'rgba(0, 123, 255, 0.3)' : 'transparent',
                                zIndex: 4,
                            }}
                            onMouseDown={e => handleColumnResizeStart(e, bandName, bandIdx, elIdx)}
                        />
                    )}
                </div>
            );
        }

        // Render image elements
        if (element.type === 'image') {
            return (
                <Rnd
                    key={element.id}
                    size={{width: element.width, height: element.height}}
                    position={{x: element.x, y: element.y}}
                    onDragStop={(e, d) => handleElementDragStop(bandName, bandIdx, elIdx, d)}
                    onResizeStop={(e, direction, ref, delta, position) => {
                        handleElementResizeStop(bandName, bandIdx, elIdx, ref, position);
                    }}
                    bounds="parent"
                    style={{
                        zIndex: isSelected ? 10 : 2,
                        cursor: 'move',
                        ...selectedStyle
                    }}
                    onClick={e => {
                        e.stopPropagation();
                        setSelectedElement({bandName, bandIdx, elIdx});
                    }}
                    resizeGrid={elementGridSnap ? [5, 5] : [1, 1]}
                    dragGrid={elementGridSnap ? [5, 5] : [1, 1]}
                >
                    <img
                        src={element.imageExpr && element.imageExpr.includes('logoRight')
                            ? '/organization_logo.png'
                            : element.imageExpr && element.imageExpr.includes('logoLeft')
                                ? '/logo.png'
                                : 'https://via.placeholder.com/60?text=Logo'}
                        alt="Logo"
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                            background: '#eee',
                            border: isSelected ? '1px dashed #007bff' : 'none'
                        }}
                        onError={e => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/60?text=Logo';
                        }}
                    />
                </Rnd>
            );
        }

        // Render line elements
        if (element.type === 'line') {
            return (
                <Rnd
                    key={element.id}
                    size={{width: element.width, height: element.height}}
                    position={{x: element.x, y: element.y}}
                    onDragStop={(e, d) => handleElementDragStop(bandName, bandIdx, elIdx, d)}
                    onResizeStop={(e, direction, ref, delta, position) => {
                        handleElementResizeStop(bandName, bandIdx, elIdx, ref, position);
                    }}
                    bounds="parent"
                    style={{
                        zIndex: isSelected ? 10 : 1,
                        cursor: 'move',
                        ...selectedStyle
                    }}
                    onClick={e => {
                        e.stopPropagation();
                        setSelectedElement({bandName, bandIdx, elIdx});
                    }}
                    resizeGrid={elementGridSnap ? [5, 5] : [1, 1]}
                    dragGrid={elementGridSnap ? [5, 5] : [1, 1]}
                >
                    <div
                        style={{
                            width: '100%',
                            height: '100%',
                            background: element.lineColor || '#000',
                            border: isSelected ? '1px dashed #007bff' : 'none',
                            boxSizing: 'border-box'
                        }}
                    />
                </Rnd>
            );
        }

        // Render rectangle elements
        if (element.type === 'rectangle') {
            return (
                <Rnd
                    key={element.id}
                    size={{width: element.width, height: element.height}}
                    position={{x: element.x, y: element.y}}
                    onDragStop={(e, d) => handleElementDragStop(bandName, bandIdx, elIdx, d)}
                    onResizeStop={(e, direction, ref, delta, position) => {
                        handleElementResizeStop(bandName, bandIdx, elIdx, ref, position);
                    }}
                    bounds="parent"
                    style={{
                        zIndex: isSelected ? 10 : 1,
                        cursor: 'move',
                        background: element.backgroundColor || 'transparent',
                        border: '1px solid #000',
                        ...selectedStyle
                    }}
                    onClick={e => {
                        e.stopPropagation();
                        setSelectedElement({bandName, bandIdx, elIdx});
                    }}
                    resizeGrid={elementGridSnap ? [5, 5] : [1, 1]}
                    dragGrid={elementGridSnap ? [5, 5] : [1, 1]}
                />
            );
        }

        // Default renderer for other element types (staticText, textField in non-automated bands)
        return (
            <Rnd
                key={element.id}
                size={{width: element.width, height: element.height}}
                position={{x: element.x, y: element.y}}
                onDragStop={(e, d) => handleElementDragStop(bandName, bandIdx, elIdx, d)}
                onResizeStop={(e, direction, ref, delta, position) => {
                    handleElementResizeStop(bandName, bandIdx, elIdx, ref, position);
                }}
                bounds="parent"
                style={{
                    border: '1px solid #ccc',
                    background: element.backgroundColor || 'transparent',
                    color: element.textColor || '#000',
                    fontSize: `${element.fontSize || 12}px`,
                    fontFamily: element.fontFamily || 'Arial',
                    fontWeight: element.isBold ? 'bold' : 'normal',
                    fontStyle: element.isItalic ? 'italic' : 'normal',
                    textDecoration: element.isUnderline ? 'underline' : 'none',
                    display: 'flex',
                    alignItems: (element.verticalAlignment || 'Middle').toLowerCase() === 'middle' ? 'center' :
                        (element.verticalAlignment || '').toLowerCase() === 'bottom' ? 'flex-end' : 'flex-start',
                    justifyContent: (element.textAlignment || 'Left').toLowerCase() === 'center' ? 'center' :
                        (element.textAlignment || '').toLowerCase() === 'right' ? 'flex-end' : 'flex-start',
                    cursor: 'move',
                    padding: '4px 8px',
                    ...selectedStyle
                }}
                onClick={e => {
                    e.stopPropagation();
                    setSelectedElement({bandName, bandIdx, elIdx});
                }}
                resizeGrid={elementGridSnap ? [5, 5] : [1, 1]}
                dragGrid={elementGridSnap ? [5, 5] : [1, 1]}
            >
                {(element.type === 'staticText' || element.type === 'textField') && (
                    <span>{element.text}</span>
                )}
            </Rnd>
        );
    };

    // Render entire band
    const renderBand = (bandName, bandIdx) => {
        const band = bands[bandName]?.[bandIdx];
        if (!band) return null;

        // Debug output to see what elements are in the title band
        if (bandName === 'title') {
            console.log(`Title band elements (${band.elements.length}):`);
            band.elements.forEach((el, idx) => {
                console.log(`Element ${idx}: type=${el.type}, x=${el.x}, y=${el.y}, width=${el.width}, height=${el.height}, imageExpr=${el.imageExpr || 'none'}`);
            });
        }

        const isColumnHeaderOrDetail = bandName === 'columnHeader' || bandName === 'detail';
        const isTitleBand = bandName === 'title';

        return (
            <BandDropArea
                key={`${bandName}-${bandIdx}`}
                bandName={bandName}
                bandIdx={bandIdx}
                onDropElement={handleDropElement}
            >
                <div
                    id={`band-${bandName}-${bandIdx}`}
                    style={{
                        position: 'relative',
                        minHeight: band.height || 60,
                        background: showGridLines ? 'linear-gradient(to right, rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.03) 1px, transparent 1px)' : 'transparent',
                        backgroundSize: showGridLines ? '10px 10px' : 'auto',
                    }}
                    onClick={e => e.stopPropagation()}
                >
                    <div
                        className="band-header"
                        style={{
                            fontWeight: 'bold',
                            fontSize: 13,
                            color: activeBand === bandName ? '#007bff' : '#888',
                            marginBottom: 2,
                            padding: '2px 4px',
                            borderBottom: activeBand === bandName ? '2px solid #007bff' : '1px solid #eee',
                            cursor: 'pointer'
                        }}
                        onClick={() => setActiveBand(bandName)}
                    >
                        {BAND_LABELS[bandName]}
                    </div>

                    {/* Special layout for title band */}
                    {isTitleBand ? (
                        <div style={{
                            position: 'relative',
                            width: 555,
                            height: band.height || 60,
                            margin: '0 auto',
                            border: '1px dashed #ccc',
                            background: '#fff',
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '5px'
                        }}>
                            {band.elements.length === 0 ? (
                                <div
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#777'
                                    }}
                                >
                                    Drop elements here
                                </div>
                            ) : (
                                <>
                                    {/* Left Logo - Find the first image element with logoLeft */}
                                    {band.elements.find(el => el.type === 'image' && el.imageExpr && el.imageExpr.includes('logoLeft')) && (
                                        <div style={{ width: '60px', height: '60px', flex: '0 0 auto' }}>
                                            <img 
                                                src="/logo.png" 
                                                alt="Left Logo" 
                                                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const elIdx = band.elements.findIndex(el => el.type === 'image' && el.imageExpr && el.imageExpr.includes('logoLeft'));
                                                    if (elIdx >= 0) {
                                                        setSelectedElement({bandName, bandIdx, elIdx});
                                                    }
                                                }}
                                            />
                                        </div>
                                    )}
                                    
                                    {/* Title Text - Find the first staticText element */}
                                    {band.elements.find(el => el.type === 'staticText') && (
                                        <div 
                                            style={{ 
                                                flex: '1 1 auto', 
                                                textAlign: 'center',
                                                fontSize: '28px',
                                                fontWeight: 'bold',
                                                padding: '0 10px'
                                            }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const elIdx = band.elements.findIndex(el => el.type === 'staticText');
                                                if (elIdx >= 0) {
                                                    setSelectedElement({bandName, bandIdx, elIdx});
                                                }
                                            }}
                                        >
                                            {band.elements.find(el => el.type === 'staticText')?.text || 'Employee Report'}
                                        </div>
                                    )}
                                    
                                    {/* Right Logo - Find the first image element with logoRight */}
                                    {band.elements.find(el => el.type === 'image' && el.imageExpr && el.imageExpr.includes('logoRight')) && (
                                        <div style={{ width: '60px', height: '60px', flex: '0 0 auto' }}>
                                            <img 
                                                src="/organization_logo.png" 
                                                alt="Right Logo" 
                                                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const elIdx = band.elements.findIndex(el => el.type === 'image' && el.imageExpr && el.imageExpr.includes('logoRight'));
                                                    if (elIdx >= 0) {
                                                        setSelectedElement({bandName, bandIdx, elIdx});
                                                    }
                                                }}
                                            />
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    ) : isColumnHeaderOrDetail ? (
                        <div style={{
                            display: 'flex',
                            flexDirection: 'row',
                            width: 555,
                            margin: '0 auto',
                            background: bandName === 'columnHeader' ? '#343a40' : '#fff',
                            border: '1px solid #000',
                            height: band.height || 25,
                        }}>
                            {band.elements.length === 0 ? (
                                <div
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#777'
                                    }}
                                >
                                    Drop elements here
                                </div>
                            ) : (
                                band.elements.map((el, elIdx) => renderElement(el, bandName, bandIdx, elIdx))
                            )}
                        </div>
                    ) : (
                        <div style={{
                            position: 'relative',
                            width: 555,
                            height: band.height || 60,
                            margin: '0 auto',
                            border: '1px dashed #ccc',
                            background: '#fff',
                        }}>
                            {band.elements.length === 0 ? (
                                <div
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#777'
                                    }}
                                >
                                    Drop elements here
                                </div>
                            ) : (
                                band.elements.map((el, elIdx) => renderElement(el, bandName, bandIdx, elIdx))
                            )}
                        </div>
                    )}
                </div>
            </BandDropArea>
        );
    };

    // Main component render
    return (
        <>
            <Button
                variant="primary"
                onClick={handleShow}
                disabled={loadingDesign}
            >
                {loadingDesign ? (
                    <>
                        <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                            className="me-2"
                        />
                        Loading...
                    </>
                ) : (
                    <>
                        <i className="bi bi-pencil-square me-2"></i>
                        Visual Report Editor
                    </>
                )}
            </Button>

            <Modal
                show={show}
                onHide={handleClose}
                size="xl"
                backdrop="static"
                keyboard={false}
                fullscreen={showPreview}
            >
                <Modal.Header closeButton>
                    <Modal.Title>
                        <i className="bi bi-file-earmark-pdf me-2"></i>
                         Visual Report Editor
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body
                    style={{position: 'relative', padding: 0, height: showPreview ? 'calc(100vh - 120px)' : '700px'}}
                    onClick={handleModalBodyClick}
                >
                    {/* Status message */}
                    {statusMessage && (
                        <Alert
                            variant={statusMessage.type}
                            style={{
                                position: 'fixed',
                                top: '10px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                zIndex: 1050,
                                padding: '8px 16px',
                                boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
                            }}
                            dismissible
                            onClose={() => setStatusMessage(null)}
                        >
                            {statusMessage.text}
                        </Alert>
                    )}

                    {showPreview ? (
                        <div className="h-100 d-flex flex-column">
                            <div className="bg-light border-bottom p-2 mb-2 d-flex justify-content-between">
                                <h5 className="mb-0 d-flex align-items-center">
                                    <i className="bi bi-eye me-2"></i>
                                    Report Preview
                                </h5>
                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={() => setShowPreview(false)}
                                >
                                    <i className="bi bi-pencil-square me-2"></i>
                                    Back to Editor
                                </Button>
                            </div>

                            {previewLoading ? (
                                <div className="d-flex justify-content-center align-items-center flex-grow-1">
                                    <Spinner animation="border" variant="primary"/>
                                    <span className="ms-2">Generating preview with your latest changes...</span>
                                </div>
                            ) : previewUrl ? (
                                <div className="d-flex flex-column h-100">
                                    <div className="bg-light p-2 border-bottom d-flex justify-content-between align-items-center">
                                        <span className="text-muted">
                                            <i className="bi bi-info-circle me-2"></i>
                                            This preview shows your saved design with actual employee data from the database
                                        </span>
                                        <a
                                            href={previewUrl}
                                            download="employee_report_preview.pdf"
                                            className="btn btn-sm btn-outline-primary"
                                        >
                                            <i className="bi bi-download me-2"></i>
                                            Download PDF
                                        </a>
                                    </div>
                                    <object
                                        data={previewUrl}
                                        type="application/pdf"
                                        width="100%"
                                        height="100%"
                                        className="flex-grow-1"
                                    >
                                        <div className="alert alert-warning m-3">
                                            <h4>PDF preview is not supported in this browser</h4>
                                            <p>Please download the PDF to view it.</p>
                                            <a
                                                href={previewUrl}
                                                download="employee_report_preview.pdf"
                                                className="btn btn-primary"
                                            >
                                                <i className="bi bi-download me-2"></i>
                                                Download PDF
                                            </a>
                                        </div>
                                    </object>
                                </div>
                            ) : (
                                <div className="alert alert-warning m-3">
                                    <h4>No preview available</h4>
                                    <p>Click "Preview Saved Design" to see your report with actual employee data from the database. Make sure to save your changes first if you want to see them in the preview.</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <DndProvider backend={HTML5Backend}>
                            <Row className="g-0 h-100">
                                {/* Left sidebar */}
                                <Col md={3} className="border-end" style={{height: '100%', overflowY: 'auto'}}>
                                    <div className="p-2" ref={sidebarRef}>
                                        <ElementsToolbar onAddElement={handleAddElement}/>

                                        {selectedElement ? renderPropertyEditor() : renderBandSettings()}

                                        {renderToolbarSettings()}

                                        <Card className="mb-3">
                                            <Card.Header>Keyboard Shortcuts</Card.Header>
                                            <Card.Body>
                                                <table className="table table-sm">
                                                    <tbody>
                                                    <tr>
                                                        <td>Delete</td>
                                                        <td>Delete element</td>
                                                    </tr>
                                                    <tr>
                                                        <td>Ctrl+C</td>
                                                        <td>Copy element</td>
                                                    </tr>
                                                    <tr>
                                                        <td>Ctrl+V</td>
                                                        <td>Paste element</td>
                                                    </tr>
                                                    <tr>
                                                        <td>Arrow keys</td>
                                                        <td>Move element by 1px</td>
                                                    </tr>
                                                    <tr>
                                                        <td>Shift+Arrow</td>
                                                        <td>Move by 10px</td>
                                                    </tr>
                                                    <tr>
                                                        <td>Ctrl+G</td>
                                                        <td>Toggle grid</td>
                                                    </tr>
                                                    </tbody>
                                                </table>
                                            </Card.Body>
                                        </Card>
                                    </div>
                                </Col>

                                {/* Main editor area */}
                                <Col md={9} style={{height: '100%', overflowY: 'auto'}}>
                                    <div className="p-2">
                                        {/* Band tabs */}
                                        <Nav
                                            variant="tabs"
                                            activeKey={activeBand}
                                            onSelect={bandName => setActiveBand(bandName)}
                                            className="mb-3"
                                        >
                                            {Object.keys(BAND_LABELS).map(bandName => (
                                                <Nav.Item key={bandName}>
                                                    <Nav.Link 
                                                        eventKey={bandName}
                                                        style={{
                                                            fontWeight: bandName === 'title' ? 'bold' : 'normal',
                                                            color: bandName === 'title' ? '#007bff' : ''
                                                        }}
                                                    >
                                                        {BAND_LABELS[bandName]}
                                                    </Nav.Link>
                                                </Nav.Item>
                                            ))}
                                        </Nav>

                                        {/* Render all bands */}
                                        <div
                                            style={{
                                                position: 'relative',
                                                padding: '10px 0',
                                                backgroundColor: '#f8f9fa',
                                                border: '1px solid #dee2e6',
                                                borderRadius: '0 0 0.25rem 0.25rem',
                                            }}
                                        >
                                            {Object.keys(BAND_LABELS).map(bandName => (
                                                <div 
                                                    key={bandName} 
                                                    style={{
                                                        display: bandName === activeBand ? 'block' : 'none'
                                                    }}
                                                >
                                                    {renderBand(bandName, 0)}
                                                </div>
                                            ))}
                                        </div>

                                        {/* Developer section for JRXML preview */}
                                        <div className="mt-4">
                                            <Button
                                                variant="outline-secondary"
                                                size="sm"
                                                className="mb-2"
                                                onClick={() => {
                                                    document.getElementById('jrxml-preview').style.display =
                                                        document.getElementById('jrxml-preview').style.display === 'none' ? 'block' : 'none';
                                                }}
                                            >
                                                <i className="bi bi-code-slash me-2"></i>
                                                Toggle JRXML Preview
                                            </Button>
                                            <pre
                                                id="jrxml-preview"
                                                style={{
                                                    display: 'none',
                                                    maxHeight: '300px',
                                                    overflow: 'auto',
                                                    fontSize: '12px',
                                                    backgroundColor: '#f5f5f5',
                                                    padding: '10px',
                                                    border: '1px solid #ddd'
                                                }}
                                            >
                            {bandsToJrxml(bands)}
                          </pre>
                                        </div>
                                    </div>
                                </Col>
                            </Row>
                        </DndProvider>
                    )}
                </Modal.Body>

                <Modal.Footer className="d-flex justify-content-between">
                    <div>
                        <Button
                            variant="secondary"
                            onClick={handleClose}
                            className="me-2"
                        >
                            <i className="bi bi-x-circle me-2"></i>
                            Close
                        </Button>

                        <Button
                            variant="success"
                            onClick={handleSave}
                            disabled={saving}
                        >
                            {saving ? (
                                <>
                                    <Spinner
                                        as="span"
                                        animation="border"
                                        size="sm"
                                        role="status"
                                        aria-hidden="true"
                                        className="me-2"
                                    />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-save me-2"></i>
                                    Save Design
                                </>
                            )}
                        </Button>
                    </div>

                    <div>
                        <Button
                            variant="primary"
                            onClick={handlePreview}
                            disabled={previewLoading}
                        >
                            {previewLoading ? (
                                <>
                                    <Spinner
                                        as="span"
                                        animation="border"
                                        size="sm"
                                        role="status"
                                        aria-hidden="true"
                                        className="me-2"
                                    />
                                    Loading Saved Design with Actual Employee Data...
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-eye me-2"></i>
                                    Preview Saved Design
                                </>
                            )}
                        </Button>
                    </div>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default ReportVisualEditor;