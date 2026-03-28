package com.procurement.contract.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("contract_clause")
public class ContractClause {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long contractId;
    private String clauseNo;
    private String clauseTitle;
    private String clauseContent;
    private String keyTerms;
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
}
