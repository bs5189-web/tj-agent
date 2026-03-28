package com.procurement.requirement.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("compliance_check")
public class ComplianceCheck {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long requirementId;
    private String checkRuleId;
    private String checkRuleName;
    private String checkResult;
    private String checkSuggestion;
    private Boolean isPassed;
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
}
