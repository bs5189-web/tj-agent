<template>
  <div class="page">
    <div class="page-header">
      <h2>采购评审管理</h2>
      <el-button type="primary" @click="openCreateDialog">创建评审</el-button>
    </div>

    <div class="card search-card">
      <el-form inline>
        <el-form-item><el-input v-model="searchForm.keyword" placeholder="搜索评审编号/文档" prefix-icon="Search" /></el-form-item>
        <el-form-item>
          <el-select v-model="searchForm.status" placeholder="状态" style="width: 120px">
            <el-option label="全部" value="" />
            <el-option label="准备中" value="preparing" />
            <el-option label="评审中" value="ongoing" />
            <el-option label="已完成" value="completed" />
          </el-select>
        </el-form-item>
        <el-form-item><el-button @click="handleReset">重置</el-button></el-form-item>
      </el-form>
    </div>

    <div class="card">
      <el-table :data="paginatedData" stripe>
        <el-table-column prop="sessionNo" label="评审编号" width="140" />
        <el-table-column prop="documentTitle" label="评审文档" width="220" />
        <el-table-column prop="expertCount" label="专家数量" width="100">
          <template #default="{ row }">{{ row.expertCount }}人</template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="progress" label="评审进度" width="180">
          <template #default="{ row }">
            <el-progress :percentage="row.progress" :stroke-width="8" />
          </template>
        </el-table-column>
        <el-table-column prop="startTime" label="开始时间" width="150" />
        <el-table-column label="操作" width="160">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="openViewDialog(row)">查看</el-button>
            <el-button link type="primary" size="small" @click="openScoreDialog(row)">评分</el-button>
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

    <el-dialog v-model="viewDialogVisible" title="评审详情" width="600px">
      <el-descriptions :column="2" border v-if="viewData">
        <el-descriptions-item label="评审编号">{{ viewData.sessionNo }}</el-descriptions-item>
        <el-descriptions-item label="专家数量">{{ viewData.expertCount }}人</el-descriptions-item>
        <el-descriptions-item label="评审文档" :span="2">{{ viewData.documentTitle }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(viewData.status)">{{ getStatusLabel(viewData.status) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="评审进度">{{ viewData.progress }}%</el-descriptions-item>
        <el-descriptions-item label="开始时间">{{ viewData.startTime }}</el-descriptions-item>
        <el-descriptions-item label="结束时间">{{ viewData.endTime }}</el-descriptions-item>
        <el-descriptions-item label="评审分数" v-if="viewData.score">{{ viewData.score }}分</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="viewDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="createDialogVisible" title="创建评审" width="500px">
      <el-form label-width="100px">
        <el-form-item label="评审文档">
          <el-input v-model="formData.documentTitle" placeholder="请输入评审文档标题" />
        </el-form-item>
        <el-form-item label="专家数量">
          <el-input-number v-model="formData.expertCount" :min="3" :max="15" />
        </el-form-item>
        <el-form-item label="计划开始">
          <el-date-picker v-model="formData.startTime" type="datetime" placeholder="选择开始时间" value-format="YYYY-MM-DD HH:mm" style="width: 100%" />
        </el-form-item>
        <el-form-item label="计划结束">
          <el-date-picker v-model="formData.endTime" type="datetime" placeholder="选择结束时间" value-format="YYYY-MM-DD HH:mm" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleCreate">创建</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="scoreDialogVisible" title="评审评分" width="500px">
      <el-form label-width="100px">
        <el-form-item label="评审编号">{{ scoringReview?.sessionNo }}</el-form-item>
        <el-form-item label="评审文档">{{ scoringReview?.documentTitle }}</el-form-item>
        <el-form-item label="评审分数">
          <el-input-number v-model="scoreForm.score" :min="0" :max="100" :precision="0" />
          <span style="margin-left: 8px">分</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="scoreDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleScore">提交评分</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { reviewData as mockData } from '@/api/mock'
import type { Review } from '@/api/mock'

const viewDialogVisible = ref(false)
const createDialogVisible = ref(false)
const scoreDialogVisible = ref(false)
const viewData = ref<Review | null>(null)
const scoringReview = ref<Review | null>(null)

const currentPage = ref(1)
const pageSize = ref(10)

const searchForm = reactive({
  keyword: '',
  status: ''
})

const formData = reactive({
  documentTitle: '',
  expertCount: 5,
  startTime: '',
  endTime: ''
})

const scoreForm = reactive({
  score: 0
})

let nextId = Math.max(...mockData.map(r => r.id)) + 1

const allData = ref<Review[]>([...mockData])

const filteredData = computed(() => {
  return allData.value.filter(item => {
    const matchKeyword = !searchForm.keyword || item.sessionNo.toLowerCase().includes(searchForm.keyword.toLowerCase()) || item.documentTitle.toLowerCase().includes(searchForm.keyword.toLowerCase())
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

const openViewDialog = (row: Review) => {
  viewData.value = { ...row }
  viewDialogVisible.value = true
}

const openCreateDialog = () => {
  formData.documentTitle = ''
  formData.expertCount = 5
  formData.startTime = ''
  formData.endTime = ''
  createDialogVisible.value = true
}

const openScoreDialog = (row: Review) => {
  scoringReview.value = row
  scoreForm.score = row.score || 0
  scoreDialogVisible.value = true
}

const handleCreate = () => {
  const newReview: Review = {
    id: nextId++,
    sessionNo: `REV-2024-${String(nextId).padStart(3, '0')}`,
    documentTitle: formData.documentTitle,
    expertCount: formData.expertCount,
    status: 'preparing',
    progress: 0,
    startTime: formData.startTime || '-',
    endTime: formData.endTime || '-'
  }
  allData.value.unshift(newReview)
  createDialogVisible.value = false
}

const handleScore = () => {
  if (scoringReview.value) {
    const index = allData.value.findIndex(r => r.id === scoringReview.value!.id)
    if (index !== -1) {
      allData.value[index] = {
        ...allData.value[index],
        score: scoreForm.score,
        scoreTime: new Date().toISOString().split('T')[0],
        progress: 100,
        status: 'completed'
      }
    }
  }
  scoreDialogVisible.value = false
}

const handleReset = () => {
  searchForm.keyword = ''
  searchForm.status = ''
}

const getStatusType = (s: string) => ({ preparing: 'info', ongoing: 'warning', completed: 'success' }[s] || 'info')
const getStatusLabel = (s: string) => ({ preparing: '准备中', ongoing: '评审中', completed: '已完成' }[s] || s)
</script>

<style scoped lang="scss">
.page { .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; h2 { color: #f0f6fc; font-size: 22px; font-weight: 600; } } .search-card { margin-bottom: 16px; } }
</style>
