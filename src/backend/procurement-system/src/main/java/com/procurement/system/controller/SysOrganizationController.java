package com.procurement.system.controller;

import com.procurement.common.utils.Result;
import com.procurement.system.entity.SysOrganization;
import com.procurement.system.service.SysOrganizationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "组织管理")
@RestController
@RequestMapping("/api/system/org")
public class SysOrganizationController {

    @Autowired
    private SysOrganizationService sysOrganizationService;

    @Operation(summary = "获取组织树")
    @GetMapping("/tree")
    public Result<List<SysOrganization>> getTree() {
        List<SysOrganization> list = sysOrganizationService.list();
        return Result.success(list);
    }

    @Operation(summary = "创建组织")
    @PostMapping
    public Result<Boolean> create(@RequestBody SysOrganization org) {
        return Result.success(sysOrganizationService.save(org));
    }

    @Operation(summary = "更新组织")
    @PutMapping("/{id}")
    public Result<Boolean> update(@PathVariable Long id, @RequestBody SysOrganization org) {
        org.setId(id);
        return Result.success(sysOrganizationService.updateById(org));
    }

    @Operation(summary = "删除组织")
    @DeleteMapping("/{id}")
    public Result<Boolean> delete(@PathVariable Long id) {
        return Result.success(sysOrganizationService.removeById(id));
    }
}
