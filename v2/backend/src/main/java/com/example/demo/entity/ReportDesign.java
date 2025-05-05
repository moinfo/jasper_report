package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "report_designs")
@Data
public class ReportDesign {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "report_name", nullable = false, unique = true)
    private String reportName;

    @Column(name = "design_content", columnDefinition = "TEXT", nullable = false)
    private String designContent;

    @Column(name = "last_modified")
    private java.sql.Timestamp lastModified;

    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        lastModified = new java.sql.Timestamp(System.currentTimeMillis());
    }
} 