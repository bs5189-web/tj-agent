<template>
  <div class="page">
    <div class="page-header">
      <h2>系统管理</h2>
    </div>

    <div class="card">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="用户管理" name="users">
          <div class="tab-header">
            <el-input v-model="searchForm.keyword" placeholder="搜索用户" style="width: 240px" prefix-icon="Search" />
            <el-button type="primary" @click="openUserDialog()">新增用户</el-button>
          </div>
          <el-table :data="paginatedUserData" stripe>
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
              <template #default="{ row }">
                <el-button link type="primary" size="small" @click="openUserDialog(row)">编辑</el-button>
                <el-button link type="danger" size="small" @click="handleDeleteUser(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-pagination
            v-model:current-page="userPage"
            v-model:page-size="userPageSize"
            :total="filteredUserData.length"
            :page-sizes="[10, 20, 50]"
            layout="total, sizes, prev, pager, next"
            style="margin-top: 16px; justify-content: flex-end;"
          />
        </el-tab-pane>

        <el-tab-pane label="组织管理" name="orgs">
          <div class="tab-header">
            <el-button type="primary" @click="orgDialogVisible = true">新增组织</el-button>
            <el-button>编辑</el-button>
          </div>
          <el-tree :data="orgTree" default-expand-all node-key="id">
            <template #default="{ data }">
              <span>{{ data.label }}</span>
            </template>
          </el-tree>
        </el-tab-pane>

        <el-tab-pane label="角色权限" name="roles">
          <div class="tab-header">
            <el-input v-model="roleSearchKeyword" placeholder="搜索角色" style="width: 240px" prefix-icon="Search" />
            <el-button type="primary" @click="openRoleDialog()">新增角色</el-button>
          </div>
          <el-table :data="paginatedRoleData" stripe>
            <el-table-column prop="roleName" label="角色名称" width="150" />
            <el-table-column prop="roleCode" label="角色编码" width="120" />
            <el-table-column prop="description" label="描述" />
            <el-table-column prop="userCount" label="用户数" width="80" />
            <el-table-column prop="status" label="状态" width="80">
              <template #default="{ row }">
                <el-tag :type="row.status === 'active' ? 'success' : 'danger'" size="small">
                  {{ row.status === 'active' ? '启用' : '禁用' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120">
              <template #default="{ row }">
                <el-button link type="primary" size="small" @click="openRoleDialog(row)">编辑</el-button>
                <el-button link type="primary" size="small" @click="openPermissionDialog(row)">权限</el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-pagination
            v-model:current-page="rolePage"
            v-model:page-size="rolePageSize"
            :total="filteredRoleData.length"
            :page-sizes="[10, 20, 50]"
            layout="total, sizes, prev, pager, next"
            style="margin-top: 16px; justify-content: flex-end;"
          />
        </el-tab-pane>

        <el-tab-pane label="数据字典" name="dict">
          <div class="tab-header">
            <el-input v-model="dictSearchForm.keyword" placeholder="搜索字典编码/名称" style="width: 240px" prefix-icon="Search" />
            <el-select v-model="dictSearchForm.type" placeholder="字典类型" style="width: 120px">
              <el-option label="全部" value="" />
              <el-option label="系统字典" value="system" />
              <el-option label="业务字典" value="business" />
            </el-select>
            <el-button type="primary" @click="openDictDialog()">新增字典</el-button>
          </div>
          <el-table :data="paginatedDictData" stripe>
            <el-table-column prop="dictType" label="字典类型" width="120">
              <template #default="{ row }">
                <el-tag :type="row.dictType === 'system' ? 'primary' : 'success'" size="small">
                  {{ row.dictType === 'system' ? '系统字典' : '业务字典' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="dictCode" label="字典编码" width="150" />
            <el-table-column prop="dictName" label="字典名称" width="150" />
            <el-table-column prop="dictValue" label="字典值" />
            <el-table-column prop="sortOrder" label="排序" width="80" />
            <el-table-column prop="status" label="状态" width="80">
              <template #default="{ row }">
                <el-tag :type="row.status === 'active' ? 'success' : 'info'" size="small">
                  {{ row.status === 'active' ? '启用' : '禁用' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120">
              <template #default="{ row }">
                <el-button link type="primary" size="small" @click="openDictDialog(row)">编辑</el-button>
                <el-button link type="danger" size="small" @click="handleDeleteDict(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-pagination
            v-model:current-page="dictPage"
            v-model:page-size="dictPageSize"
            :total="filteredDictData.length"
            :page-sizes="[10, 20, 50]"
            layout="total, sizes, prev, pager, next"
            style="margin-top: 16px; justify-content: flex-end;"
          />
        </el-tab-pane>

        <el-tab-pane label="系统配置" name="config">
          <div class="config-form">
            <el-form label-width="140px" :model="sysConfigForm">
              <el-form-item label="会话超时时间">
                <el-input-number v-model="sysConfigForm.sessionTimeout" :min="5" :max="120" />
                <span class="form-tip">分钟</span>
              </el-form-item>
              <el-form-item label="密码最小长度">
                <el-input-number v-model="sysConfigForm.passwordMinLength" :min="6" :max="20" />
              </el-form-item>
              <el-form-item label="密码复杂度要求">
                <el-checkbox v-model="sysConfigForm.requireUppercase">必须包含大写字母</el-checkbox>
                <el-checkbox v-model="sysConfigForm.requireLowercase">必须包含小写字母</el-checkbox>
                <el-checkbox v-model="sysConfigForm.requireNumber">必须包含数字</el-checkbox>
                <el-checkbox v-model="sysConfigForm.requireSpecial">必须包含特殊字符</el-checkbox>
              </el-form-item>
              <el-form-item label="密码有效期">
                <el-input-number v-model="sysConfigForm.passwordExpireDays" :min="0" :max="365" />
                <span class="form-tip">天 (0表示不限制)</span>
              </el-form-item>
              <el-form-item label="登录失败锁定次数">
                <el-input-number v-model="sysConfigForm.maxLoginFailures" :min="3" :max="10" />
                <span class="form-tip">次</span>
              </el-form-item>
              <el-form-item label="自动备份周期">
                <el-select v-model="sysConfigForm.backupCycle" style="width: 200px">
                  <el-option label="每天" value="daily" />
                  <el-option label="每周" value="weekly" />
                  <el-option label="每月" value="monthly" />
                </el-select>
              </el-form-item>
              <el-form-item label="数据保留期限">
                <el-input-number v-model="sysConfigForm.dataRetentionDays" :min="30" :max="3650" />
                <span class="form-tip">天</span>
              </el-form-item>
              <el-form-item label="启用双因素认证">
                <el-switch v-model="sysConfigForm.twoFactorEnabled" />
              </el-form-item>
              <el-form-item label="允许并发登录">
                <el-switch v-model="sysConfigForm.allowConcurrentLogin" />
              </el-form-item>
              <el-form-item label="系统维护模式">
                <el-switch v-model="sysConfigForm.maintenanceMode" />
              </el-form-item>
            </el-form>
            <div class="form-footer">
              <el-button type="primary" @click="handleSaveConfig">保存配置</el-button>
              <el-button @click="handleResetConfig">重置</el-button>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="操作日志" name="logs">
          <div class="tab-header">
            <el-input v-model="logSearchForm.keyword" placeholder="搜索操作人/内容" style="width: 240px" prefix-icon="Search" />
            <el-select v-model="logSearchForm.module" placeholder="模块" style="width: 120px">
              <el-option label="全部" value="" />
              <el-option label="用户管理" value="user" />
              <el-option label="采购计划" value="plan" />
              <el-option label="采购合同" value="contract" />
              <el-option label="系统设置" value="system" />
            </el-select>
            <el-button @click="handleLogReset">重置</el-button>
          </div>
          <el-table :data="paginatedLogData" stripe>
            <el-table-column prop="operTime" label="操作时间" width="160" />
            <el-table-column prop="operator" label="操作人" width="120" />
            <el-table-column prop="module" label="模块" width="100" />
            <el-table-column prop="action" label="操作" width="100" />
            <el-table-column prop="content" label="操作内容" />
            <el-table-column prop="ipAddress" label="IP地址" width="140" />
            <el-table-column prop="status" label="状态" width="80">
              <template #default="{ row }">
                <el-tag :type="row.status === 'success' ? 'success' : 'danger'" size="small">
                  {{ row.status === 'success' ? '成功' : '失败' }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
          <el-pagination
            v-model:current-page="logPage"
            v-model:page-size="logPageSize"
            :total="filteredLogData.length"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next"
            style="margin-top: 16px; justify-content: flex-end;"
          />
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 用户对话框 -->
    <el-dialog v-model="userDialogVisible" :title="editingUser ? '编辑用户' : '新增用户'" width="500px">
      <el-form label-width="80px">
        <el-form-item label="用户名"><el-input v-model="userForm.username" placeholder="请输入用户名" /></el-form-item>
        <el-form-item label="姓名"><el-input v-model="userForm.realName" placeholder="请输入姓名" /></el-form-item>
        <el-form-item label="邮箱"><el-input v-model="userForm.email" placeholder="请输入邮箱" /></el-form-item>
        <el-form-item label="组织">
          <el-select v-model="userForm.orgName" style="width: 100%">
            <el-option label="信息中心" value="信息中心" />
            <el-option label="后勤保障部" value="后勤保障部" />
            <el-option label="财务部" value="财务部" />
            <el-option label="采购部" value="采购部" />
          </el-select>
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="userForm.roleName" style="width: 100%">
            <el-option label="超级管理员" value="超级管理员" />
            <el-option label="普通用户" value="普通用户" />
            <el-option label="审核员" value="审核员" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="userDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveUser">保存</el-button>
      </template>
    </el-dialog>

    <!-- 角色对话框 -->
    <el-dialog v-model="roleDialogVisible" :title="editingRole ? '编辑角色' : '新增角色'" width="500px">
      <el-form label-width="80px">
        <el-form-item label="角色名称"><el-input v-model="roleForm.roleName" placeholder="请输入角色名称" /></el-form-item>
        <el-form-item label="角色编码"><el-input v-model="roleForm.roleCode" placeholder="请输入角色编码" /></el-form-item>
        <el-form-item label="描述"><el-input v-model="roleForm.description" type="textarea" :rows="3" placeholder="请输入描述" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="roleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveRole">保存</el-button>
      </template>
    </el-dialog>

    <!-- 权限对话框 -->
    <el-dialog v-model="permissionDialogVisible" title="分配权限" width="500px">
      <el-tree :data="permissionTree" show-checkbox node-key="id" :props="{ children: 'children', label: 'label' }" default-expand-all />
      <template #footer>
        <el-button @click="permissionDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="permissionDialogVisible = false">保存</el-button>
      </template>
    </el-dialog>

    <!-- 组织对话框 -->
    <el-dialog v-model="orgDialogVisible" title="新增组织" width="400px">
      <el-form label-width="80px">
        <el-form-item label="组织名称"><el-input placeholder="请输入组织名称" /></el-form-item>
        <el-form-item label="上级组织">
          <el-select placeholder="请选择上级组织" style="width: 100%">
            <el-option label="信息中心" value="info" />
            <el-option label="采购部" value="purchase" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="orgDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="orgDialogVisible = false">保存</el-button>
      </template>
    </el-dialog>

    <!-- 数据字典对话框 -->
    <el-dialog v-model="dictDialogVisible" :title="editingDict ? '编辑字典' : '新增字典'" width="500px">
      <el-form label-width="100px">
        <el-form-item label="字典类型">
          <el-select v-model="dictForm.dictType" style="width: 100%">
            <el-option label="系统字典" value="system" />
            <el-option label="业务字典" value="business" />
          </el-select>
        </el-form-item>
        <el-form-item label="字典编码"><el-input v-model="dictForm.dictCode" placeholder="请输入字典编码" /></el-form-item>
        <el-form-item label="字典名称"><el-input v-model="dictForm.dictName" placeholder="请输入字典名称" /></el-form-item>
        <el-form-item label="字典值"><el-input v-model="dictForm.dictValue" placeholder="请输入字典值" /></el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="dictForm.sortOrder" :min="0" :max="999" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="dictForm.status">
            <el-radio label="active">启用</el-radio>
            <el-radio label="inactive">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dictDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveDict">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'

const activeTab = ref('users')
const userDialogVisible = ref(false)
const roleDialogVisible = ref(false)
const permissionDialogVisible = ref(false)
const orgDialogVisible = ref(false)
const editingUser = ref<any>(null)
const editingRole = ref<any>(null)

// 用户管理
const userPage = ref(1)
const userPageSize = ref(10)
const searchForm = reactive({ keyword: '' })

const userForm = reactive({
  username: '', realName: '', email: '', orgName: '', roleName: ''
})

const userData = ref([
  { id: 1, username: 'admin', realName: '系统管理员', email: 'admin@example.com', orgName: '信息中心', roleName: '超级管理员', status: 'active' },
  { id: 2, username: 'zhangsan', realName: '张三', email: 'zhangsan@example.com', orgName: '信息中心', roleName: '普通用户', status: 'active' },
  { id: 3, username: 'lisi', realName: '李四', email: 'lisi@example.com', orgName: '后勤保障部', roleName: '审核员', status: 'active' },
  { id: 4, username: 'wangwu', realName: '王五', email: 'wangwu@example.com', orgName: '财务部', roleName: '普通用户', status: 'active' },
  { id: 5, username: 'zhaoliu', realName: '赵六', email: 'zhaoliu@example.com', orgName: '采购部', roleName: '审核员', status: 'active' },
  { id: 6, username: 'sunqi', realName: '孙七', email: 'sunqi@example.com', orgName: '信息中心', roleName: '普通用户', status: 'active' },
  { id: 7, username: 'zhouba', realName: '周八', email: 'zhouba@example.com', orgName: '后勤保障部', roleName: '普通用户', status: 'active' },
  { id: 8, username: 'wujiu', realName: '吴九', email: 'wujiu@example.com', orgName: '财务部', roleName: '普通用户', status: 'active' },
])

const filteredUserData = computed(() => {
  return userData.value.filter(u => !searchForm.keyword || u.username.includes(searchForm.keyword) || u.realName.includes(searchForm.keyword))
})

const paginatedUserData = computed(() => {
  const start = (userPage.value - 1) * userPageSize.value
  return filteredUserData.value.slice(start, start + userPageSize.value)
})

watch(filteredUserData, () => { userPage.value = 1 })

const openUserDialog = (row?: any) => {
  editingUser.value = row || null
  if (row) {
    Object.assign(userForm, { username: row.username, realName: row.realName, email: row.email, orgName: row.orgName, roleName: row.roleName })
  } else {
    Object.assign(userForm, { username: '', realName: '', email: '', orgName: '', roleName: '' })
  }
  userDialogVisible.value = true
}

const handleSaveUser = () => {
  if (editingUser.value) {
    const idx = userData.value.findIndex(u => u.id === editingUser.value.id)
    if (idx !== -1) Object.assign(userData.value[idx], userForm)
  } else {
    userData.value.push({ id: Math.max(...userData.value.map(u => u.id)) + 1, ...userForm, status: 'active' })
  }
  userDialogVisible.value = false
}

const handleDeleteUser = (row: any) => {
  userData.value = userData.value.filter(u => u.id !== row.id)
}

// 角色权限
const rolePage = ref(1)
const rolePageSize = ref(10)
const roleSearchKeyword = ref('')

const roleForm = reactive({ roleName: '', roleCode: '', description: '' })

const roleData = ref([
  { id: 1, roleName: '超级管理员', roleCode: 'admin', description: '系统最高权限', userCount: 1, status: 'active' },
  { id: 2, roleName: '普通用户', roleCode: 'user', description: '普通操作权限', userCount: 5, status: 'active' },
  { id: 3, roleName: '审核员', roleCode: 'auditor', description: '采购审核权限', userCount: 2, status: 'active' },
  { id: 4, roleName: '财务审核', roleCode: 'finance', description: '财务相关审核', userCount: 1, status: 'active' },
])

const filteredRoleData = computed(() => {
  return roleData.value.filter(r => !roleSearchKeyword.value || r.roleName.includes(roleSearchKeyword.value) || r.roleCode.includes(roleSearchKeyword.value))
})

const paginatedRoleData = computed(() => {
  const start = (rolePage.value - 1) * rolePageSize.value
  return filteredRoleData.value.slice(start, start + rolePageSize.value)
})

const openRoleDialog = (row?: any) => {
  editingRole.value = row || null
  if (row) {
    Object.assign(roleForm, { roleName: row.roleName, roleCode: row.roleCode, description: row.description })
  } else {
    Object.assign(roleForm, { roleName: '', roleCode: '', description: '' })
  }
  roleDialogVisible.value = true
}

const handleSaveRole = () => {
  if (editingRole.value) {
    const idx = roleData.value.findIndex(r => r.id === editingRole.value.id)
    if (idx !== -1) Object.assign(roleData.value[idx], roleForm)
  } else {
    roleData.value.push({ id: Math.max(...roleData.value.map(r => r.id)) + 1, ...roleForm, userCount: 0, status: 'active' })
  }
  roleDialogVisible.value = false
}

const openPermissionDialog = (row?: any) => {
  editingRole.value = row || null
  permissionDialogVisible.value = true
}

const permissionTree = [
  { id: 1, label: '采购管理', children: [
    { id: 11, label: '采购计划' }, { id: 12, label: '采购需求' }, { id: 13, label: '采购文件' }, { id: 14, label: '采购评审' }
  ]},
  { id: 2, label: '合同管理', children: [
    { id: 21, label: '合同签署' }, { id: 22, label: '合同履约' }
  ]},
  { id: 3, label: '系统管理', children: [
    { id: 31, label: '用户管理' }, { id: 32, label: '角色权限' }, { id: 33, label: '组织管理' }
  ]},
]

// 操作日志
const logPage = ref(1)
const logPageSize = ref(10)
const logSearchForm = reactive({ keyword: '', module: '' })

const logData = ref([
  { id: 1, operTime: '2024-03-28 10:30:25', operator: 'admin', module: '用户管理', action: '新增', content: '新增用户zhangsan', ipAddress: '192.168.1.100', status: 'success' },
  { id: 2, operTime: '2024-03-28 10:25:10', operator: 'admin', module: '采购计划', action: '审批', content: '审批通过计划PLAN-2024-001', ipAddress: '192.168.1.100', status: 'success' },
  { id: 3, operTime: '2024-03-28 09:45:30', operator: 'zhangsan', module: '采购合同', action: '编辑', content: '编辑合同CON-2024-089', ipAddress: '192.168.1.101', status: 'success' },
  { id: 4, operTime: '2024-03-28 09:30:00', operator: 'lisi', module: '系统设置', action: '修改', content: '修改系统配置', ipAddress: '192.168.1.102', status: 'success' },
  { id: 5, operTime: '2024-03-27 17:20:15', operator: 'admin', module: '用户管理', action: '删除', content: '删除用户test', ipAddress: '192.168.1.100', status: 'success' },
  { id: 6, operTime: '2024-03-27 16:10:00', operator: 'zhangsan', module: '采购计划', action: '创建', content: '创建采购需求REQ-2024-165', ipAddress: '192.168.1.101', status: 'success' },
  { id: 7, operTime: '2024-03-27 15:05:30', operator: 'lisi', module: '采购合同', action: '签署', content: '签署合同CON-2024-090', ipAddress: '192.168.1.102', status: 'success' },
  { id: 8, operTime: '2024-03-27 14:30:00', operator: 'admin', module: '系统设置', action: '登录', content: '用户登录系统', ipAddress: '192.168.1.100', status: 'success' },
])

const filteredLogData = computed(() => {
  return logData.value.filter(l => {
    const matchKeyword = !logSearchForm.keyword || l.operator.includes(logSearchForm.keyword) || l.content.includes(logSearchForm.keyword)
    const matchModule = !logSearchForm.module || l.module.includes(logSearchForm.module)
    return matchKeyword && matchModule
  })
})

const paginatedLogData = computed(() => {
  const start = (logPage.value - 1) * logPageSize.value
  return filteredLogData.value.slice(start, start + logPageSize.value)
})

const handleLogReset = () => {
  logSearchForm.keyword = ''
  logSearchForm.module = ''
}

// 组织树
const orgTree = ref([
  { id: 1, label: '信息中心', children: [
    { id: 11, label: '技术部' }, { id: 12, label: '运维部' }
  ]},
  { id: 2, label: '采购部', children: [
    { id: 21, label: '采购一组' }, { id: 22, label: '采购二组' }
  ]},
  { id: 3, label: '财务部' },
  { id: 4, label: '综合部' },
])

// 数据字典管理
const dictPage = ref(1)
const dictPageSize = ref(10)
const dictDialogVisible = ref(false)
const editingDict = ref<any>(null)
const dictSearchForm = reactive({ keyword: '', type: '' })

const dictForm = reactive({
  dictType: 'system',
  dictCode: '',
  dictName: '',
  dictValue: '',
  sortOrder: 0,
  status: 'active'
})

const dictData = ref([
  { id: 1, dictType: 'system', dictCode: 'SYS_STATUS', dictName: '系统状态', dictValue: 'active', sortOrder: 1, status: 'active' },
  { id: 2, dictType: 'system', dictCode: 'USER_STATUS', dictName: '用户状态', dictValue: 'active', sortOrder: 2, status: 'active' },
  { id: 3, dictType: 'system', dictCode: 'GENDER', dictName: '性别', dictValue: 'male', sortOrder: 3, status: 'active' },
  { id: 4, dictType: 'business', dictCode: 'PROCUREMENT_TYPE', dictName: '采购类型', dictValue: 'direct', sortOrder: 1, status: 'active' },
  { id: 5, dictType: 'business', dictCode: 'CONTRACT_STATUS', dictName: '合同状态', dictValue: 'pending', sortOrder: 2, status: 'active' },
  { id: 6, dictType: 'business', dictCode: 'REVIEW_STATUS', dictName: '评审状态', dictValue: 'preparing', sortOrder: 3, status: 'active' },
  { id: 7, dictType: 'business', dictCode: 'TENDER_METHOD', dictName: '招标方式', dictValue: 'open', sortOrder: 4, status: 'active' },
  { id: 8, dictType: 'system', dictCode: 'LOG_LEVEL', dictName: '日志级别', dictValue: 'info', sortOrder: 5, status: 'active' },
])

const filteredDictData = computed(() => {
  return dictData.value.filter(d => {
    const matchKeyword = !dictSearchForm.keyword || d.dictCode.includes(dictSearchForm.keyword) || d.dictName.includes(dictSearchForm.keyword)
    const matchType = !dictSearchForm.type || d.dictType === dictSearchForm.type
    return matchKeyword && matchType
  })
})

const paginatedDictData = computed(() => {
  const start = (dictPage.value - 1) * dictPageSize.value
  return filteredDictData.value.slice(start, start + dictPageSize.value)
})

watch(filteredDictData, () => { dictPage.value = 1 })

const openDictDialog = (row?: any) => {
  editingDict.value = row || null
  if (row) {
    Object.assign(dictForm, {
      dictType: row.dictType,
      dictCode: row.dictCode,
      dictName: row.dictName,
      dictValue: row.dictValue,
      sortOrder: row.sortOrder,
      status: row.status
    })
  } else {
    Object.assign(dictForm, { dictType: 'system', dictCode: '', dictName: '', dictValue: '', sortOrder: 0, status: 'active' })
  }
  dictDialogVisible.value = true
}

const handleSaveDict = () => {
  if (editingDict.value) {
    const idx = dictData.value.findIndex(d => d.id === editingDict.value.id)
    if (idx !== -1) Object.assign(dictData.value[idx], dictForm)
  } else {
    dictData.value.push({ id: Math.max(...dictData.value.map(d => d.id)) + 1, ...dictForm })
  }
  dictDialogVisible.value = false
}

const handleDeleteDict = (row: any) => {
  dictData.value = dictData.value.filter(d => d.id !== row.id)
}

// 系统配置
const sysConfigForm = reactive({
  sessionTimeout: 30,
  passwordMinLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecial: false,
  passwordExpireDays: 90,
  maxLoginFailures: 5,
  backupCycle: 'weekly',
  dataRetentionDays: 365,
  twoFactorEnabled: false,
  allowConcurrentLogin: true,
  maintenanceMode: false
})

const originalConfig = { ...sysConfigForm }

const handleSaveConfig = () => {
  Object.assign(originalConfig, sysConfigForm)
  ElMessage.success('配置保存成功')
}

const handleResetConfig = () => {
  Object.assign(sysConfigForm, originalConfig)
}
</script>

<style scoped lang="scss">
.page {
  .page-header { margin-bottom: 24px; h2 { color: #f0f6fc; font-size: 22px; font-weight: 600; } }
  .tab-header { display: flex; justify-content: space-between; margin-bottom: 16px; gap: 12px; }
  .config-form { max-width: 600px; .form-tip { margin-left: 8px; color: #8b949e; } .form-footer { margin-top: 24px; padding-left: 140px; } }
}
</style>
