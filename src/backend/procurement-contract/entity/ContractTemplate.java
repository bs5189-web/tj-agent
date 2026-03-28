package com.procurement.contract.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("contract_template")
public class ContractTemplate {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String templateName;
    private String category;
    private Integer clauseCount;
    private String templateContent;
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
}
