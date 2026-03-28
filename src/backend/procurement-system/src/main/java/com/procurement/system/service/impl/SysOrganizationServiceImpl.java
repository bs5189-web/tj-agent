package com.procurement.system.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.procurement.system.entity.SysOrganization;
import com.procurement.system.mapper.SysOrganizationMapper;
import com.procurement.system.service.SysOrganizationService;
import org.springframework.stereotype.Service;

@Service
public class SysOrganizationServiceImpl extends ServiceImpl<SysOrganizationMapper, SysOrganization> implements SysOrganizationService {
}
