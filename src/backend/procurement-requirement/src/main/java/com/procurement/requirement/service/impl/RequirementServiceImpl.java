package com.procurement.requirement.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.procurement.requirement.entity.Requirement;
import com.procurement.requirement.mapper.RequirementMapper;
import com.procurement.requirement.service.RequirementService;
import org.springframework.stereotype.Service;

@Service
public class RequirementServiceImpl extends ServiceImpl<RequirementMapper, Requirement> implements RequirementService {
}
