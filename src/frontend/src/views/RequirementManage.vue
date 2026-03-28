<template>
  <div class="page">
    <div class="page-header">
      <h2>采购需求管理</h2>
      <el-button type="primary" @click="openCreateDialog">发起需求</el-button>
    </div>

    <div class="card search-card">
      <el-form inline>
        <el-form-item><el-input v-model="searchForm.keyword" placeholder="搜索需求编号/标题" prefix-icon="Search" /></el-form-item>
        <el-form-item>
          <el-select v-model="searchForm.status" placeholder="状态" style="width: 120px">
            <el-option label="全部" value="" />
            <el-option label="草稿" value="draft" />
            <el-option label="合规检查中" value="checking" />
            <el-option label="审批中" value="pending" />
            <el-option label="已通过" value="approved" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-select v-model="searchForm.urgency" placeholder="紧急度" style="width: 100px">
            <el-option label="全部" value="" />
            <el-option label="低" value="low" />
            <el-option label="中" value="medium" />
            <el-option label="高" value="high" />
          </el-select>
        </el-form-item>
        <el-form-item><el-button @click="handleReset">重置</el-button></el-form-item>
      </el-form>
    </div>

    <div class="card">
      <el-table :data="paginatedData" stripe>
        <el-table-column prop="reqNo" label="需求编号" width="140" />
        <el-table-column prop="title" label="需求标题" width="180" />
        <el-table-column prop="department" label="需求部门" width="120" />
        <el-table-column prop="goodsName" label="采购物品" width="120" />
        <el-table-column prop="estimatedPrice" label="预估金额" width="120">
          <template #default="{ row }">
            <span style="font-family: JetBrains Mono, monospace">{{ row.estimatedPrice.toLocaleString() }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="urgencyLevel" label="紧急度" width="80">
          <template #default="{ row }">
            <el-tag :type="getUrgencyType(row.urgencyLevel)" size="small">{{ getUrgencyLabel(row.urgencyLevel) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="120" />
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="openViewDialog(row)">查看</el-button>
            <el-button link type="primary" size="small" @click="openEditDialog(row)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="filteredData.length"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next"
        style="margin-top: 16px; justify-content: flex-end;"
      />
    </div>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑采购需求' : '发起采购需求'" width="600px">
      <el-form label-width="100px">
        <el-form-item label="需求标题"><el-input v-model="formData.title" placeholder="请输入需求标题" /></el-form-item>
        <el-form-item label="需求部门">
          <el-select v-model="formData.department" placeholder="请选择部门" style="width: 100%">
            <el-option label="信息中心" value="信息中心" />
            <el-option label="后勤保障部" value="后勤保障部" />
            <el-option label="装备管理部" value="装备管理部" />
            <el-option label="科研技术部" value="科研技术部" />
            <el-option label="财务部" value="财务部" />
            <el-option label="综合管理部" value="综合管理部" />
          </el-select>
        </el-form-item>
        <el-form-item label="采购物品"><el-input v-model="formData.goodsName" placeholder="请输入采购物品名称" /></el-form-item>
        <el-form-item label="预估金额"><el-input v-model="formData.estimatedPrice" type="number" placeholder="请输入预估金额"><template #append>元</template></el-input></el-form-item>
        <el-form-item label="紧急度">
          <el-select v-model="formData.urgencyLevel" style="width: 100%">
            <el-option label="低" value="low" />
            <el-option label="中" value="medium" />
            <el-option label="高" value="high" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="viewDialogVisible" title="采购需求详情" width="600px">
      <el-descriptions :column="2" border v-if="viewData">
        <el-descriptions-item label="需求编号">{{ viewData.reqNo }}</el-descriptions-item>
        <el-descriptions-item label="需求部门">{{ viewData.department }}</el-descriptions-item>
        <el-descriptions-item label="需求标题" :span="2">{{ viewData.title }}</el-descriptions-item>
        <el-descriptions-item label="采购物品">{{ viewData.goodsName }}</el-descriptions-item>
        <el-descriptions-item label="预估金额">{{ viewData.estimatedPrice?.toLocaleString() }} 元</el-descriptions-item>
        <el-descriptions-item label="紧急度">
          <el-tag :type="getUrgencyType(viewData.urgencyLevel)" size="small">{{ getUrgencyLabel(viewData.urgencyLevel) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(viewData.status)">{{ getStatusLabel(viewData.status) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间" :span="2">{{ viewData.createTime }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="viewDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { requirementData as mockData } from '@/api/mock'
import type { Requirement } from '@/api/mock'

const dialogVisible = ref(false)
const viewDialogVisible = ref(false)
const isEdit = ref(false)
const editingId = ref<number | null>(null)
const viewData = ref<Requirement | null>(null)

const currentPage = ref(1)
const pageSize = ref(10)

const formData = reactive({
  title: '',
  department: '',
  goodsName: '',
  estimatedPrice: '',
  urgencyLevel: 'medium'
})

const searchForm = reactive({
  keyword: '',
  status: '',
  urgency: ''
})

let nextId = Math.max(...mockData.map(r => r.id)) + 1

const allData = ref<Requirement[]>([...mockData])

const filteredData = computed(() => {
  return allData.value.filter(item => {
    const matchKeyword = !searchForm.keyword || item.reqNo.toLowerCase().includes(searchForm.keyword.toLowerCase()) || item.title.toLowerCase().includes(searchForm.keyword.toLowerCase())
    const matchStatus = !searchForm.status || item.status === searchForm.status
    const matchUrgency = !searchForm.urgency || item.urgencyLevel === searchForm.urgency
    return matchKeyword && matchStatus && matchUrgency
  })
})

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredData.value.slice(start, end)
})

watch(filteredData, () => {
  currentPage.value = 1
})

const openCreateDialog = () => {
  isEdit.value = false
  editingId.value = null
  Object.assign(formData, { title: '', department: '', goodsName: '', estimatedPrice: '', urgencyLevel: 'medium' })
  dialogVisible.value = true
}

const openEditDialog = (row: Requirement) => {
  isEdit.value = true
  editingId.value = row.id
  Object.assign(formData, {
    title: row.title,
    department: row.department,
    goodsName: row.goodsName,
    estimatedPrice: row.estimatedPrice.toString(),
    urgencyLevel: row.urgencyLevel
  })
  dialogVisible.value = true
}

const openViewDialog = (row: Requirement) => {
  viewData.value = { ...row }
  viewDialogVisible.value = true
}

const handleSave = () => {
  if (isEdit.value && editingId.value !== null) {
    const index = allData.value.findIndex(r => r.id === editingId.value)
    if (index !== -1) {
      allData.value[index] = {
        ...allData.value[index],
        title: formData.title,
        department: formData.department,
        goodsName: formData.goodsName,
        estimatedPrice: parseInt(formData.estimatedPrice) || 0,
        urgencyLevel: formData.urgencyLevel as Requirement['urgencyLevel']
      }
    }
  } else {
    const newReq: Requirement = {
      id: nextId++,
      reqNo: `REQ-2024-${150 + nextId}`,
      title: formData.title,
      department: formData.department,
      goodsName: formData.goodsName,
      estimatedPrice: parseInt(formData.estimatedPrice) || 0,
      urgencyLevel: formData.urgencyLevel as Requirement['urgencyLevel'],
      status: 'draft',
      createTime: new Date().toISOString().split('T')[0]
    }
    allData.value.unshift(newReq)
  }
  dialogVisible.value = false
}

const handleReset = () => {
  searchForm.keyword = ''
  searchForm.status = ''
  searchForm.urgency = ''
}

const getUrgencyType = (level: string) => ({ low: 'info', medium: 'warning', high: 'danger' }[level] || 'info')
const getUrgencyLabel = (level: string) => ({ low: '低', medium: '中', high: '高' }[level] || level)
const getStatusType = (status: string) => ({ draft: 'info', checking: 'warning', pending: 'warning', approved: 'success', rejected: 'danger' }[status] || 'info')
const getStatusLabel = (status: string) => ({ draft: '草稿', checking: '合规检查中', pending: '审批中', approved: '已通过', rejected: '已驳回' }[status] || status)
</script>

<style scoped lang="scss">
.page { .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; h2 { color: #f0f6fc; font-size: 22px; font-weight: 600; } } .search-card { margin-bottom: 16px; } }
</style>
