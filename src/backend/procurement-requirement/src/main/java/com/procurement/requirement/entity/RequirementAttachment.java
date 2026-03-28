package com.procurement.requirement.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("requirement_attachment")
public class RequirementAttachment {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long requirementId;
    private String fileName;
    private String filePath;
    private String fileType;
    private Integer version;
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime uploadTime;
}
