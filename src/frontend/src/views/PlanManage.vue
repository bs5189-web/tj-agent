<template>
  <div class="page">
    <div class="page-header">
      <h2>采购计划管理</h2>
      <div class="header-actions">
        <el-button>导出</el-button>
        <el-button type="primary" @click="dialogVisible = true">新建计划</el-button>
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
        <el-form-item><el-button @click="handleFilter">筛选</el-button></el-form-item>
        <el-form-item><el-button @click="handleReset">重置</el-button></el-form-item>
      </el-form>
    </div>

    <div class="card">
      <el-table :data="filteredData" stripe>
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
            <el-button link type="primary" size="small" @click="handleView(row)">查看</el-button>
            <el-button link type="primary" size="small">编辑</el-button>
            <el-button link type="success" size="small" v-if="row.status === 'draft'">提交</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        :total="filteredData.length"
        :page-size="10"
        layout="prev, pager, next"
        style="margin-top: 16px; justify-content: flex-end;"
      />
    </div>

    <el-dialog v-model="dialogVisible" title="新建采购计划" width="600px">
      <el-form label-width="100px">
        <el-form-item label="计划年度">
          <el-select v-model="newPlanForm.planYear" style="width: 100%">
            <el-option label="2024年" value="2024" />
            <el-option label="2025年" value="2025" />
          </el-select>
        </el-form-item>
        <el-form-item label="编制单位">
          <el-input v-model="newPlanForm.unitName" placeholder="请输入单位名称" />
        </el-form-item>
        <el-form-item label="预算总额">
          <el-input v-model="newPlanForm.totalAmount" type="number" placeholder="请输入预算总额"><template #append>元</template></el-input>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="newPlanForm.remark" type="textarea" :rows="3" placeholder="请输入备注信息" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">创建</el-button>
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
import { ref, reactive, computed } from 'vue'
import { planData } from '@/api/mock'

const dialogVisible = ref(false)
const viewDialogVisible = ref(false)
const viewData = ref<any>(null)

const newPlanForm = reactive({
  planYear: '2024',
  unitName: '',
  totalAmount: '',
  remark: ''
})

const searchForm = reactive({
  keyword: '',
  year: '',
  status: ''
})

let nextId = planData.length + 1

const allData = ref([...planData])

const filteredData = computed(() => {
  return allData.value.filter(item => {
    const matchKeyword = !searchForm.keyword || item.planNo.toLowerCase().includes(searchForm.keyword.toLowerCase())
    const matchYear = !searchForm.year || item.planYear.toString() === searchForm.year
    const matchStatus = !searchForm.status || item.status === searchForm.status
    return matchKeyword && matchYear && matchStatus
  })
})

const handleView = (row: any) => {
  viewData.value = { ...row }
  viewDialogVisible.value = true
}

const handleSubmit = () => {
  const newPlan = {
    id: nextId++,
    planNo: `PLAN-2024-${String(nextId).padStart(3, '0')}`,
    planYear: parseInt(newPlanForm.planYear),
    unitName: newPlanForm.unitName,
    totalAmount: parseInt(newPlanForm.totalAmount) || 0,
    itemCount: 0,
    status: 'draft' as const,
    createTime: new Date().toISOString().split('T')[0]
  }
  allData.value.unshift(newPlan)
  dialogVisible.value = false
  Object.assign(newPlanForm, { planYear: '2024', unitName: '', totalAmount: '', remark: '' })
}

const handleFilter = () => {
  // 筛选由 computed 属性自动处理，这里可以添加额外逻辑
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
</script>

<style scoped lang="scss">
.page { .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; h2 { color: #f0f6fc; font-size: 22px; font-weight: 600; } } .search-card { margin-bottom: 16px; } }
</style>
