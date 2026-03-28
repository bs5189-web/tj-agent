package com.procurement.requirement.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.procurement.common.utils.Result;
import com.procurement.requirement.entity.Requirement;
import com.procurement.requirement.service.RequirementService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@Tag(name = "采购需求管理")
@RestController
@RequestMapping("/api/requirement")
@RequiredArgsConstructor
public class RequirementController {

    private final RequirementService requirementService;

    @Operation(summary = "创建需求")
    @PostMapping
    public Result<Requirement> create(@RequestBody Requirement requirement) {
        boolean saved = requirementService.save(requirement);
        return Result.success(saved ? requirement : null);
    }

    @Operation(summary = "需求列表")
    @GetMapping("/list")
    public Result<Page<Requirement>> list(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String status) {
        Page<Requirement> page = new Page<>(pageNum, pageSize);
        return Result.success(page);
    }

    @Operation(summary = "需求详情")
    @GetMapping("/{id}")
    public Result<Requirement> getById(@PathVariable Long id) {
        return Result.success(requirementService.getById(id));
    }

    @Operation(summary = "更新需求")
    @PutMapping("/{id}")
    public Result<Boolean> update(@PathVariable Long id, @RequestBody Requirement requirement) {
        requirement.setId(id);
        return Result.success(requirementService.updateById(requirement));
    }

    @Operation(summary = "删除需求")
    @DeleteMapping("/{id}")
    public Result<Boolean> delete(@PathVariable Long id) {
        return Result.success(requirementService.removeById(id));
    }

    @Operation(summary = "合规检查")
    @PostMapping("/{id}/compliance-check")
    public Result<Object> complianceCheck(@PathVariable Long id) {
        return Result.success(null);
    }

    @Operation(summary = "需求审批")
    @PostMapping("/{id}/approve")
    public Result<Boolean> approve(@PathVariable Long id) {
        return Result.success(true);
    }

    @Operation(summary = "需求汇总")
    @GetMapping("/summary")
    public Result<Object> summary() {
        return Result.success(null);
    }
}
