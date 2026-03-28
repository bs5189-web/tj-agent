package com.procurement.document.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("document_version")
public class DocumentVersion {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long documentId;
    private String versionNo;
    private String content;
    private Long changedBy;
    private String changedByName;
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime changedTime;
    private String changeDesc;
}
