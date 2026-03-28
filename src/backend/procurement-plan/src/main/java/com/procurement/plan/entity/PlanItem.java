package com.procurement.plan.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("plan_item")
public class PlanItem {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long planId;
    private String goodsName;
    private String specs;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal amount;
    private String purchaseType;
    private String supplier;
    private String status;
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
}
