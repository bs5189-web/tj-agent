package com.procurement.document.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("document_template")
public class DocumentTemplate {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String templateName;
    private String category;
    private String purchaseType;
    private String templateContent;
    private Integer useCount;
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
}
