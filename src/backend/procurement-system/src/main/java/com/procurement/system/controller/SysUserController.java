package com.procurement.system.controller;

import com.procurement.common.utils.Result;
import com.procurement.system.entity.SysUser;
import com.procurement.system.service.SysUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 系统用户 Controller
 */
@RestController
@RequestMapping("/api/system/user")
@RequiredArgsConstructor
public class SysUserController {

    private final SysUserService sysUserService;

    @PostMapping("/login")
    public Result<SysUser> login(@RequestBody SysUser user) {
        return Result.success(sysUserService.login(user.getUsername(), user.getPassword()));
    }

    @GetMapping("/list")
    public Result<List<SysUser>> list(SysUser user) {
        return Result.success(sysUserService.listUsers(user));
    }

    @GetMapping("/{id}")
    public Result<SysUser> getById(@PathVariable Long id) {
        return Result.success(sysUserService.getById(id));
    }

    @PostMapping
    public Result<SysUser> create(@RequestBody SysUser user) {
        return Result.success(sysUserService.createUser(user));
    }

    @PutMapping("/{id}")
    public Result<SysUser> update(@PathVariable Long id, @RequestBody SysUser user) {
        user.setId(id);
        return Result.success(sysUserService.updateUser(user));
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        sysUserService.deleteUser(id);
        return Result.success();
    }
}
