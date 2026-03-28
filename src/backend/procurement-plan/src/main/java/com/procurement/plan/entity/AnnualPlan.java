package com.procurement.plan.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 年度采购计划
 */
@Data
@TableName("annual_plan")
public class AnnualPlan {

    @TableId(type = IdType.ASSIGN_ID)
    private Long id;

    /** 计划编号 */
    private String planNo;

    /** 计划名称 */
    private String planName;

    /** 采购单位ID */
    private Long unitId;

    /** 采购单位名称 */
    private String unitName;

    /** 预算金额(万元) */
    private BigDecimal budgetAmount;

    /** 已使用金额(万元) */
    private BigDecimal usedAmount;

    /** 计划类型: ANNUAL-年度 QUARTER-季度 */
    private String planType;

    /** 状态: DRAFT-草稿 SUBMITTED-已提交 APPROVED-已审批 EXECUTING-执行中 COMPLETED-已完成 */
    private String status;

    /** 计划年度 */
    private Integer planYear;

    /** 季度(1-4) */
    private Integer quarter;

    /** 备注 */
    private String remark;

    /** 创建时间 */
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    /** 更新时间 */
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    /** 删除标志 */
    @TableLogic
    private Integer deleted;
}
