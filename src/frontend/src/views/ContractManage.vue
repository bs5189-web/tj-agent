<template>
  <div class="page">
    <div class="page-header">
      <h2>采购合同管理</h2>
      <div class="header-actions">
        <el-button @click="openTemplateDialog">智能生成</el-button>
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
        <el-table-column label="履约报警" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.alertStatus === 'triggered'" type="danger" size="small">报警触发</el-tag>
            <el-tag v-else-if="row.alertStatus === 'configured'" type="warning" size="small">已配置</el-tag>
            <el-tag v-else type="info" size="small">未配置</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="340">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="openViewDialog(row)">查看</el-button>
            <el-button link type="primary" size="small" @click="openEditDialog(row)">编辑</el-button>
            <el-button link type="success" size="small" v-if="row.status === 'draft' || row.status === 'pending'" @click="handleSign(row)">签署</el-button>
            <el-button link type="warning" size="small" @click="openFulfillmentDialog(row)">履约管理</el-button>
            <el-button link type="danger" size="small" @click="openAlertDialog(row)">报警配置</el-button>
            <el-button link type="info" size="small" @click="viewRelatedRequirement(row)">关联需求</el-button>
            <el-button link type="info" size="small" @click="viewRelatedReview(row)">关联评审</el-button>
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
        <el-descriptions-item label="履约报警">
          <el-tag v-if="viewData.alertStatus === 'triggered'" type="danger" size="small">报警触发</el-tag>
          <el-tag v-else-if="viewData.alertStatus === 'configured'" type="warning" size="small">已配置</el-tag>
          <el-tag v-else type="info" size="small">未配置</el-tag>
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="viewDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="templateDialogVisible" title="选择合同模板" width="500px">
      <el-form label-width="100px">
        <el-form-item label="模板类型">
          <el-select v-model="selectedTemplate" placeholder="请选择合同模板" style="width: 100%">
            <el-option label="标准采购合同" value="standard" />
            <el-option label="框架协议合同" value="framework" />
            <el-option label="服务类合同" value="service" />
            <el-option label="工程类合同" value="engineering" />
            <el-option label="办公用品合同" value="office" />
          </el-select>
        </el-form-item>
      </el-form>
      <el-divider />
      <div class="template-preview" v-if="selectedTemplate">
        <h4>模板预览</h4>
        <el-form label-width="120px" size="small">
          <el-form-item label="合同名称">{{ templatePreview.title }}</el-form-item>
          <el-form-item label="供应商">{{ templatePreview.supplierName }}</el-form-item>
          <el-form-item label="合同金额">{{ templatePreview.totalAmount }}</el-form-item>
          <el-form-item label="履约条款">{{ templatePreview.fulfillmentTerms }}</el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="templateDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleTemplateGenerate">确认生成</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="fulfillmentDialogVisible" title="履约信息管理" width="700px">
      <el-form label-width="100px" v-if="fulfillmentContract">
        <el-form-item label="合同编号">{{ fulfillmentContract.contractNo }}</el-form-item>
        <el-form-item label="合同名称">{{ fulfillmentContract.title }}</el-form-item>
        <el-form-item label="履约进度">
          <el-progress :percentage="fulfillmentProgress" :stroke-width="20">
            <span>{{ fulfillmentProgress }}%</span>
          </el-progress>
        </el-form-item>
      </el-form>
      <el-divider content-position="left">履约节点</el-divider>
      <el-table :data="fulfillmentNodes" stripe size="small">
        <el-table-column prop="nodeName" label="节点名称" width="150" />
        <el-table-column prop="planDate" label="计划日期" width="120" />
        <el-table-column prop="actualDate" label="实际完成日期" width="140">
          <template #default="{ row }">
            <el-date-picker
              v-if="row.editing"
              v-model="row.actualDate"
              type="date"
              placeholder="选择日期"
              size="small"
              style="width: 120px"
            />
            <span v-else>{{ row.actualDate || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getFulfillmentStatusType(row.status)" size="small">{{ getFulfillmentStatusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="progress" label="进度" width="100">
          <template #default="{ row }">
            <el-input-number
              v-if="row.editing"
              v-model="row.progress"
              :min="0"
              :max="100"
              size="small"
              style="width: 80px"
            />
            <span v-else>{{ row.progress }}%</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="toggleNodeEdit(row)">
              {{ row.editing ? '保存' : '编辑' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <el-button @click="fulfillmentDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="alertDialogVisible" title="履约节点报警配置" width="500px">
      <el-form label-width="120px" v-if="alertContract">
        <el-form-item label="合同编号">{{ alertContract.contractNo }}</el-form-item>
        <el-form-item label="合同名称">{{ alertContract.title }}</el-form-item>
        <el-divider content-position="left">报警规则配置</el-divider>
        <el-form-item label="提前报警天数">
          <el-input-number v-model="alertConfig.daysBefore" :min="1" :max="30" />
        </el-form-item>
        <el-form-item label="报警方式">
          <el-checkbox-group v-model="alertConfig.methods">
            <el-checkbox label="email">邮件</el-checkbox>
            <el-checkbox label="sms">短信</el-checkbox>
            <el-checkbox label="system">系统通知</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="报警接收人">
          <el-input v-model="alertConfig.receiver" placeholder="请输入接收人" />
        </el-form-item>
        <el-form-item label="启用报警">
          <el-switch v-model="alertConfig.enabled" />
        </el-form-item>
      </el-form>
      <el-divider content-position="left">报警节点列表</el-divider>
      <el-table :data="alertNodes" stripe size="small">
        <el-table-column prop="nodeName" label="节点名称" width="120" />
        <el-table-column prop="planDate" label="计划日期" width="120" />
        <el-table-column prop="alertStatus" label="报警状态" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.alertStatus === 'pending'" type="warning" size="small">待触发</el-tag>
            <el-tag v-else-if="row.alertStatus === 'triggered'" type="danger" size="small">已触发</el-tag>
            <el-tag v-else type="info" size="small">未配置</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="daysRemaining" label="剩余天数" width="100">
          <template #default="{ row }">
            <span :style="{ color: row.daysRemaining <= 3 ? '#f56c6c' : row.daysRemaining <= 7 ? '#e6a23c' : '#67c23a' }">
              {{ row.daysRemaining }}天
            </span>
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <el-button @click="alertDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveAlertConfig">保存配置</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { contractData as mockData } from '@/api/mock'
import type { Contract } from '@/api/mock'

const router = useRouter()
const route = useRoute()

interface ContractWithAlert extends Contract {
  alertStatus?: 'none' | 'configured' | 'triggered'
}

interface FulfillmentNode {
  id: number
  nodeName: string
  planDate: string
  actualDate: string
  status: 'pending' | 'in_progress' | 'completed' | 'overdue'
  progress: number
  editing?: boolean
}

interface AlertNode {
  id: number
  nodeName: string
  planDate: string
  alertStatus: 'configured' | 'pending' | 'triggered'
  daysRemaining: number
}

interface AlertConfig {
  daysBefore: number
  methods: string[]
  receiver: string
  enabled: boolean
}

const dialogVisible = ref(false)
const viewDialogVisible = ref(false)
const templateDialogVisible = ref(false)
const fulfillmentDialogVisible = ref(false)
const alertDialogVisible = ref(false)
const isEdit = ref(false)
const editingId = ref<number | null>(null)
const viewData = ref<ContractWithAlert | null>(null)
const selectedTemplate = ref('')
const fulfillmentContract = ref<Contract | null>(null)
const alertContract = ref<Contract | null>(null)

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

const alertConfig = reactive<AlertConfig>({
  daysBefore: 7,
  methods: ['system'],
  receiver: '',
  enabled: true
})

const fulfillmentNodes = ref<FulfillmentNode[]>([])
const alertNodes = ref<AlertNode[]>([])

const templateMap: Record<string, { title: string; supplierName: string; totalAmount: string; fulfillmentTerms: string }> = {
  standard: { title: '标准采购合同', supplierName: 'XX科技有限公司', totalAmount: '100000', fulfillmentTerms: '按合同约定分期履约' },
  framework: { title: '框架协议采购合同', supplierName: 'YY软件公司', totalAmount: '500000', fulfillmentTerms: '分批次供货，按季度结算' },
  service: { title: '服务类采购合同', supplierName: 'ZZ网络公司', totalAmount: '200000', fulfillmentTerms: '按服务周期履约' },
  engineering: { title: '工程类采购合同', supplierName: 'AA家具公司', totalAmount: '800000', fulfillmentTerms: '按工程进度分期履约' },
  office: { title: '办公用品采购合同', supplierName: 'BB制冷公司', totalAmount: '50000', fulfillmentTerms: '一次性供货' }
}

const templatePreview = computed(() => {
  return templateMap[selectedTemplate.value] || { title: '', supplierName: '', totalAmount: '', fulfillmentTerms: '' }
})

const fulfillmentProgress = computed(() => {
  if (fulfillmentNodes.value.length === 0) return 0
  const total = fulfillmentNodes.value.reduce((sum, node) => sum + node.progress, 0)
  return Math.round(total / fulfillmentNodes.value.length)
})

let nextId = Math.max(...mockData.map(c => c.id)) + 1

const allData = ref<ContractWithAlert[]>(mockData.map(c => ({
  ...c,
  alertStatus: c.status === 'performing' ? 'configured' as const : 'none' as const
})))

// Handle route params for filtering by requirementId
onMounted(() => {
  const requirementId = route.params.requirementId
  if (requirementId) {
    allData.value = allData.value.filter(c => c.requirementId === Number(requirementId))
  }
})

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

const openTemplateDialog = () => {
  selectedTemplate.value = ''
  templateDialogVisible.value = true
}

const handleTemplateGenerate = () => {
  if (!selectedTemplate.value) {
    return
  }
  const template = templateMap[selectedTemplate.value]
  Object.assign(formData, {
    title: template.title,
    supplierName: template.supplierName,
    totalAmount: template.totalAmount
  })
  templateDialogVisible.value = false
  dialogVisible.value = true
  isEdit.value = false
  editingId.value = null
}

const openFulfillmentDialog = (row: Contract) => {
  fulfillmentContract.value = row
  fulfillmentNodes.value = [
    { id: 1, nodeName: '预付款支付', planDate: '2024-04-15', actualDate: '2024-04-14', status: 'completed', progress: 100 },
    { id: 2, nodeName: '货物交付', planDate: '2024-05-01', actualDate: '', status: 'in_progress', progress: 60, editing: false },
    { id: 3, nodeName: '验收入库', planDate: '2024-05-10', actualDate: '', status: 'pending', progress: 0, editing: false },
    { id: 4, nodeName: '尾款结算', planDate: '2024-05-20', actualDate: '', status: 'pending', progress: 0, editing: false }
  ]
  fulfillmentDialogVisible.value = true
}

const openAlertDialog = (row: Contract) => {
  alertContract.value = row
  alertConfig.daysBefore = 7
  alertConfig.methods = ['system']
  alertConfig.receiver = ''
  alertConfig.enabled = true
  alertNodes.value = [
    { id: 1, nodeName: '预付款支付', planDate: '2024-04-15', alertStatus: 'triggered', daysRemaining: -5 },
    { id: 2, nodeName: '货物交付', planDate: '2024-05-01', alertStatus: 'pending', daysRemaining: 3 },
    { id: 3, nodeName: '验收入库', planDate: '2024-05-10', alertStatus: 'configured', daysRemaining: 12 },
    { id: 4, nodeName: '尾款结算', planDate: '2024-05-20', alertStatus: 'configured', daysRemaining: 22 }
  ]
  alertDialogVisible.value = true
}

const toggleNodeEdit = (row: FulfillmentNode) => {
  if (row.editing) {
    row.status = row.progress === 100 ? 'completed' : row.progress > 0 ? 'in_progress' : 'pending'
    row.actualDate = row.actualDate || new Date().toISOString().split('T')[0]
  }
  row.editing = !row.editing
}

const handleSaveAlertConfig = () => {
  if (alertContract.value) {
    const index = allData.value.findIndex(c => c.id === alertContract.value!.id)
    if (index !== -1) {
      allData.value[index] = { ...allData.value[index], alertStatus: alertConfig.enabled ? 'configured' : 'none' }
    }
  }
  alertDialogVisible.value = false
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

const getStatusType = (s: string) => ({ draft: 'info', pending: 'warning', signed: 'success', performing: 'warning', completed: 'success' }[s] || 'info')
const getStatusLabel = (s: string) => ({ draft: '草稿', pending: '待签署', signed: '已签署', performing: '执行中', completed: '已完成' }[s] || s)
const getFulfillmentStatusType = (s: string) => ({ pending: 'info', in_progress: 'warning', completed: 'success', overdue: 'danger' }[s] || 'info')
const getFulfillmentStatusLabel = (s: string) => ({ pending: '待开始', in_progress: '进行中', completed: '已完成', overdue: '已超期' }[s] || s)

// 查看关联需求
const viewRelatedRequirement = (row: Contract) => {
  router.push({
    name: 'Requirement',
    query: { contractId: row.id.toString() }
  })
}

// 查看关联评审
const viewRelatedReview = (row: Contract) => {
  router.push({
    name: 'ReviewByContract',
    params: { contractId: row.id.toString() }
  })
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
  .template-preview {
    background: #1a1a2e;
    padding: 16px;
    border-radius: 4px;
    h4 { color: #f0f6fc; margin-bottom: 12px; }
  }
}
</style>
