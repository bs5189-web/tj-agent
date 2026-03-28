package com.procurement.contract.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.procurement.common.utils.Result;
import com.procurement.contract.entity.Contract;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

@Tag(name = "合同管理")
@RestController
@RequestMapping("/api/contract")
public class ContractController {

    @Operation(summary = "创建合同")
    @PostMapping
    public Result<Contract> create(@RequestBody Contract contract) {
        return Result.success(contract);
    }

    @Operation(summary = "合同列表")
    @GetMapping("/list")
    public Result<Page<Contract>> list(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String status) {
        Page<Contract> page = new Page<>(pageNum, pageSize);
        return Result.success(page);
    }

    @Operation(summary = "合同详情")
    @GetMapping("/{id}")
    public Result<Contract> getById(@PathVariable Long id) {
        return Result.success(null);
    }

    @Operation(summary = "智能生成合同")
    @PostMapping("/generate")
    public Result<Contract> generate(@RequestBody Object params) {
        return Result.success(null);
    }

    @Operation(summary = "提取合同信息")
    @PostMapping("/extract")
    public Result<Object> extract(@RequestBody Object params) {
        return Result.success(null);
    }

    @Operation(summary = "合同审批")
    @PostMapping("/{id}/approve")
    public Result<Boolean> approve(@PathVariable Long id) {
        return Result.success(true);
    }

    @Operation(summary = "合同签署")
    @PostMapping("/{id}/sign")
    public Result<Boolean> sign(@PathVariable Long id) {
        return Result.success(true);
    }
}
