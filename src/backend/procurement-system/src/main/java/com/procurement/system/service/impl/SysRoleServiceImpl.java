package com.procurement.system.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.procurement.system.entity.SysRole;
import com.procurement.system.mapper.SysRoleMapper;
import com.procurement.system.service.SysRoleService;
import org.springframework.stereotype.Service;

@Service
public class SysRoleServiceImpl extends ServiceImpl<SysRoleMapper, SysRole> implements SysRoleService {
}
