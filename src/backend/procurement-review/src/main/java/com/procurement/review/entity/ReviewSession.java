package com.procurement.review.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("review_session")
public class ReviewSession {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String sessionNo;
    private Long documentId;
    private String documentTitle;
    private String status;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String expertIds;
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
}
