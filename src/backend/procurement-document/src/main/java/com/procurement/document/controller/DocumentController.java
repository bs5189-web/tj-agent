package com.procurement.document.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.procurement.common.utils.Result;
import com.procurement.document.entity.ProcurementDocument;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

@Tag(name = "采购文件管理")
@RestController
@RequestMapping("/api/document")
public class DocumentController {

    @Operation(summary = "创建文件")
    @PostMapping
    public Result<ProcurementDocument> create(@RequestBody ProcurementDocument document) {
        return Result.success(document);
    }

    @Operation(summary = "文件列表")
    @GetMapping("/list")
    public Result<Page<ProcurementDocument>> list(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String title) {
        Page<ProcurementDocument> page = new Page<>(pageNum, pageSize);
        return Result.success(page);
    }

    @Operation(summary = "文件详情")
    @GetMapping("/{id}")
    public Result<ProcurementDocument> getById(@PathVariable Long id) {
        return Result.success(null);
    }

    @Operation(summary = "更新文件")
    @PutMapping("/{id}")
    public Result<Boolean> update(@PathVariable Long id, @RequestBody ProcurementDocument document) {
        return Result.success(true);
    }

    @Operation(summary = "文件审批")
    @PostMapping("/{id}/approve")
    public Result<Boolean> approve(@PathVariable Long id) {
        return Result.success(true);
    }

    @Operation(summary = "版本列表")
    @GetMapping("/{id}/versions")
    public Result<Object> versions(@PathVariable Long id) {
        return Result.success(null);
    }

    @Operation(summary = "版本对比")
    @GetMapping("/{id}/compare")
    public Result<Object> compare(@PathVariable Long id, @RequestParam String v1, @RequestParam String v2) {
        return Result.success(null);
    }
}
