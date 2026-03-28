<template>
  <div class="page">
    <div class="page-header">
      <h2>采购合同管理</h2>
      <div class="header-actions">
        <el-button>智能生成</el-button>
        <el-button type="primary" @click="openCreateDialog">新建合同</el-button>
      </div>
    </div>

    <div class="card search-card">
      <el-form inline>
        <el-form-item><el-input v-model="searchForm.keyword" placeholder="搜索合同编号/名称" prefix-icon="Search" /></el-form-item>
        <el-form-item>
          <el-select v-model="searchForm.status" placeholder="状态" style="width: 120px">
            <el-option label="全部" value="" />
            <el-option label="草稿" value="draft" />
            <el-option label="待签署" value="pending" />
            <el-option label="已签署" value="signed" />
            <el-option label="执行中" value="performing" />
            <el-option label="已完成" value="completed" />
          </el-select>
        </el-form-item>
        <el-form-item><el-button @click="handleReset">重置</el-button></el-form-item>
      </el-form>
    </div>

    <div class="card">
      <el-table :data="paginatedData" stripe>
        <el-table-column prop="contractNo" label="合同编号" width="140" />
        <el-table-column prop="title" label="合同名称" width="200" />
        <el-table-column prop="supplierName" label="供应商" width="160" />
        <el-table-column prop="totalAmount" label="合同金额" width="140">
          <template #default="{ row }">
            <span style="font-family: JetBrains Mono, monospace">{{ row.totalAmount.toLocaleString() }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="signDate" label="签署日期" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="openViewDialog(row)">查看</el-button>
            <el-button link type="primary" size="small" @click="openEditDialog(row)">编辑</el-button>
            <el-button link type="success" size="small" v-if="row.status === 'draft' || row.status === 'pending'" @click="handleSign(row)">签署</el-button>
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

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑采购合同' : '新建采购合同'" width="600px">
      <el-form label-width="100px">
        <el-form-item label="合同名称"><el-input v-model="formData.title" placeholder="请输入合同名称" /></el-form-item>
        <el-form-item label="供应商"><el-input v-model="formData.supplierName" placeholder="请输入供应商名称" /></el-form-item>
        <el-form-item label="合同金额"><el-input v-model="formData.totalAmount" type="number" placeholder="请输入合同金额"><template #append>元</template></el-input></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="viewDialogVisible" title="合同详情" width="600px">
      <el-descriptions :column="2" border v-if="viewData">
        <el-descriptions-item label="合同编号">{{ viewData.contractNo }}</el-descriptions-item>
        <el-descriptions-item label="签署日期">{{ viewData.signDate }}</el-descriptions-item>
        <el-descriptions-item label="合同名称" :span="2">{{ viewData.title }}</el-descriptions-item>
        <el-descriptions-item label="供应商">{{ viewData.supplierName }}</el-descriptions-item>
        <el-descriptions-item label="合同金额">{{ viewData.totalAmount?.toLocaleString() }} 元</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(viewData.status)">{{ getStatusLabel(viewData.status) }}</el-tag>
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="viewDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { contractData as mockData } from '@/api/mock'
import type { Contract } from '@/api/mock'

const dialogVisible = ref(false)
const viewDialogVisible = ref(false)
const isEdit = ref(false)
const editingId = ref<number | null>(null)
const viewData = ref<Contract | null>(null)

const currentPage = ref(1)
const pageSize = ref(10)

const formData = reactive({
  title: '',
  supplierName: '',
  totalAmount: ''
})

const searchForm = reactive({
  keyword: '',
  status: ''
})

let nextId = Math.max(...mockData.map(c => c.id)) + 1

const allData = ref<Contract[]>([...mockData])

const filteredData = computed(() => {
  return allData.value.filter(item => {
    const matchKeyword = !searchForm.keyword || item.contractNo.toLowerCase().includes(searchForm.keyword.toLowerCase()) || item.title.toLowerCase().includes(searchForm.keyword.toLowerCase())
    const matchStatus = !searchForm.status || item.status === searchForm.status
    return matchKeyword && matchStatus
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
  Object.assign(formData, { title: '', supplierName: '', totalAmount: '' })
  dialogVisible.value = true
}

const openEditDialog = (row: Contract) => {
  isEdit.value = true
  editingId.value = row.id
  Object.assign(formData, {
    title: row.title,
    supplierName: row.supplierName,
    totalAmount: row.totalAmount.toString()
  })
  dialogVisible.value = true
}

const openViewDialog = (row: Contract) => {
  viewData.value = { ...row }
  viewDialogVisible.value = true
}

const handleSave = () => {
  if (isEdit.value && editingId.value !== null) {
    const index = allData.value.findIndex(c => c.id === editingId.value)
    if (index !== -1) {
      allData.value[index] = {
        ...allData.value[index],
        title: formData.title,
        supplierName: formData.supplierName,
        totalAmount: parseInt(formData.totalAmount) || 0
      }
    }
  } else {
    const newContract: Contract = {
      id: nextId++,
      contractNo: `CON-2024-${String(87 + nextId).padStart(3, '0')}`,
      title: formData.title,
      supplierName: formData.supplierName,
      totalAmount: parseInt(formData.totalAmount) || 0,
      signDate: new Date().toISOString().split('T')[0],
      status: 'draft'
    }
    allData.value.unshift(newContract)
  }
  dialogVisible.value = false
}

const handleSign = (row: Contract) => {
  const index = allData.value.findIndex(c => c.id === row.id)
  if (index !== -1) {
    allData.value[index] = { ...allData.value[index], status: 'signed' }
  }
}

const handleReset = () => {
  searchForm.keyword = ''
  searchForm.status = ''
}

const getStatusType = (s: string) => ({ draft: 'info', pending: 'warning', signed: 'success', performing: 'primary', completed: 'success' }[s] || 'info')
const getStatusLabel = (s: string) => ({ draft: '草稿', pending: '待签署', signed: '已签署', performing: '执行中', completed: '已完成' }[s] || s)
</script>

<style scoped lang="scss">
.page { .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; h2 { color: #f0f6fc; font-size: 22px; font-weight: 600; } .header-actions { display: flex; gap: 8px; } } .search-card { margin-bottom: 16px; } }
</style>
