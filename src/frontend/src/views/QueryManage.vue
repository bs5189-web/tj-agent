<template>
  <div class="page">
    <div class="page-header">
      <h2>数据查询</h2>
      <div class="header-actions">
        <el-button @click="handleExport" :disabled="!queryResults.length">导出结果</el-button>
      </div>
    </div>

    <div class="card search-card">
      <div class="chat-input-wrapper">
        <el-input
          v-model="chatInput"
          placeholder="请输入问题，例如：查询2024年采购金额超过100万的合同"
          size="large"
          @keyup.enter="handleChatQuery"
        >
          <template #prefix><el-icon><ChatDotRound /></el-icon></template>
          <template #append>
            <el-button @click="handleChatQuery">查询</el-button>
          </template>
        </el-input>
      </div>

      <el-form inline class="filter-form">
        <el-form-item label="模块">
          <el-select v-model="filterForm.module" placeholder="选择模块" style="width: 140px">
            <el-option label="全部" value="" />
            <el-option label="采购计划" value="plan" />
            <el-option label="采购需求" value="requirement" />
            <el-option label="采购合同" value="contract" />
            <el-option label="采购评审" value="review" />
            <el-option label="档案管理" value="archive" />
          </el-select>
        </el-form-item>
        <el-form-item label="项目编号">
          <el-input v-model="filterForm.projectNo" placeholder="输入项目编号" style="width: 160px" />
        </el-form-item>
        <el-form-item label="日期范围">
          <el-date-picker
            v-model="filterForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item label="关键词">
          <el-input v-model="filterForm.keyword" placeholder="输入关键词" style="width: 160px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleFilterQuery">筛选查询</el-button>
          <el-button @click="handleFilterReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="result-section" v-if="queryResults.length > 0">
      <div class="card stats-card">
        <div class="stats-title">查询统计</div>
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-value">{{ queryResults.length }}</div>
            <div class="stat-label">结果数量</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ totalAmount.toLocaleString() }}</div>
            <div class="stat-label">总金额(元)</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ moduleDistribution.length }}</div>
            <div class="stat-label">涉及模块</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ dateRange }}</div>
            <div class="stat-label">时间范围</div>
          </div>
        </div>
        <div class="chart-wrapper">
          <div class="chart-title">模块分布</div>
          <div class="simple-chart">
            <div
              v-for="item in moduleDistribution"
              :key="item.name"
              class="chart-bar"
            >
              <div class="bar-label">{{ item.name }}</div>
              <div class="bar-container">
                <div class="bar-fill" :style="{ width: item.percent + '%', backgroundColor: item.color }"></div>
              </div>
              <div class="bar-value">{{ item.count }} ({{ item.percent }}%)</div>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <el-table :data="paginatedData" stripe>
          <el-table-column prop="id" label="序号" width="60" />
          <el-table-column prop="module" label="模块" width="100">
            <template #default="{ row }">
              <el-tag size="small">{{ getModuleLabel(row.module) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="docNo" label="单据编号" width="150" />
          <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
          <el-table-column prop="department" label="部门" width="120" />
          <el-table-column prop="amount" label="金额(元)" width="140">
            <template #default="{ row }">
              <span style="font-family: JetBrains Mono, monospace">{{ row.amount.toLocaleString() }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)" size="small">{{ row.statusText }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="date" label="日期" width="120" />
        </el-table>
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="queryResults.length"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next"
          style="margin-top: 16px; justify-content: flex-end;"
        />
      </div>
    </div>

    <div class="empty-state" v-else>
      <el-empty description="请输入查询条件开始查询">
        <template #image>
          <el-icon size="64" color="#8b949e"><Search /></el-icon>
        </template>
      </el-empty>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ChatDotRound, Search } from '@element-plus/icons-vue'

interface QueryResult {
  id: number
  module: string
  docNo: string
  title: string
  department: string
  amount: number
  status: string
  statusText: string
  date: string
  projectNo?: string
}

const chatInput = ref('')
const queryResults = ref<QueryResult[]>([])
const currentPage = ref(1)
const pageSize = ref(10)

const filterForm = reactive({
  module: '',
  dateRange: [] as Date[],
  keyword: '',
  projectNo: ''
})

const mockQueryData: QueryResult[] = [
  { id: 1, module: 'contract', docNo: 'CON-2024-087', title: '笔记本电脑采购合同', department: '信息中心', amount: 1500000, status: 'signed', statusText: '已签署', date: '2024-01-15', projectNo: 'PJ-2024-001' },
  { id: 2, module: 'contract', docNo: 'CON-2024-088', title: '办公家具采购合同', department: '后勤保障部', amount: 800000, status: 'performing', statusText: '执行中', date: '2024-01-20', projectNo: 'PJ-2024-002' },
  { id: 3, module: 'plan', docNo: 'PLAN-2024-001', title: '2024年度采购计划', department: '采购部', amount: 5000000, status: 'approved', statusText: '已通过', date: '2024-01-05', projectNo: 'PJ-2024-001' },
  { id: 4, module: 'requirement', docNo: 'REQ-2024-156', title: '投影仪采购需求', department: '科研技术部', amount: 120000, status: 'approved', statusText: '已通过', date: '2024-02-10', projectNo: 'PJ-2024-001' },
  { id: 5, module: 'requirement', docNo: 'REQ-2024-157', title: '服务器设备需求', department: '信息中心', amount: 3500000, status: 'pending', statusText: '待审批', date: '2024-02-15', projectNo: 'PJ-2024-002' },
  { id: 6, module: 'review', docNo: 'REV-2024-001', title: '网络安全设备评审', department: '信息中心', amount: 2000000, status: 'completed', statusText: '已完成', date: '2024-02-20', projectNo: 'PJ-2024-001' },
  { id: 7, module: 'archive', docNo: 'ARC-2024-001', title: '信息中心设备采购项目', department: '信息中心', amount: 1500000, status: 'archived', statusText: '已归档', date: '2024-03-15', projectNo: 'PJ-2024-003' },
  { id: 8, module: 'contract', docNo: 'CON-2024-089', title: '空调设备更新合同', department: '后勤保障部', amount: 950000, status: 'performing', statusText: '执行中', date: '2024-02-01', projectNo: 'PJ-2024-002' },
  { id: 9, module: 'plan', docNo: 'PLAN-2024-002', title: 'Q1季度采购计划', department: '采购部', amount: 3200000, status: 'approved', statusText: '已通过', date: '2024-01-08', projectNo: 'PJ-2024-002' },
  { id: 10, module: 'requirement', docNo: 'REQ-2024-158', title: '打印机采购需求', department: '综合管理部', amount: 180000, status: 'approved', statusText: '已通过', date: '2024-02-25', projectNo: 'PJ-2024-003' },
  { id: 11, module: 'review', docNo: 'REV-2024-002', title: '视频会议系统评审', department: '信息中心', amount: 1200000, status: 'ongoing', statusText: '评审中', date: '2024-03-01', projectNo: 'PJ-2024-002' },
  { id: 12, module: 'archive', docNo: 'ARC-2024-002', title: '后勤保障部办公家具采购', department: '后勤保障部', amount: 800000, status: 'archived', statusText: '已归档', date: '2024-03-10', projectNo: 'PJ-2024-001' },
  { id: 13, module: 'contract', docNo: 'CON-2024-090', title: '网络设备采购合同', department: '信息中心', amount: 2800000, status: 'signed', statusText: '已签署', date: '2024-02-15', projectNo: 'PJ-2024-003' },
  { id: 14, module: 'requirement', docNo: 'REQ-2024-159', title: '监控设备需求', department: '安全监督部', amount: 650000, status: 'checking', statusText: '审核中', date: '2024-03-05', projectNo: 'PJ-2024-001' },
  { id: 15, module: 'plan', docNo: 'PLAN-2024-003', title: '上半年采购计划', department: '采购部', amount: 8500000, status: 'pending', statusText: '待审批', date: '2024-02-28', projectNo: 'PJ-2024-002' },
]

const totalAmount = computed(() => {
  return queryResults.value.reduce((sum, item) => sum + item.amount, 0)
})

const moduleDistribution = computed(() => {
  const moduleCount: Record<string, number> = {}
  queryResults.value.forEach(item => {
    moduleCount[item.module] = (moduleCount[item.module] || 0) + 1
  })
  const total = queryResults.value.length || 1
  const colors: Record<string, string> = {
    plan: '#409EFF',
    requirement: '#67C23A',
    contract: '#E6A23C',
    review: '#F56C6C',
    archive: '#909399'
  }
  return Object.entries(moduleCount).map(([name, count]) => ({
    name: getModuleLabel(name),
    count,
    percent: Math.round((count / total) * 100),
    color: colors[name] || '#909399'
  }))
})

const dateRange = computed(() => {
  if (queryResults.value.length === 0) return '-'
  const dates = queryResults.value.map(r => r.date).sort()
  return `${dates[0]} ~ ${dates[dates.length - 1]}`
})

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return queryResults.value.slice(start, end)
})

const getModuleLabel = (module: string) => {
  const map: Record<string, string> = {
    plan: '采购计划',
    requirement: '采购需求',
    contract: '采购合同',
    review: '采购评审',
    archive: '档案管理'
  }
  return map[module] || module
}

const getStatusType = (status: string) => {
  const map: Record<string, any> = {
    approved: 'success',
    pending: 'warning',
    performing: 'primary',
    signed: 'success',
    completed: 'success',
    archived: 'info',
    checking: 'warning',
    ongoing: 'primary'
  }
  return map[status] || 'info'
}

const handleChatQuery = () => {
  if (!chatInput.value.trim()) return
  queryResults.value = mockQueryData.filter(item => {
    if (chatInput.value.includes('合同') && item.module !== 'contract') return false
    if (chatInput.value.includes('计划') && item.module !== 'plan') return false
    if (chatInput.value.includes('需求') && item.module !== 'requirement') return false
    if (chatInput.value.includes('百万') || chatInput.value.includes('100万')) {
      return item.amount >= 1000000
    }
    return item.title.includes(chatInput.value) || item.docNo.includes(chatInput.value)
  })
  if (queryResults.value.length === 0) {
    queryResults.value = [...mockQueryData]
  }
  currentPage.value = 1
}

const handleFilterQuery = () => {
  queryResults.value = mockQueryData.filter(item => {
    const matchModule = !filterForm.module || item.module === filterForm.module
    const matchKeyword = !filterForm.keyword ||
      item.title.includes(filterForm.keyword) ||
      item.docNo.includes(filterForm.keyword) ||
      item.department.includes(filterForm.keyword)
    const matchProjectNo = !filterForm.projectNo || item.projectNo?.includes(filterForm.projectNo)
    let matchDate = true
    if (filterForm.dateRange && filterForm.dateRange.length === 2) {
      const start = new Date(filterForm.dateRange[0]).getTime()
      const end = new Date(filterForm.dateRange[1]).getTime()
      const itemDate = new Date(item.date).getTime()
      matchDate = itemDate >= start && itemDate <= end
    }
    return matchModule && matchKeyword && matchDate && matchProjectNo
  })
  if (queryResults.value.length === 0) {
    queryResults.value = [...mockQueryData]
  }
  currentPage.value = 1
}

const handleFilterReset = () => {
  filterForm.module = ''
  filterForm.dateRange = []
  filterForm.keyword = ''
  filterForm.projectNo = ''
}

const handleExport = () => {
  const headers = ['序号', '模块', '单据编号', '标题', '部门', '金额(元)', '状态', '日期']
  const rows = queryResults.value.map(item => [
    item.id, getModuleLabel(item.module), item.docNo, item.title, item.department, item.amount, item.statusText, item.date
  ])
  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
  const BOM = '\uFEFF'
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `查询结果_${new Date().toISOString().split('T')[0]}.csv`
  link.click()
  URL.revokeObjectURL(url)
}
</script>

<style scoped lang="scss">
.page {
  .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; h2 { color: #f0f6fc; font-size: 22px; font-weight: 600; } }
  .search-card { margin-bottom: 16px; }
  .chat-input-wrapper { margin-bottom: 16px; }
  .filter-form { border-top: 1px solid #30363d; padding-top: 16px; }
}

.result-section {
  .stats-card {
    margin-bottom: 16px;
    .stats-title { color: #f0f6fc; font-size: 16px; font-weight: 600; margin-bottom: 16px; }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 20px;
      .stat-item {
        background: #161b22;
        border-radius: 8px;
        padding: 16px;
        text-align: center;
        .stat-value { font-size: 24px; font-weight: 600; color: #58a6ff; font-family: JetBrains Mono, monospace; }
        .stat-label { font-size: 12px; color: #8b949e; margin-top: 4px; }
      }
    }
  }
  .chart-wrapper {
    .chart-title { color: #f0f6fc; font-size: 14px; font-weight: 500; margin-bottom: 12px; }
    .simple-chart {
      .chart-bar {
        display: flex;
        align-items: center;
        margin-bottom: 12px;
        .bar-label { width: 80px; color: #8b949e; font-size: 13px; }
        .bar-container {
          flex: 1;
          height: 20px;
          background: #21262d;
          border-radius: 4px;
          overflow: hidden;
          margin: 0 12px;
          .bar-fill { height: 100%; border-radius: 4px; transition: width 0.3s ease; }
        }
        .bar-value { width: 100px; color: #58a6ff; font-size: 13px; font-family: JetBrains Mono, monospace; text-align: right; }
      }
    }
  }
}

.empty-state { padding: 60px 0; }
</style>
