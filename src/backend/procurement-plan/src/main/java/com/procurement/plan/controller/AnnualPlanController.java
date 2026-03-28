package com.procurement.plan.controller;

import com.procurement.common.utils.Result;
import com.procurement.plan.entity.AnnualPlan;
import com.procurement.plan.service.AnnualPlanService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 年度采购计划 Controller
 */
@RestController
@RequestMapping("/api/plan/annual")
@RequiredArgsConstructor
public class AnnualPlanController {

    private final AnnualPlanService annualPlanService;

    /**
     * 创建年度计划
     */
    @PostMapping
    public Result<AnnualPlan> create(@RequestBody AnnualPlan plan) {
        return Result.success(annualPlanService.createPlan(plan));
    }

    /**
     * 查询计划列表
     */
    @GetMapping("/list")
    public Result<List<AnnualPlan>> list(AnnualPlan plan) {
        return Result.success(annualPlanService.listPlans(plan));
    }

    /**
     * 查询计划详情
     */
    @GetMapping("/{id}")
    public Result<AnnualPlan> getById(@PathVariable Long id) {
        return Result.success(annualPlanService.getById(id));
    }

    /**
     * 更新计划
     */
    @PutMapping("/{id}")
    public Result<AnnualPlan> update(@PathVariable Long id, @RequestBody AnnualPlan plan) {
        plan.setId(id);
        return Result.success(annualPlanService.updatePlan(plan));
    }

    /**
     * 删除计划
     */
    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        annualPlanService.deletePlan(id);
        return Result.success();
    }

    /**
     * 提交审核
     */
    @PostMapping("/{id}/submit")
    public Result<Void> submit(@PathVariable Long id) {
        annualPlanService.submitForApproval(id);
        return Result.success();
    }

    /**
     * 审批通过
     */
    @PostMapping("/{id}/approve")
    public Result<Void> approve(@PathVariable Long id) {
        annualPlanService.approve(id);
        return Result.success();
    }

    /**
     * 审批拒绝
     */
    @PostMapping("/{id}/reject")
    public Result<Void> reject(@PathVariable Long id, @RequestParam String reason) {
        annualPlanService.reject(id, reason);
        return Result.success();
    }

    /**
     * 获取统计信息
     */
    @GetMapping("/statistics")
    public Result<Object> statistics(@RequestParam(required = false) Integer year) {
        return Result.success(annualPlanService.getStatistics(year));
    }
}
