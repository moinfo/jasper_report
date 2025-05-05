package com.example.demo.repository;

import com.example.demo.entity.ReportTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReportTemplateRepository extends JpaRepository<ReportTemplate, Long> {
    List<ReportTemplate> findByReportType(String reportType);
    Optional<ReportTemplate> findByReportTypeAndIsActiveTrue(String reportType);
} 