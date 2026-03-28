package com.procurement.plan.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.procurement.plan.entity.AnnualPlan;
import com.procurement.plan.mapper.AnnualPlanMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AnnualPlanService {

    private final AnnualPlanMapper annualPlanMapper;

    public AnnualPlan createPlan(AnnualPlan plan) {
        plan.setStatus("DRAFT");
        plan.setCreateTime(LocalDateTime.now());
        plan.setUpdateTime(LocalDateTime.now());
        annualPlanMapper.insert(plan);
        return plan;
    }

    public List<AnnualPlan> listPlans(AnnualPlan plan) {
        LambdaQueryWrapper<AnnualPlan> wrapper = new LambdaQueryWrapper<>();
        if (plan.getUnitId() != null) {
            wrapper.eq(AnnualPlan::getUnitId, plan.getUnitId());
        }
        if (StringUtils.hasText(plan.getPlanType())) {
            wrapper.eq(AnnualPlan::getPlanType, plan.getPlanType());
        }
        if (StringUtils.hasText(plan.getStatus())) {
            wrapper.eq(AnnualPlan::getStatus, plan.getStatus());
        }
        if (plan.getPlanYear() != null) {
            wrapper.eq(AnnualPlan::getPlanYear, plan.getPlanYear());
        }
        wrapper.orderByDesc(AnnualPlan::getCreateTime);
        return annualPlanMapper.selectList(wrapper);
    }

    public AnnualPlan getById(Long id) {
        return annualPlanMapper.selectById(id);
    }

    public AnnualPlan updatePlan(AnnualPlan plan) {
        plan.setUpdateTime(LocalDateTime.now());
        annualPlanMapper.updateById(plan);
        return plan;
    }

    public void deletePlan(Long id) {
        annualPlanMapper.deleteById(id);
    }

    public void submitForApproval(Long id) {
        AnnualPlan plan = new AnnualPlan();
        plan.setId(id);
        plan.setStatus("SUBMITTED");
        plan.setUpdateTime(LocalDateTime.now());
        annualPlanMapper.updateById(plan);
    }

    public void approve(Long id) {
        AnnualPlan plan = new AnnualPlan();
        plan.setId(id);
        plan.setStatus("APPROVED");
        plan.setUpdateTime(LocalDateTime.now());
        annualPlanMapper.updateById(plan);
    }

    public void reject(Long id, String reason) {
        AnnualPlan plan = new AnnualPlan();
        plan.setId(id);
        plan.setStatus("REJECTED");
        plan.setRemark(reason);
        plan.setUpdateTime(LocalDateTime.now());
        annualPlanMapper.updateById(plan);
    }

    public Map<String, Object> getStatistics(Integer year) {
        LambdaQueryWrapper<AnnualPlan> wrapper = new LambdaQueryWrapper<>();
        if (year != null) {
            wrapper.eq(AnnualPlan::getPlanYear, year);
        }

        List<AnnualPlan> plans = annualPlanMapper.selectList(wrapper);

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalCount", plans.size());
        stats.put("totalBudget", plans.stream().mapToDouble(p -> p.getBudgetAmount().doubleValue()).sum());
        stats.put("totalUsed", plans.stream().mapToDouble(p -> p.getUsedAmount().doubleValue()).sum());
        stats.put("pendingCount", plans.stream().filter(p -> "SUBMITTED".equals(p.getStatus())).count());
        stats.put("approvedCount", plans.stream().filter(p -> "APPROVED".equals(p.getStatus())).count());
        stats.put("executingCount", plans.stream().filter(p -> "EXECUTING".equals(p.getStatus())).count());
        stats.put("completedCount", plans.stream().filter(p -> "COMPLETED".equals(p.getStatus())).count());

        return stats;
    }
}
