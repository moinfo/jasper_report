package com.example.demo.service;

import com.example.demo.entity.Employee;
import com.example.demo.entity.ReportDesign;
import com.example.demo.repository.EmployeeRepository;
import com.example.demo.repository.ReportDesignRepository;
import net.sf.jasperreports.engine.*;
import net.sf.jasperreports.engine.data.JRBeanCollectionDataSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StreamUtils;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class EmployeeReportService {
    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private ReportDesignRepository reportDesignRepository;

    public String getReportDesign() throws Exception {
        System.out.println("Getting report design from database...");
        
        // First try to get from database
        Optional<ReportDesign> existingDesign = reportDesignRepository.findByReportName("employee_report");
        if (existingDesign.isPresent()) {
            ReportDesign design = existingDesign.get();
            System.out.println("Found design in database with ID: " + design.getId());
            System.out.println("Design content length: " + design.getDesignContent().length());
            
            // Validate that the content is not empty
            if (design.getDesignContent() == null || design.getDesignContent().isBlank()) {
                System.err.println("WARNING: Design found in database but content is empty!");
            } else {
                return design.getDesignContent();
            }
        } else {
            System.out.println("No design found in database, loading default template");
        }

        // If not in database or content is empty, get from classpath
        try (InputStream reportStream = new ClassPathResource("employee_report.jrxml").getInputStream()) {
            String defaultDesign = StreamUtils.copyToString(reportStream, StandardCharsets.UTF_8);
            System.out.println("Loaded default design from classpath, length: " + defaultDesign.length());
            
            // Save default design to database
            ReportDesign reportDesign = new ReportDesign();
            reportDesign.setReportName("employee_report");
            reportDesign.setDesignContent(defaultDesign);
            
            ReportDesign savedDesign = reportDesignRepository.saveAndFlush(reportDesign);
            System.out.println("Saved default design to database with ID: " + savedDesign.getId());
            
            return defaultDesign;
        }
    }

    public void saveReportDesign(String designContent) {
        try {
            System.out.println("Saving design content with length: " + designContent.length());
            System.out.println("First 100 chars: " + designContent.substring(0, Math.min(100, designContent.length())));
            
            // Try to find existing design
            Optional<ReportDesign> existingDesignOpt = reportDesignRepository.findByReportName("employee_report");
            
            ReportDesign reportDesign;
            if (existingDesignOpt.isPresent()) {
                System.out.println("Found existing design with ID: " + existingDesignOpt.get().getId());
                reportDesign = existingDesignOpt.get();
            } else {
                System.out.println("Creating new report design entity");
                reportDesign = new ReportDesign();
                reportDesign.setReportName("employee_report");
            }
            
            // Set content and save
            reportDesign.setDesignContent(designContent);
            
            // Ensure content is set properly
            System.out.println("Content set in entity, length: " + reportDesign.getDesignContent().length());
            
            // Save and flush to ensure immediate persistence
            ReportDesign savedDesign = reportDesignRepository.saveAndFlush(reportDesign);
            
            // Log success information
            System.out.println("Saved design with ID: " + savedDesign.getId());
            System.out.println("Saved content length: " + savedDesign.getDesignContent().length());
            
            // Verify saved design by immediately retrieving it
            Optional<ReportDesign> verifyDesign = reportDesignRepository.findById(savedDesign.getId());
            if (verifyDesign.isPresent()) {
                System.out.println("Verification successful - design found in database");
                System.out.println("Verified content length: " + verifyDesign.get().getDesignContent().length());
            } else {
                System.err.println("WARNING: Could not verify design was saved - not found in database!!!");
            }
        } catch (Exception e) {
            System.err.println("Error saving report design: " + e.getMessage());
            e.printStackTrace();
            throw e; // rethrow to notify the controller
        }
    }

    public byte[] exportEmployeeReport() throws Exception {
        List<Employee> employees = employeeRepository.findAll();
        JRBeanCollectionDataSource dataSource = new JRBeanCollectionDataSource(employees);
        Map<String, Object> parameters = new HashMap<>();
        parameters.put("createdBy", "Jasper Report System");

        // Get design from database
        String designContent = getReportDesign();
        JasperReport jasperReport = JasperCompileManager.compileReport(
                new ByteArrayInputStream(designContent.getBytes(StandardCharsets.UTF_8))
        );

        // Don't close these streams - let JasperReports handle them
        InputStream logoLeftStream = new ClassPathResource("logo.png").getInputStream();
        InputStream logoRightStream = new ClassPathResource("organization_logo.png").getInputStream();
        parameters.put("logoLeft", logoLeftStream);
        parameters.put("logoRight", logoRightStream);

        JasperPrint jasperPrint = JasperFillManager.fillReport(jasperReport, parameters, dataSource);
        byte[] pdfBytes = JasperExportManager.exportReportToPdf(jasperPrint);

        // Close streams after PDF generation
        logoLeftStream.close();
        logoRightStream.close();

        return pdfBytes;
    }
}