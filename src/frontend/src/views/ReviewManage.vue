<template>
  <div class="page">
    <div class="page-header">
      <h2>采购评审管理</h2>
      <div class="header-actions">
        <el-button @click="openExpertDialog">专家管理</el-button>
        <el-button @click="openStatsDialog">统计分析</el-button>
        <el-button type="primary" @click="openCreateDialog">创建评审</el-button>
      </div>
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
        <el-table-column prop="documentTitle" label="评审文档" width="180" />
        <el-table-column prop="expertCount" label="专家数量" width="100">
          <template #default="{ row }">{{ row.expertCount }}人</template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="progress" label="评审进度" width="140">
          <template #default="{ row }">
            <el-progress :percentage="row.progress" :stroke-width="8" />
          </template>
        </el-table-column>
        <el-table-column prop="startTime" label="开始时间" width="150" />
        <el-table-column prop="materialCount" label="材料" width="80">
          <template #default="{ row }">
            <el-badge :value="row.materialCount || 0" :max="99" />
          </template>
        </el-table-column>
        <el-table-column prop="exceptionCount" label="异常" width="80">
          <template #default="{ row }">
            <el-tag v-if="row.exceptionCount > 0" type="danger" size="small">{{ row.exceptionCount }}</el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="openViewDialog(row)">查看</el-button>
            <el-button link type="primary" size="small" @click="openMaterialDialog(row)">材料</el-button>
            <el-button link type="primary" size="small" @click="openScoreDialog(row)">评分</el-button>
            <el-button link type="danger" size="small" @click="openExceptionDialog(row)">异常</el-button>
            <el-button link type="info" size="small" @click="viewRelatedContract(row)" v-if="row.contractId">关联合同</el-button>
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

    <!-- 评审材料对话框 -->
    <el-dialog v-model="materialDialogVisible" title="评审材料" width="600px">
      <div class="material-header">
        <el-upload
          :show-file-list="false"
          :before-upload="handleBeforeUpload"
          action="#"
        >
          <el-button type="primary">上传材料</el-button>
        </el-upload>
      </div>
      <el-table :data="materialList" stripe style="margin-top: 16px">
        <el-table-column prop="fileName" label="文件名称" />
        <el-table-column prop="fileType" label="类型" width="100" />
        <el-table-column prop="fileSize" label="大小" width="100" />
        <el-table-column prop="uploadTime" label="上传时间" width="160" />
        <el-table-column label="操作" width="100">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleDownloadMaterial(row)">下载</el-button>
            <el-button link type="danger" size="small" @click="handleDeleteMaterial(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <el-button @click="materialDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 专家管理对话框 -->
    <el-dialog v-model="expertDialogVisible" title="专家管理" width="700px">
      <div class="expert-header">
        <el-button type="primary" @click="openAddExpertDialog">添加专家</el-button>
      </div>
      <el-table :data="expertList" stripe style="margin-top: 16px">
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="title" label="职称" width="120" />
        <el-table-column prop="domain" label="擅长领域" />
        <el-table-column prop="phone" label="联系电话" width="140" />
        <el-table-column prop="email" label="邮箱" width="180" />
        <el-table-column label="操作" width="100">
          <template #default="{ row }">
            <el-button link type="danger" size="small" @click="handleDeleteExpert(row)">移除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <el-button @click="expertDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 添加专家对话框 -->
    <el-dialog v-model="addExpertDialogVisible" title="添加专家" width="500px">
      <el-form label-width="100px">
        <el-form-item label="姓名"><el-input v-model="expertForm.name" placeholder="请输入姓名" /></el-form-item>
        <el-form-item label="职称">
          <el-select v-model="expertForm.title" style="width: 100%">
            <el-option label="教授" value="教授" />
            <el-option label="副教授" value="副教授" />
            <el-option label="高级工程师" value="高级工程师" />
            <el-option label="工程师" value="工程师" />
            <el-option label="研究员" value="研究员" />
            <el-option label="副研究员" value="副研究员" />
          </el-select>
        </el-form-item>
        <el-form-item label="擅长领域"><el-input v-model="expertForm.domain" placeholder="请输入擅长领域" /></el-form-item>
        <el-form-item label="联系电话"><el-input v-model="expertForm.phone" placeholder="请输入联系电话" /></el-form-item>
        <el-form-item label="邮箱"><el-input v-model="expertForm.email" placeholder="请输入邮箱" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addExpertDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleAddExpert">添加</el-button>
      </template>
    </el-dialog>

    <!-- 统计分析对话框 -->
    <el-dialog v-model="statsDialogVisible" title="评分统计分析" width="700px">
      <div class="stats-container">
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="stats-card">
              <h4>评分分布</h4>
              <div class="stats-chart">
                <el-progress type="circle" :percentage="85" :stroke-width="10" color="#67c23a">
                  <template #default>85分</template>
                </el-progress>
                <div class="stats-legend">
                  <div class="legend-item"><span class="dot excellent"></span>优秀 (90-100): 35%</div>
                  <div class="legend-item"><span class="dot good"></span>良好 (80-89): 45%</div>
                  <div class="legend-item"><span class="dot fair"></span>一般 (70-79): 15%</div>
                  <div class="legend-item"><span class="dot poor"></span>较差 (&lt;70): 5%</div>
                </div>
              </div>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="stats-card">
              <h4>评审统计</h4>
              <div class="stats-summary">
                <div class="summary-item">
                  <span class="label">总评审数</span>
                  <span class="value">{{ reviewStats.totalCount }}</span>
                </div>
                <div class="summary-item">
                  <span class="label">已完成</span>
                  <span class="value success">{{ reviewStats.completedCount }}</span>
                </div>
                <div class="summary-item">
                  <span class="label">进行中</span>
                  <span class="value warning">{{ reviewStats.ongoingCount }}</span>
                </div>
                <div class="summary-item">
                  <span class="label">平均分</span>
                  <span class="value">{{ reviewStats.avgScore }}分</span>
                </div>
                <div class="summary-item">
                  <span class="label">最高分</span>
                  <span class="value">{{ reviewStats.maxScore }}分</span>
                </div>
                <div class="summary-item">
                  <span class="label">最低分</span>
                  <span class="value">{{ reviewStats.minScore }}分</span>
                </div>
              </div>
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="20" style="margin-top: 20px">
          <el-col :span="24">
            <div class="stats-card">
              <h4>月度评审趋势</h4>
              <div class="trend-bars">
                <div class="trend-bar" v-for="(month, idx) in reviewStats.monthlyTrend" :key="idx">
                  <div class="bar" :style="{ height: month.percentage + '%' }"></div>
                  <span class="month">{{ month.month }}</span>
                </div>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
      <template #footer>
        <el-button @click="statsDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 异常处理对话框 -->
    <el-dialog v-model="exceptionDialogVisible" title="异常记录" width="700px">
      <div class="exception-header">
        <el-select v-model="exceptionFilter" placeholder="筛选状态" style="width: 120px">
          <el-option label="全部" value="" />
          <el-option label="待处理" value="pending" />
          <el-option label="处理中" value="processing" />
          <el-option label="已处理" value="resolved" />
        </el-select>
      </div>
      <el-table :data="filteredExceptionList" stripe style="margin-top: 16px">
        <el-table-column prop="exceptionNo" label="异常编号" width="150" />
        <el-table-column prop="sessionNo" label="评审编号" width="140" />
        <el-table-column prop="exceptionType" label="异常类型" width="120" />
        <el-table-column prop="description" label="异常描述" />
        <el-table-column prop="createTime" label="发生时间" width="160" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getExceptionStatusType(row.status)" size="small">
              {{ getExceptionStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleProcessException(row)">处理</el-button>
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <el-button @click="exceptionDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 处理异常对话框 -->
    <el-dialog v-model="processExceptionDialogVisible" title="处理异常" width="500px">
      <el-form label-width="100px">
        <el-form-item label="异常编号">{{ processingException?.exceptionNo }}</el-form-item>
        <el-form-item label="异常类型">{{ processingException?.exceptionType }}</el-form-item>
        <el-form-item label="异常描述">{{ processingException?.description }}</el-form-item>
        <el-form-item label="处理状态">
          <el-select v-model="exceptionProcessForm.status" style="width: 100%">
            <el-option label="处理中" value="processing" />
            <el-option label="已处理" value="resolved" />
          </el-select>
        </el-form-item>
        <el-form-item label="处理备注">
          <el-input v-model="exceptionProcessForm.remark" type="textarea" :rows="3" placeholder="请输入处理备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="processExceptionDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveException">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { reviewData as mockData } from '@/api/mock'
import type { Review } from '@/api/mock'

const router = useRouter()
const route = useRoute()

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

// 材料管理
const materialDialogVisible = ref(false)
const currentReviewForMaterial = ref<Review | null>(null)
const materialList = ref([
  { id: 1, fileName: '采购需求说明书.pdf', fileType: 'PDF', fileSize: '2.5MB', uploadTime: '2024-03-20 10:30:00' },
  { id: 2, fileName: '技术规格书.docx', fileType: 'DOCX', fileSize: '1.2MB', uploadTime: '2024-03-20 11:15:00' },
  { id: 3, fileName: '预算方案.xlsx', fileType: 'XLSX', fileSize: '856KB', uploadTime: '2024-03-21 09:00:00' },
])

const openMaterialDialog = (row: Review) => {
  currentReviewForMaterial.value = row
  materialDialogVisible.value = true
}

const handleBeforeUpload = (file: any) => {
  const newMaterial = {
    id: Math.max(...materialList.value.map(m => m.id)) + 1,
    fileName: file.name,
    fileType: file.name.split('.').pop()?.toUpperCase() || 'UNKNOWN',
    fileSize: (file.size / 1024 / 1024).toFixed(2) + 'MB',
    uploadTime: new Date().toISOString().replace('T', ' ').substring(0, 19)
  }
  materialList.value.push(newMaterial)
  ElMessage.success('材料上传成功')
  return false
}

const handleDownloadMaterial = (row: any) => {
  ElMessage.info(`下载文件: ${row.fileName}`)
}

const handleDeleteMaterial = (row: any) => {
  materialList.value = materialList.value.filter(m => m.id !== row.id)
  ElMessage.success('材料删除成功')
}

// 专家管理
const expertDialogVisible = ref(false)
const addExpertDialogVisible = ref(false)

const expertForm = reactive({
  name: '',
  title: '',
  domain: '',
  phone: '',
  email: ''
})

const expertList = ref([
  { id: 1, name: '张专家', title: '教授', domain: '计算机科学与技术', phone: '13800138001', email: 'zhang@example.com' },
  { id: 2, name: '李专家', title: '高级工程师', domain: '电子工程', phone: '13800138002', email: 'li@example.com' },
  { id: 3, name: '王专家', title: '副教授', domain: '机械工程', phone: '13800138003', email: 'wang@example.com' },
  { id: 4, name: '赵专家', title: '研究员', domain: '项目管理', phone: '13800138004', email: 'zhao@example.com' },
])

const openExpertDialog = () => {
  expertDialogVisible.value = true
}

const openAddExpertDialog = () => {
  Object.assign(expertForm, { name: '', title: '', domain: '', phone: '', email: '' })
  addExpertDialogVisible.value = true
}

const handleAddExpert = () => {
  expertList.value.push({
    id: Math.max(...expertList.value.map(e => e.id)) + 1,
    ...expertForm
  })
  addExpertDialogVisible.value = false
  ElMessage.success('专家添加成功')
}

const handleDeleteExpert = (row: any) => {
  expertList.value = expertList.value.filter(e => e.id !== row.id)
  ElMessage.success('专家移除成功')
}

// 统计分析
const statsDialogVisible = ref(false)

const reviewStats = ref({
  totalCount: 156,
  completedCount: 120,
  ongoingCount: 36,
  avgScore: 82.5,
  maxScore: 98,
  minScore: 65,
  monthlyTrend: [
    { month: '1月', count: 12, percentage: 60 },
    { month: '2月', count: 15, percentage: 75 },
    { month: '3月', count: 18, percentage: 90 },
    { month: '4月', count: 14, percentage: 70 },
    { month: '5月', count: 16, percentage: 80 },
    { month: '6月', count: 20, percentage: 100 },
  ]
})

const openStatsDialog = () => {
  statsDialogVisible.value = true
}

// 异常处理
const exceptionDialogVisible = ref(false)
const processExceptionDialogVisible = ref(false)
const currentReviewForException = ref<Review | null>(null)
const exceptionFilter = ref('')
const processingException = ref<any>(null)

const exceptionProcessForm = reactive({
  status: 'processing',
  remark: ''
})

const exceptionList = ref([
  { id: 1, exceptionNo: 'EXP-2024-001', sessionNo: 'REV-2024-001', exceptionType: '材料缺失', description: '缺少供应商资质证明文件', createTime: '2024-03-25 14:30:00', status: 'pending' },
  { id: 2, exceptionNo: 'EXP-2024-002', sessionNo: 'REV-2024-003', exceptionType: '评分异常', description: '专家评分差异过大', createTime: '2024-03-26 09:15:00', status: 'processing' },
  { id: 3, exceptionNo: 'EXP-2024-003', sessionNo: 'REV-2024-005', exceptionType: '超时', description: '评审超时未完成', createTime: '2024-03-26 16:45:00', status: 'resolved' },
  { id: 4, exceptionNo: 'EXP-2024-004', sessionNo: 'REV-2024-007', exceptionType: '信息错误', description: '采购数量与预算不符', createTime: '2024-03-27 10:20:00', status: 'pending' },
])

const filteredExceptionList = computed(() => {
  if (!exceptionFilter.value) return exceptionList.value
  return exceptionList.value.filter(e => e.status === exceptionFilter.value)
})

const openExceptionDialog = (row: Review) => {
  currentReviewForException.value = row
  exceptionDialogVisible.value = true
}

const handleProcessException = (row: any) => {
  processingException.value = row
  exceptionProcessForm.status = row.status === 'pending' ? 'processing' : row.status
  exceptionProcessForm.remark = ''
  processExceptionDialogVisible.value = true
}

const handleSaveException = () => {
  if (processingException.value) {
    const idx = exceptionList.value.findIndex(e => e.id === processingException.value.id)
    if (idx !== -1) {
      exceptionList.value[idx] = {
        ...exceptionList.value[idx],
        status: exceptionProcessForm.status
      }
    }
  }
  processExceptionDialogVisible.value = false
  ElMessage.success('异常处理成功')
}

const getExceptionStatusType = (status: string) => ({
  pending: 'warning',
  processing: 'primary',
  resolved: 'success'
}[status] || 'info')

const getExceptionStatusLabel = (status: string) => ({
  pending: '待处理',
  processing: '处理中',
  resolved: '已处理'
}[status] || status)

let nextId = Math.max(...mockData.map(r => r.id)) + 1

const allData = ref<Review[]>([...mockData])

// Handle route params for filtering by contractId
onMounted(() => {
  const contractId = route.params.contractId
  if (contractId) {
    allData.value = allData.value.filter(r => r.contractId === Number(contractId))
  }
})

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

// 查看关联合同
const viewRelatedContract = (row: Review) => {
  if (row.contractId) {
    router.push({
      name: 'ContractByRequirement',
      params: { requirementId: row.contractId.toString() }
    })
  }
}
</script>

<style scoped lang="scss">
.page {
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    h2 { color: #f0f6fc; font-size: 22px; font-weight: 600; }
    .header-actions { display: flex; gap: 12px; }
  }
  .search-card { margin-bottom: 16px; }
  .material-header { display: flex; justify-content: flex-start; }
  .expert-header { display: flex; justify-content: flex-start; }
  .exception-header { display: flex; justify-content: flex-start; gap: 12px; }
  .stats-container {
    .stats-card {
      background: #1a1d23;
      border-radius: 8px;
      padding: 16px;
      h4 { color: #f0f6fc; margin: 0 0 16px 0; font-size: 16px; }
      .stats-chart { display: flex; align-items: center; gap: 24px; }
      .stats-legend { flex: 1; }
      .legend-item { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; color: #c9d1d9; font-size: 14px; .dot { width: 10px; height: 10px; border-radius: 50%; } .excellent { background: #67c23a; } .good { background: #409eff; } .fair { background: #e6a23c; } .poor { background: #f56c6c; } }
      .stats-summary { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
      .summary-item { display: flex; justify-content: space-between; padding: 8px 12px; background: #21252b; border-radius: 4px; .label { color: #8b949e; } .value { color: #f0f6fc; font-weight: 600; &.success { color: #67c23a; } &.warning { color: #e6a23c; } } }
      .trend-bars { display: flex; justify-content: space-around; align-items: flex-end; height: 120px; padding-top: 20px; .trend-bar { display: flex; flex-direction: column; align-items: center; gap: 8px; .bar { width: 40px; background: linear-gradient(to top, #409eff, #67c23a); border-radius: 4px 4px 0 0; min-height: 20px; } .month { color: #8b949e; font-size: 12px; } } }
    }
  }
}
</style>
