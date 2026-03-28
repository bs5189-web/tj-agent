package com.procurement.plan.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("plan_quarterly")
public class PlanQuarterly {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long annualPlanId;
    private Integer quarter;
    private Integer itemCount;
    private BigDecimal totalAmount;
    private String status;
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
}
