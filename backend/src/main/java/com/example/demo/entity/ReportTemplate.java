package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "report_templates")
@Data
public class ReportTemplate {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String jrxmlContent;

    @Column(nullable = false)
    private String reportType; // e.g., "employee_report"

    @Column(nullable = false)
    private boolean isActive = true;

    @Column
    private String description;
} 