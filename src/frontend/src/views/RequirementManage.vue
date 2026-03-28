<template>
  <div class="page">
    <div class="page-header">
      <h2>采购需求管理</h2>
      <div class="header-actions">
        <el-button @click="openComplianceDialog">合规检查</el-button>
        <el-button @click="openReviewDialog">提交审核</el-button>
        <el-button type="primary" @click="openCreateDialog">发起需求</el-button>
      </div>
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
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="openViewDialog(row)">查看</el-button>
            <el-button link type="primary" size="small" @click="openEditDialog(row)">编辑</el-button>
            <el-button link type="success" size="small" @click="openAttachmentDialog(row)">附件</el-button>
            <el-button link type="warning" size="small" @click="viewRelatedPlan(row)" v-if="row.planId">关联计划</el-button>
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
        <el-descriptions-item label="合规检查">
          <el-tag v-if="viewData.complianceStatus === 'passed'" type="success" size="small">通过</el-tag>
          <el-tag v-else-if="viewData.complianceStatus === 'failed'" type="danger" size="small">未通过</el-tag>
          <el-tag v-else type="info" size="small">未检查</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="审核进度">
          <el-progress :percentage="viewData.reviewProgress || 0" :stroke-width="15" v-if="viewData.status === 'pending'">
            <span>{{ viewData.reviewProgress || 0 }}%</span>
          </el-progress>
          <span v-else>-</span>
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="viewDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="complianceDialogVisible" title="合规检查" width="500px">
      <el-form label-width="120px" v-if="complianceRequirement">
        <el-form-item label="需求编号">{{ complianceRequirement.reqNo }}</el-form-item>
        <el-form-item label="需求标题">{{ complianceRequirement.title }}</el-form-item>
      </el-form>
      <el-divider content-position="left">检查规则</el-divider>
      <el-checkbox-group v-model="checkedRules" class="compliance-rules">
        <el-checkbox label="budget">预算合规检查</el-checkbox>
        <el-checkbox label="procurement">采购方式合规</el-checkbox>
        <el-checkbox label="supplier">供应商资质审查</el-checkbox>
        <el-checkbox label="price">价格合理性分析</el-checkbox>
        <el-checkbox label="specification">规格标准合规</el-checkbox>
      </el-checkbox-group>
      <template #footer>
        <el-button @click="complianceDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleComplianceCheck">开始检查</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="complianceResultDialogVisible" title="合规检查结果" width="600px">
      <el-result
        :icon="complianceResult.passed ? 'success' : 'error'"
        :title="complianceResult.passed ? '合规检查通过' : '合规检查未通过'"
      >
        <template #extra>
          <el-divider content-position="left">检查详情</el-divider>
          <el-table :data="complianceResult.details" stripe size="small">
            <el-table-column prop="rule" label="检查规则" width="150" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.passed ? 'success' : 'danger'" size="small">{{ row.passed ? '通过' : '未通过' }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="message" label="说明" />
          </el-table>
        </template>
      </el-result>
      <template #footer>
        <el-button type="primary" @click="complianceResultDialogVisible = false">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="reviewDialogVisible" title="提交审核" width="600px">
      <el-form label-width="120px" v-if="reviewRequirement">
        <el-form-item label="需求编号">{{ reviewRequirement.reqNo }}</el-form-item>
        <el-form-item label="需求标题">{{ reviewRequirement.title }}</el-form-item>
        <el-form-item label="预估金额">{{ reviewRequirement.estimatedPrice?.toLocaleString() }} 元</el-form-item>
      </el-form>
      <el-divider content-position="left">审核流程</el-divider>
      <el-steps :active="reviewStepsActive" finish-status="success" align-center>
        <el-step title="提交申请" />
        <el-step title="部门初审" />
        <el-step title="财务复核" />
        <el-step title="领导审批" />
      </el-steps>
      <el-divider content-position="left">审批历史</el-divider>
      <el-timeline>
        <el-timeline-item
          v-for="(item, index) in reviewHistory"
          :key="index"
          :timestamp="item.timestamp"
          :type="item.type"
          :icon="item.icon"
        >
          <h4>{{ item.title }}</h4>
          <p>{{ item.content }}</p>
        </el-timeline-item>
      </el-timeline>
      <template #footer>
        <el-button @click="reviewDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="handleSubmitReview" :disabled="reviewRequirement?.status !== 'checking' && reviewRequirement?.status !== 'draft'">提交审核</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="attachmentDialogVisible" title="需求附件管理" width="600px">
      <el-form label-width="100px" v-if="attachmentRequirement">
        <el-form-item label="需求编号">{{ attachmentRequirement.reqNo }}</el-form-item>
        <el-form-item label="需求标题">{{ attachmentRequirement.title }}</el-form-item>
      </el-form>
      <el-divider content-position="left">附件列表</el-divider>
      <el-upload
        ref="uploadRef"
        class="attachment-upload"
        action="#"
        :auto-upload="false"
        :on-change="handleFileChange"
        :file-list="fileList"
        accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.png"
      >
        <el-button type="primary" size="small">选择文件</el-button>
        <template #tip>
          <div class="el-upload__tip">支持 PDF、Word、Excel、图片格式，单个文件不超过 10MB</div>
        </template>
      </el-upload>
      <el-table :data="attachmentList" stripe size="small" style="margin-top: 16px;">
        <el-table-column prop="name" label="文件名" />
        <el-table-column prop="size" label="大小" width="100">
          <template #default="{ row }">
            {{ (row.size / 1024).toFixed(1) }} KB
          </template>
        </el-table-column>
        <el-table-column prop="uploadTime" label="上传时间" width="160" />
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleDownloadAttachment(row)">下载</el-button>
            <el-button link type="danger" size="small" @click="handleDeleteAttachment(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <el-button @click="attachmentDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="handleUploadAttachment">上传</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { requirementData as mockData } from '@/api/mock'
import type { Requirement } from '@/api/mock'

const router = useRouter()
const route = useRoute()

interface RequirementWithMeta extends Requirement {
  complianceStatus?: 'none' | 'passed' | 'failed'
  reviewProgress?: number
}

interface ReviewHistoryItem {
  timestamp: string
  title: string
  content: string
  type: string
  icon: string
}

interface ComplianceResultDetail {
  rule: string
  passed: boolean
  message: string
}

interface ComplianceResult {
  passed: boolean
  details: ComplianceResultDetail[]
}

interface Attachment {
  id: number
  name: string
  size: number
  uploadTime: string
}

const dialogVisible = ref(false)
const viewDialogVisible = ref(false)
const complianceDialogVisible = ref(false)
const complianceResultDialogVisible = ref(false)
const reviewDialogVisible = ref(false)
const attachmentDialogVisible = ref(false)
const isEdit = ref(false)
const editingId = ref<number | null>(null)
const viewData = ref<RequirementWithMeta | null>(null)
const complianceRequirement = ref<Requirement | null>(null)
const reviewRequirement = ref<Requirement | null>(null)
const attachmentRequirement = ref<Requirement | null>(null)

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

const checkedRules = ref<string[]>(['budget', 'procurement', 'supplier', 'price', 'specification'])
const reviewStepsActive = ref(0)
const reviewHistory = ref<ReviewHistoryItem[]>([])
const complianceResult = ref<ComplianceResult>({ passed: true, details: [] })
const fileList = ref<any[]>([])
const attachmentList = ref<Attachment[]>([])
const uploadRef = ref()

let nextId = Math.max(...mockData.map(r => r.id)) + 1

const allData = ref<RequirementWithMeta[]>(mockData.map(r => ({
  ...r,
  complianceStatus: r.status === 'approved' ? 'passed' : r.status === 'rejected' ? 'failed' : 'none',
  reviewProgress: r.status === 'pending' ? 50 : r.status === 'approved' ? 100 : 0
})))

// Handle route params for filtering by planId or status
onMounted(() => {
  const planId = route.params.planId
  const status = route.params.status

  if (planId) {
    searchForm.keyword = `planId:${planId}`
    // Filter data by planId
    allData.value = allData.value.filter(r => r.planId === Number(planId))
  } else if (status) {
    searchForm.status = status as string
  }
})

const filteredData = computed(() => {
  return allData.value.filter(item => {
    const matchKeyword = !searchForm.keyword || item.reqNo.toLowerCase().includes(searchForm.keyword.toLowerCase()) || item.title.toLowerCase().includes(searchForm.keyword.toLowerCase())
    // Handle planId filter from keyword
    const matchPlanId = !searchForm.keyword.startsWith('planId:') || item.planId === Number(searchForm.keyword.split(':')[1])
    const matchStatus = !searchForm.status || item.status === searchForm.status
    const matchUrgency = !searchForm.urgency || item.urgencyLevel === searchForm.urgency
    return matchKeyword && matchStatus && matchUrgency && matchPlanId
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

const openComplianceDialog = () => {
  if (paginatedData.value.length === 0) return
  complianceRequirement.value = paginatedData.value[0]
  checkedRules.value = ['budget', 'procurement', 'supplier', 'price', 'specification']
  complianceDialogVisible.value = true
}

const openReviewDialog = (row?: Requirement) => {
  if (row) {
    reviewRequirement.value = row
  } else {
    if (paginatedData.value.length === 0) return
    reviewRequirement.value = paginatedData.value[0]
  }
  reviewStepsActive.value = reviewRequirement.value?.status === 'pending' ? 2 :
                            reviewRequirement.value?.status === 'approved' ? 4 : 0
  reviewHistory.value = [
    { timestamp: '2024-03-20 10:30', title: '提交申请', content: '用户张三提交了采购需求申请', type: 'primary', icon: 'el-icon-edit' },
    { timestamp: '2024-03-21 09:15', title: '部门初审', content: '部门负责人李四审核通过', type: 'success', icon: 'el-icon-check' },
    { timestamp: '2024-03-22 14:00', title: '财务复核', content: '财务经理王五进行预算复核', type: 'warning', icon: 'el-icon-wallet' }
  ]
  if (reviewRequirement.value?.status === 'approved') {
    reviewHistory.value.push({ timestamp: '2024-03-25 16:30', title: '领导审批', content: '总经理审批通过', type: 'success', icon: 'el-icon-user' })
  }
  reviewDialogVisible.value = true
}

const openAttachmentDialog = (row: Requirement) => {
  attachmentRequirement.value = row
  attachmentList.value = [
    { id: 1, name: '采购需求说明.pdf', size: 1024 * 512, uploadTime: '2024-03-18 10:30' },
    { id: 2, name: '技术规格书.docx', size: 1024 * 1024 * 2.5, uploadTime: '2024-03-18 11:15' },
    { id: 3, name: '预算申请表.xlsx', size: 1024 * 128, uploadTime: '2024-03-19 09:00' }
  ]
  fileList.value = []
  attachmentDialogVisible.value = true
}

const handleComplianceCheck = () => {
  const details: ComplianceResultDetail[] = [
    { rule: '预算合规检查', passed: true, message: '预算在批准范围内' },
    { rule: '采购方式合规', passed: true, message: '采购方式符合规定' },
    { rule: '供应商资质审查', passed: true, message: '供应商资质齐全有效' },
    { rule: '价格合理性分析', passed: Math.random() > 0.3, message: Math.random() > 0.3 ? '价格处于合理区间' : '价格偏高，建议复核' },
    { rule: '规格标准合规', passed: true, message: '技术规格符合国家标准' }
  ]
  complianceResult.value = {
    passed: details.every(d => d.passed),
    details
  }
  complianceDialogVisible.value = false
  complianceResultDialogVisible.value = true

  if (complianceRequirement.value) {
    const index = allData.value.findIndex(r => r.id === complianceRequirement.value!.id)
    if (index !== -1) {
      allData.value[index] = {
        ...allData.value[index],
        complianceStatus: complianceResult.value.passed ? 'passed' : 'failed',
        status: complianceResult.value.passed ? 'checking' : 'draft'
      }
    }
  }
}

const handleSubmitReview = () => {
  if (reviewRequirement.value) {
    const index = allData.value.findIndex(r => r.id === reviewRequirement.value!.id)
    if (index !== -1) {
      allData.value[index] = {
        ...allData.value[index],
        status: 'pending',
        reviewProgress: 50
      }
      reviewStepsActive.value = 2
    }
  }
  reviewDialogVisible.value = false
}

const handleFileChange = (file: any) => {
  fileList.value.push(file)
}

const handleUploadAttachment = () => {
  if (fileList.value.length === 0) return
  const newAttachments: Attachment[] = fileList.value.map((f, i) => ({
    id: attachmentList.value.length + i + 1,
    name: f.name || f.raw?.name,
    size: f.size || f.raw?.size || 0,
    uploadTime: new Date().toLocaleString()
  }))
  attachmentList.value.push(...newAttachments)
  fileList.value = []
  ElMessage.success('上传成功')
}

const handleDownloadAttachment = (row: Attachment) => {
  ElMessage.info(`下载文件: ${row.name}`)
}

const handleDeleteAttachment = (row: Attachment) => {
  const index = attachmentList.value.findIndex(a => a.id === row.id)
  if (index !== -1) {
    attachmentList.value.splice(index, 1)
    ElMessage.success('删除成功')
  }
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

// 查看关联计划
const viewRelatedPlan = (row: Requirement) => {
  if (row.planId) {
    router.push({
      name: 'PlanDetail',
      params: { id: row.planId.toString() }
    })
  }
}

// 查看关联合同
const viewRelatedContract = (row: Requirement) => {
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
    .header-actions { display: flex; gap: 8px; }
  }
  .search-card { margin-bottom: 16px; }
  .compliance-rules {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 8px 0;
  }
  .attachment-upload {
    padding: 16px;
    background: #1a1a2e;
    border-radius: 4px;
  }
}
</style>
