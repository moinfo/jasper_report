package com.example.demo.service;

import com.example.demo.entity.Employee;
import com.example.demo.repository.EmployeeRepository;
import net.sf.jasperreports.engine.*;
import net.sf.jasperreports.engine.data.JRBeanCollectionDataSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StreamUtils;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class EmployeeReportService {
    @Autowired
    private EmployeeRepository employeeRepository;

    public String getReportDesign() throws Exception {
        try (InputStream reportStream = new ClassPathResource("employee_report.jrxml").getInputStream()) {
            return StreamUtils.copyToString(reportStream, StandardCharsets.UTF_8);
        }
    }

    public byte[] exportEmployeeReport() throws Exception {
        List<Employee> employees = employeeRepository.findAll();
        JRBeanCollectionDataSource dataSource = new JRBeanCollectionDataSource(employees);
        Map<String, Object> parameters = new HashMap<>();
        parameters.put("createdBy", "Jasper Report System");

        // Don't close these streams - let JasperReports handle them
        InputStream logoLeftStream = new ClassPathResource("logo.png").getInputStream();
        InputStream logoRightStream = new ClassPathResource("organization_logo.png").getInputStream();
        parameters.put("logoLeft", logoLeftStream);
        parameters.put("logoRight", logoRightStream);

        InputStream reportStream = new ClassPathResource("employee_report.jrxml").getInputStream();
        JasperReport jasperReport = JasperCompileManager.compileReport(reportStream);
        JasperPrint jasperPrint = JasperFillManager.fillReport(jasperReport, parameters, dataSource);
        byte[] pdfBytes = JasperExportManager.exportReportToPdf(jasperPrint);

        // Close streams after PDF generation
        logoLeftStream.close();
        logoRightStream.close();
        reportStream.close();

        return pdfBytes;
    }
}