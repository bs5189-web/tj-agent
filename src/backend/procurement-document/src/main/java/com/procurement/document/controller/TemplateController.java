package com.procurement.document.controller;

import com.procurement.common.utils.Result;
import com.procurement.document.entity.DocumentTemplate;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "模板管理")
@RestController
@RequestMapping("/api/template")
public class TemplateController {

    @Operation(summary = "模板列表")
    @GetMapping("/list")
    public Result<List<DocumentTemplate>> list() {
        return Result.success(null);
    }

    @Operation(summary = "获取模板")
    @GetMapping("/{id}")
    public Result<DocumentTemplate> getById(@PathVariable Long id) {
        return Result.success(null);
    }

    @Operation(summary = "创建模板")
    @PostMapping
    public Result<Boolean> create(@RequestBody DocumentTemplate template) {
        return Result.success(true);
    }

    @Operation(summary = "更新模板")
    @PutMapping("/{id}")
    public Result<Boolean> update(@PathVariable Long id, @RequestBody DocumentTemplate template) {
        return Result.success(true);
    }
}
