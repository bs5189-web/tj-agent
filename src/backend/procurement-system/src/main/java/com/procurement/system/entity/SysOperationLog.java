package com.procurement.system.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("sys_operation_log")
public class SysOperationLog {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long userId;
    private String username;
    private String operation;
    private String resource;
    private String ip;
    private String method;
    private String params;
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime timestamp;
}
