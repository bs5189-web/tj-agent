package com.procurement.system.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.procurement.system.entity.SysPermission;
import com.procurement.system.mapper.SysPermissionMapper;
import com.procurement.system.service.SysPermissionService;
import org.springframework.stereotype.Service;

@Service
public class SysPermissionServiceImpl extends ServiceImpl<SysPermissionMapper, SysPermission> implements SysPermissionService {
}
