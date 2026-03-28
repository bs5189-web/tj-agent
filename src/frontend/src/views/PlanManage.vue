<template>
  <div class="page">
    <div class="page-header">
      <h2>采购计划管理</h2>
      <div class="header-actions">
        <el-button @click="handleExport">导出</el-button>
        <el-button type="primary" @click="openCreateDialog">新建计划</el-button>
      </div>
    </div>

    <div class="card search-card">
      <el-form inline>
        <el-form-item><el-input v-model="searchForm.keyword" placeholder="搜索计划编号" prefix-icon="Search" /></el-form-item>
        <el-form-item>
          <el-select v-model="searchForm.year" placeholder="年度" style="width: 120px">
            <el-option label="全部" value="" />
            <el-option label="2024年" value="2024" />
            <el-option label="2025年" value="2025" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-select v-model="searchForm.status" placeholder="状态" style="width: 120px">
            <el-option label="全部" value="" />
            <el-option label="草稿" value="draft" />
            <el-option label="审批中" value="pending" />
            <el-option label="已通过" value="approved" />
            <el-option label="已驳回" value="rejected" />
          </el-select>
        </el-form-item>
        <el-form-item><el-button @click="handleReset">重置</el-button></el-form-item>
      </el-form>
    </div>

    <div class="card">
      <el-table :data="paginatedData" stripe>
        <el-table-column prop="planNo" label="计划编号" width="150" />
        <el-table-column prop="planYear" label="计划年度" width="100" />
        <el-table-column prop="unitName" label="编制单位" width="120" />
        <el-table-column prop="totalAmount" label="总金额(元)" width="140">
          <template #default="{ row }">
            <span style="font-family: JetBrains Mono, monospace">{{ row.totalAmount.toLocaleString() }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="itemCount" label="明细项数" width="80" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="120" />
        <el-table-column label="操作" width="180">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="openViewDialog(row)">查看</el-button>
            <el-button link type="primary" size="small" @click="openEditDialog(row)">编辑</el-button>
            <el-button link type="success" size="small" v-if="row.status === 'draft'" @click="handleSubmitPlan(row)">提交</el-button>
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

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑采购计划' : '新建采购计划'" width="600px">
      <el-form label-width="100px">
        <el-form-item label="计划年度">
          <el-select v-model="formData.planYear" style="width: 100%">
            <el-option label="2024年" value="2024" />
            <el-option label="2025年" value="2025" />
          </el-select>
        </el-form-item>
        <el-form-item label="编制单位">
          <el-input v-model="formData.unitName" placeholder="请输入单位名称" />
        </el-form-item>
        <el-form-item label="预算总额">
          <el-input v-model="formData.totalAmount" type="number" placeholder="请输入预算总额"><template #append>元</template></el-input>
        </el-form-item>
        <el-form-item label="明细项数">
          <el-input v-model="formData.itemCount" type="number" placeholder="请输入明细项数" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="formData.remark" type="textarea" :rows="3" placeholder="请输入备注信息" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="viewDialogVisible" title="采购计划详情" width="600px">
      <el-descriptions :column="2" border v-if="viewData">
        <el-descriptions-item label="计划编号">{{ viewData.planNo }}</el-descriptions-item>
        <el-descriptions-item label="计划年度">{{ viewData.planYear }}</el-descriptions-item>
        <el-descriptions-item label="编制单位">{{ viewData.unitName }}</el-descriptions-item>
        <el-descriptions-item label="总金额">{{ viewData.totalAmount?.toLocaleString() }} 元</el-descriptions-item>
        <el-descriptions-item label="明细项数">{{ viewData.itemCount }}</el-descriptions-item>
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
import { planData as mockPlanData } from '@/api/mock'
import type { Plan } from '@/api/mock'

const dialogVisible = ref(false)
const viewDialogVisible = ref(false)
const isEdit = ref(false)
const editingId = ref<number | null>(null)
const viewData = ref<Plan | null>(null)

const currentPage = ref(1)
const pageSize = ref(10)

const formData = reactive({
  planYear: '2024',
  unitName: '',
  totalAmount: '',
  itemCount: '',
  remark: ''
})

const searchForm = reactive({
  keyword: '',
  year: '',
  status: ''
})

let nextId = Math.max(...mockPlanData.map(p => p.id)) + 1

const allData = ref<Plan[]>([...mockPlanData])

const filteredData = computed(() => {
  return allData.value.filter(item => {
    const matchKeyword = !searchForm.keyword || item.planNo.toLowerCase().includes(searchForm.keyword.toLowerCase())
    const matchYear = !searchForm.year || item.planYear.toString() === searchForm.year
    const matchStatus = !searchForm.status || item.status === searchForm.status
    return matchKeyword && matchYear && matchStatus
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
  Object.assign(formData, { planYear: '2024', unitName: '', totalAmount: '', itemCount: '', remark: '' })
  dialogVisible.value = true
}

const openEditDialog = (row: Plan) => {
  isEdit.value = true
  editingId.value = row.id
  Object.assign(formData, {
    planYear: row.planYear.toString(),
    unitName: row.unitName,
    totalAmount: row.totalAmount.toString(),
    itemCount: row.itemCount.toString(),
    remark: ''
  })
  dialogVisible.value = true
}

const openViewDialog = (row: Plan) => {
  viewData.value = { ...row }
  viewDialogVisible.value = true
}

const handleSave = () => {
  if (isEdit.value && editingId.value !== null) {
    const index = allData.value.findIndex(p => p.id === editingId.value)
    if (index !== -1) {
      allData.value[index] = {
        ...allData.value[index],
        planYear: parseInt(formData.planYear),
        unitName: formData.unitName,
        totalAmount: parseInt(formData.totalAmount) || 0,
        itemCount: parseInt(formData.itemCount) || 0
      }
    }
  } else {
    const newPlan: Plan = {
      id: nextId++,
      planNo: `PLAN-2024-${String(nextId).padStart(3, '0')}`,
      planYear: parseInt(formData.planYear),
      unitName: formData.unitName,
      totalAmount: parseInt(formData.totalAmount) || 0,
      itemCount: parseInt(formData.itemCount) || 0,
      status: 'draft',
      createTime: new Date().toISOString().split('T')[0]
    }
    allData.value.unshift(newPlan)
  }
  dialogVisible.value = false
}

const handleSubmitPlan = (row: Plan) => {
  const index = allData.value.findIndex(p => p.id === row.id)
  if (index !== -1) {
    allData.value[index] = { ...allData.value[index], status: 'pending' }
  }
}

const handleReset = () => {
  searchForm.keyword = ''
  searchForm.year = ''
  searchForm.status = ''
}

const getStatusType = (status: string) => {
  const map: Record<string, any> = { draft: 'info', pending: 'warning', approved: 'success', rejected: 'danger' }
  return map[status] || 'info'
}

const getStatusLabel = (status: string) => {
  const map: Record<string, string> = { draft: '草稿', pending: '审批中', approved: '已通过', rejected: '已驳回' }
  return map[status] || status
}

const handleExport = () => {
  const headers = ['计划编号', '计划年度', '编制单位', '总金额(元)', '明细项数', '状态', '创建时间']
  const rows = filteredData.value.map(item => [
    item.planNo,
    item.planYear,
    item.unitName,
    item.totalAmount,
    item.itemCount,
    getStatusLabel(item.status),
    item.createTime
  ])

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
  const BOM = '\uFEFF'
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `采购计划_${new Date().toISOString().split('T')[0]}.csv`
  link.click()
  URL.revokeObjectURL(url)
}
</script>

<style scoped lang="scss">
.page { .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; h2 { color: #f0f6fc; font-size: 22px; font-weight: 600; } } .search-card { margin-bottom: 16px; } }
</style>
