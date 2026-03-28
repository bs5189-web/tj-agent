package com.procurement.system.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.procurement.common.utils.Result;
import com.procurement.system.entity.SysRole;
import com.procurement.system.service.SysRoleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@Tag(name = "角色管理")
@RestController
@RequestMapping("/api/system/role")
public class SysRoleController {

    @Autowired
    private SysRoleService sysRoleService;

    @Operation(summary = "角色列表")
    @GetMapping("/list")
    public Result<Page<SysRole>> list(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize) {
        Page<SysRole> page = new Page<>(pageNum, pageSize);
        return Result.success(page);
    }

    @Operation(summary = "获取角色信息")
    @GetMapping("/{id}")
    public Result<SysRole> getById(@PathVariable Long id) {
        SysRole role = sysRoleService.getById(id);
        return Result.success(role);
    }

    @Operation(summary = "创建角色")
    @PostMapping
    public Result<Boolean> create(@RequestBody SysRole role) {
        return Result.success(sysRoleService.save(role));
    }

    @Operation(summary = "更新角色")
    @PutMapping("/{id}")
    public Result<Boolean> update(@PathVariable Long id, @RequestBody SysRole role) {
        role.setId(id);
        return Result.success(sysRoleService.updateById(role));
    }

    @Operation(summary = "删除角色")
    @DeleteMapping("/{id}")
    public Result<Boolean> delete(@PathVariable Long id) {
        return Result.success(sysRoleService.removeById(id));
    }
}
