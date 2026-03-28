package com.procurement.review.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("review_expert")
public class ReviewExpert {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String expertName;
    private String department;
    private String specialty;
    private String phone;
    private String email;
    private Integer status;
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
}
