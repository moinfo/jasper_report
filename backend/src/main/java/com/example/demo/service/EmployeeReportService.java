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
        // First try to get from database
        Optional<ReportDesign> existingDesign = reportDesignRepository.findByReportName("employee_report");
        if (existingDesign.isPresent()) {
            return existingDesign.get().getDesignContent();
        }

        // If not in database, get from classpath
        try (InputStream reportStream = new ClassPathResource("employee_report.jrxml").getInputStream()) {
            String defaultDesign = StreamUtils.copyToString(reportStream, StandardCharsets.UTF_8);
            
            // Save default design to database
            ReportDesign reportDesign = new ReportDesign();
            reportDesign.setReportName("employee_report");
            reportDesign.setDesignContent(defaultDesign);
            reportDesignRepository.save(reportDesign);
            
            return defaultDesign;
        }
    }

    public void saveReportDesign(String designContent) {
        ReportDesign reportDesign = reportDesignRepository.findByReportName("employee_report")
                .orElse(new ReportDesign());
        
        reportDesign.setReportName("employee_report");
        reportDesign.setDesignContent(designContent);
        reportDesignRepository.save(reportDesign);
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