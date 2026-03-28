package com.procurement.review.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("expert_score")
public class ExpertScore {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long sessionId;
    private Long expertId;
    private String expertName;
    private Long itemId;
    private String itemName;
    private Double score;
    private String comment;
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime scoredTime;
}
