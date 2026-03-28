package com.procurement.plan.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("plan_annual")
public class PlanAnnual {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String planNo;
    private Integer planYear;
    private String unitCode;
    private String unitName;
    private BigDecimal totalAmount;
    private Integer itemCount;
    private String status;
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
}
