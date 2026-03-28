package com.procurement.system.controller;

import com.procurement.common.utils.Result;
import com.procurement.system.entity.SysPermission;
import com.procurement.system.service.SysPermissionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "权限管理")
@RestController
@RequestMapping("/api/system/permission")
public class SysPermissionController {

    @Autowired
    private SysPermissionService sysPermissionService;

    @Operation(summary = "权限列表")
    @GetMapping("/list")
    public Result<List<SysPermission>> list() {
        List<SysPermission> list = sysPermissionService.list();
        return Result.success(list);
    }

    @Operation(summary = "创建权限")
    @PostMapping
    public Result<Boolean> create(@RequestBody SysPermission permission) {
        return Result.success(sysPermissionService.save(permission));
    }

    @Operation(summary = "删除权限")
    @DeleteMapping("/{id}")
    public Result<Boolean> delete(@PathVariable Long id) {
        return Result.success(sysPermissionService.removeById(id));
    }
}
