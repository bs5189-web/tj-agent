package com.procurement.review.controller;

import com.procurement.common.utils.Result;
import com.procurement.review.entity.ReviewExpert;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "评审专家管理")
@RestController
@RequestMapping("/api/review/expert")
public class ExpertController {

    @Operation(summary = "专家列表")
    @GetMapping("/list")
    public Result<List<ReviewExpert>> list() {
        return Result.success(null);
    }

    @Operation(summary = "专家详情")
    @GetMapping("/{id}")
    public Result<ReviewExpert> getById(@PathVariable Long id) {
        return Result.success(null);
    }

    @Operation(summary = "创建专家")
    @PostMapping
    public Result<Boolean> create(@RequestBody ReviewExpert expert) {
        return Result.success(true);
    }

    @Operation(summary = "更新专家")
    @PutMapping("/{id}")
    public Result<Boolean> update(@PathVariable Long id, @RequestBody ReviewExpert expert) {
        return Result.success(true);
    }
}
