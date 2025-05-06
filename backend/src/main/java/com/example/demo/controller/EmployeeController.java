package com.example.demo.controller;

import com.example.demo.entity.Employee;
import com.example.demo.service.EmployeeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import net.sf.jasperreports.engine.*;
import net.sf.jasperreports.engine.data.JRBeanCollectionDataSource;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.util.*;

@RestController
@RequestMapping("/api/employees")
public class EmployeeController {

    @Autowired
    private EmployeeService employeeService;

    @GetMapping
    public List<Employee> getAllEmployees() {
        return employeeService.getAllEmployees();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Employee> getEmployeeById(@PathVariable Long id) {
        return employeeService.getEmployeeById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Employee createEmployee(@RequestBody Employee employee) {
        return employeeService.createEmployee(employee);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Employee> updateEmployee(@PathVariable Long id, @RequestBody Employee employeeDetails) {
        try {
            Employee updatedEmployee = employeeService.updateEmployee(id, employeeDetails);
            return ResponseEntity.ok(updatedEmployee);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEmployee(@PathVariable Long id) {
        try {
            employeeService.deleteEmployee(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/preview-live")
    public ResponseEntity<byte[]> previewLive(@RequestBody String jrxml) {
        try {
            JasperReport jasperReport = JasperCompileManager.compileReport(new ByteArrayInputStream(jrxml.getBytes()));

            // Add parameters for logos
            Map<String, Object> params = new HashMap<>();
            
            // Load logo images from resources
            InputStream logoLeftStream = getClass().getResourceAsStream("/logo.png");
            InputStream logoRightStream = getClass().getResourceAsStream("/organization_logo.png");
            
            params.put("logoLeft", logoLeftStream);
            params.put("logoRight", logoRightStream);

            // Get real employee data from the database
            List<Employee> employees = employeeService.getAllEmployees();
            
            // If no data exists, add some sample data for better visualization
            if (employees.isEmpty()) {
                Employee sample1 = new Employee();
                sample1.setName("John Smith");
                sample1.setAddress("123 Main Street");
                sample1.setPhone("555-1234");
                sample1.setGender("Male");
                
                Employee sample2 = new Employee();
                sample2.setName("Jane Doe");
                sample2.setAddress("456 Oak Avenue");
                sample2.setPhone("555-5678");
                sample2.setGender("Female");
                
                employees.add(sample1);
                employees.add(sample2);
            }
            
            // Use actual Employee objects for better field mapping
            JRBeanCollectionDataSource dataSource = new JRBeanCollectionDataSource(employees);

            JasperPrint jasperPrint = JasperFillManager.fillReport(jasperReport, params, dataSource);

            ByteArrayOutputStream pdfStream = new ByteArrayOutputStream();
            JasperExportManager.exportReportToPdfStream(jasperPrint, pdfStream);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=preview.pdf")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(pdfStream.toByteArray());

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }
} 