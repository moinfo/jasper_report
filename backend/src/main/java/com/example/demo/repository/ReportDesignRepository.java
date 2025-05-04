package com.example.demo.repository;

import com.example.demo.entity.ReportDesign;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ReportDesignRepository extends JpaRepository<ReportDesign, Long> {
    Optional<ReportDesign> findByReportName(String reportName);
} 