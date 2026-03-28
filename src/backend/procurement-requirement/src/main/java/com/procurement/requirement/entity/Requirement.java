package com.procurement.requirement.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("requirement")
public class Requirement {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String requirementNo;
    private String title;
    private Long departmentId;
    private String departmentName;
    private String goodsName;
    private String specs;
    private Integer quantity;
    private BigDecimal estimatedPrice;
    private String urgencyLevel;
    private Integer emergencyScore;
    private String status;
    private Long applicantId;
    private String applicantName;
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
}
