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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'

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
</script>

<style scoped lang="scss">
.page { .page-header { margin-bottom: 24px; h2 { color: #f0f6fc; font-size: 22px; font-weight: 600; } } .tab-header { display: flex; justify-content: space-between; margin-bottom: 16px; gap: 12px; } }
</style>
