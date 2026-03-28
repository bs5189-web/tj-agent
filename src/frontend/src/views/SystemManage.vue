<template>
  <div class="page">
    <div class="page-header">
      <h2>系统管理</h2>
    </div>

    <div class="card">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="用户管理" name="users">
          <div class="tab-header">
            <el-input placeholder="搜索用户" style="width: 240px" prefix-icon="Search" />
            <el-button type="primary" @click="userDialogVisible = true">新增用户</el-button>
          </div>
          <el-table :data="userData" stripe>
            <el-table-column prop="username" label="用户名" width="120" />
            <el-table-column prop="realName" label="姓名" width="120" />
            <el-table-column prop="email" label="邮箱" width="180" />
            <el-table-column prop="orgName" label="组织" width="120" />
            <el-table-column prop="roleName" label="角色" width="100" />
            <el-table-column prop="status" label="状态" width="80">
              <template #default="{ row }">
                <el-tag :type="row.status === 'active' ? 'success' : 'danger'" size="small">
                  {{ row.status === 'active' ? '启用' : '禁用' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120">
              <template #default>
                <el-button link type="primary" size="small">编辑</el-button>
                <el-button link type="danger" size="small">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-pagination
            :total="userData.length"
            :page-size="10"
            layout="prev, pager, next"
            style="margin-top: 16px; justify-content: flex-end;"
          />
        </el-tab-pane>

        <el-tab-pane label="组织管理" name="orgs">
          <div class="tab-header">
            <el-button type="primary">新增组织</el-button>
            <el-button>编辑</el-button>
          </div>
          <el-tree :data="orgTree" default-expand-all />
        </el-tab-pane>

        <el-tab-pane label="角色权限" name="roles">
          <p style="color: #8b949e; padding: 20px;">角色权限管理功能开发中...</p>
        </el-tab-pane>

        <el-tab-pane label="操作日志" name="logs">
          <p style="color: #8b949e; padding: 20px;">操作日志功能开发中...</p>
        </el-tab-pane>
      </el-tabs>
    </div>

    <el-dialog v-model="userDialogVisible" title="新增用户" width="500px">
      <el-form label-width="80px">
        <el-form-item label="用户名"><el-input placeholder="请输入用户名" /></el-form-item>
        <el-form-item label="姓名"><el-input placeholder="请输入姓名" /></el-form-item>
        <el-form-item label="邮箱"><el-input placeholder="请输入邮箱" /></el-form-item>
        <el-form-item label="组织">
          <el-select style="width: 100%">
            <el-option label="信息中心" value="info" />
            <el-option label="后勤保障部" value="logistics" />
            <el-option label="财务部" value="finance" />
          </el-select>
        </el-form-item>
        <el-form-item label="角色">
          <el-select style="width: 100%">
            <el-option label="超级管理员" value="admin" />
            <el-option label="普通用户" value="user" />
            <el-option label="审核员" value="auditor" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="userDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="userDialogVisible = false">创建</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const activeTab = ref('users')
const userDialogVisible = ref(false)

const userData = [
  { id: 1, username: 'admin', realName: '系统管理员', email: 'admin@example.com', orgName: '信息中心', roleName: '超级管理员', status: 'active' },
  { id: 2, username: 'zhangsan', realName: '张三', email: 'zhangsan@example.com', orgName: '信息中心', roleName: '普通用户', status: 'active' },
  { id: 3, username: 'lisi', realName: '李四', email: 'lisi@example.com', orgName: '后勤保障部', roleName: '审核员', status: 'active' },
]

const orgTree = [
  { label: '信息中心', children: [{ label: '技术部' }, { label: '运维部' }] },
  { label: '采购部', children: [{ label: '采购一组' }, { label: '采购二组' }] },
  { label: '财务部' },
  { label: '综合部' },
]
</script>

<style scoped lang="scss">
.page { .page-header { margin-bottom: 24px; h2 { color: #f0f6fc; font-size: 22px; font-weight: 600; } } .tab-header { display: flex; justify-content: space-between; margin-bottom: 16px; } }
</style>
