package com.procurement.plan.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("assessment_record")
public class AssessmentRecord {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long planId;
    private String nodeName;
    private LocalDate planDate;
    private LocalDate actualDate;
    private Integer delayDays;
    private String assessmentResult;
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
}
