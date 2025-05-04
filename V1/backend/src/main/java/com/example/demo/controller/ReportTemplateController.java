package com.example.demo.controller;

import com.example.demo.entity.ReportTemplate;
import com.example.demo.service.ReportTemplateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/templates")
public class ReportTemplateController {
    @Autowired
    private ReportTemplateService templateService;

    @GetMapping
    public ResponseEntity<List<ReportTemplate>> getAllTemplates() {
        return ResponseEntity.ok(templateService.getAllTemplates());
    }

    @GetMapping("/type/{reportType}")
    public ResponseEntity<List<ReportTemplate>> getTemplatesByType(@PathVariable String reportType) {
        return ResponseEntity.ok(templateService.getTemplatesByType(reportType));
    }

    @GetMapping("/active/{reportType}")
    public ResponseEntity<ReportTemplate> getActiveTemplate(@PathVariable String reportType) {
        return templateService.getActiveTemplate(reportType)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<ReportTemplate> saveTemplate(@RequestBody ReportTemplate template) {
        return ResponseEntity.ok(templateService.saveTemplate(template));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTemplate(@PathVariable Long id) {
        templateService.deleteTemplate(id);
        return ResponseEntity.ok().build();
    }
} 