package com.procurement.review.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.procurement.common.utils.Result;
import com.procurement.review.entity.ReviewSession;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

@Tag(name = "评审管理")
@RestController
@RequestMapping("/api/review/session")
public class ReviewSessionController {

    @Operation(summary = "创建评审")
    @PostMapping
    public Result<ReviewSession> create(@RequestBody ReviewSession session) {
        return Result.success(session);
    }

    @Operation(summary = "评审列表")
    @GetMapping("/list")
    public Result<Page<ReviewSession>> list(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize) {
        Page<ReviewSession> page = new Page<>(pageNum, pageSize);
        return Result.success(page);
    }

    @Operation(summary = "评审详情")
    @GetMapping("/{id}")
    public Result<ReviewSession> getById(@PathVariable Long id) {
        return Result.success(null);
    }

    @Operation(summary = "导入投标文件")
    @PostMapping("/{id}/import")
    public Result<Boolean> importFile(@PathVariable Long id) {
        return Result.success(true);
    }

    @Operation(summary = "评分汇总")
    @GetMapping("/{id}/summary")
    public Result<Object> summary(@PathVariable Long id) {
        return Result.success(null);
    }

    @Operation(summary = "评审统计")
    @GetMapping("/statistics")
    public Result<Object> statistics() {
        return Result.success(null);
    }
}
