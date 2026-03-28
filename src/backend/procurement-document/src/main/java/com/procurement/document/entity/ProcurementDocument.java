package com.procurement.document.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("procurement_document")
public class ProcurementDocument {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String docNo;
    private String title;
    private String category;
    private String purchaseType;
    private Long templateId;
    private String status;
    private String currentVersion;
    private Boolean encryption;
    private Boolean watermark;
    private String accessLevel;
    private Long creatorId;
    private String creatorName;
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
}
