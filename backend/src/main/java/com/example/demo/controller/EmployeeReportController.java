package com.example.demo.controller;

import com.example.demo.service.EmployeeReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reports")
public class EmployeeReportController {
    @Autowired
    private EmployeeReportService employeeReportService;

    @GetMapping("/employees/pdf")
    public ResponseEntity<byte[]> downloadEmployeeReport() {
        try {
            byte[] pdf = employeeReportService.exportEmployeeReport();
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=employee_report.pdf")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(pdf);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/employees/preview")
    public ResponseEntity<String> previewReportDesign() {
        try {
            String jrxmlContent = employeeReportService.getReportDesign();
            return ResponseEntity.ok()
                    .contentType(MediaType.TEXT_XML)
                    .body(jrxmlContent);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
} 