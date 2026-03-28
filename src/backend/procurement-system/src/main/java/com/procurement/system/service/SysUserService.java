package com.procurement.system.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.procurement.system.entity.SysUser;
import com.procurement.system.mapper.SysUserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.DigestUtils;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SysUserService {

    private final SysUserMapper sysUserMapper;

    public SysUser login(String username, String password) {
        LambdaQueryWrapper<SysUser> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(SysUser::getUsername, username);
        wrapper.eq(SysUser::getStatus, 1);
        SysUser user = sysUserMapper.selectOne(wrapper);

        if (user == null) {
            throw new RuntimeException("用户不存在");
        }

        String md5Pwd = DigestUtils.md5DigestAsHex((password + user.getUsername()).getBytes());
        if (!md5Pwd.equals(user.getPassword())) {
            throw new RuntimeException("密码错误");
        }

        return user;
    }

    public List<SysUser> listUsers(SysUser user) {
        LambdaQueryWrapper<SysUser> wrapper = new LambdaQueryWrapper<>();
        if (user.getDeptId() != null) {
            wrapper.eq(SysUser::getDeptId, user.getDeptId());
        }
        if (StringUtils.hasText(user.getRealName())) {
            wrapper.like(SysUser::getRealName, user.getRealName());
        }
        if (user.getStatus() != null) {
            wrapper.eq(SysUser::getStatus, user.getStatus());
        }
        wrapper.orderByDesc(SysUser::getCreateTime);
        return sysUserMapper.selectList(wrapper);
    }

    public SysUser getById(Long id) {
        return sysUserMapper.selectById(id);
    }

    public SysUser createUser(SysUser user) {
        String md5Pwd = DigestUtils.md5DigestAsHex((user.getPassword() + user.getUsername()).getBytes());
        user.setPassword(md5Pwd);
        user.setStatus(1);
        user.setCreateTime(LocalDateTime.now());
        user.setUpdateTime(LocalDateTime.now());
        sysUserMapper.insert(user);
        return user;
    }

    public SysUser updateUser(SysUser user) {
        user.setUpdateTime(LocalDateTime.now());
        sysUserMapper.updateById(user);
        return user;
    }

    public void deleteUser(Long id) {
        sysUserMapper.deleteById(id);
    }
}
