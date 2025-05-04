package com.example.demo.service;

import com.example.demo.entity.ReportTemplate;
import com.example.demo.repository.ReportTemplateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class ReportTemplateService {
    @Autowired
    private ReportTemplateRepository templateRepository;

    public List<ReportTemplate> getAllTemplates() {
        return templateRepository.findAll();
    }

    public List<ReportTemplate> getTemplatesByType(String reportType) {
        return templateRepository.findByReportType(reportType);
    }

    public Optional<ReportTemplate> getActiveTemplate(String reportType) {
        return templateRepository.findByReportTypeAndIsActiveTrue(reportType);
    }

    @Transactional
    public ReportTemplate saveTemplate(ReportTemplate template) {
        // If this template is being set as active, deactivate other templates of the same type
        if (template.isActive()) {
            List<ReportTemplate> existingTemplates = templateRepository.findByReportType(template.getReportType());
            existingTemplates.forEach(t -> {
                t.setActive(false);
                templateRepository.save(t);
            });
        }
        return templateRepository.save(template);
    }

    @Transactional
    public void deleteTemplate(Long id) {
        templateRepository.deleteById(id);
    }
} 