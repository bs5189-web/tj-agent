package com.procurement.system.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.procurement.system.entity.SysOperationLog;
import com.procurement.system.mapper.SysOperationLogMapper;
import com.procurement.system.service.SysOperationLogService;
import org.springframework.stereotype.Service;

@Service
public class SysOperationLogServiceImpl extends ServiceImpl<SysOperationLogMapper, SysOperationLog> implements SysOperationLogService {
}
