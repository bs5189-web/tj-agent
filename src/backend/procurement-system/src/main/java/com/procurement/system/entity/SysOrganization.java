package com.procurement.system.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("sys_organization")
public class SysOrganization {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String orgCode;
    private String orgName;
    private Long parentId;
    private Integer orgLevel;
    private Integer sortOrder;
    private Integer status;
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
}
