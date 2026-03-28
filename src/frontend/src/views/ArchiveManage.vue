<template>
  <div class="page">
    <div class="page-header">
      <h2>档案管理</h2>
      <div class="header-actions">
        <el-button @click="handleExport">导出</el-button>
      </div>
    </div>

    <div class="card search-card">
      <el-form inline>
        <el-form-item><el-input v-model="searchForm.keyword" placeholder="搜索项目编号/档案编号" prefix-icon="Search" /></el-form-item>
        <el-form-item>
          <el-select v-model="searchForm.category" placeholder="档案类型" style="width: 140px">
            <el-option label="全部" value="" />
            <el-option label="采购档案" value="procurement" />
            <el-option label="合同档案" value="contract" />
            <el-option label="技术档案" value="technical" />
            <el-option label="财务档案" value="financial" />
          </el-select>
        </el-form-item>
        <el-form-item label="归档时间">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item>
          <el-select v-model="searchForm.status" placeholder="状态" style="width: 120px">
            <el-option label="全部" value="" />
            <el-option label="已归档" value="archived" />
            <el-option label="待归档" value="pending" />
            <el-option label="归档中" value="archiving" />
          </el-select>
        </el-form-item>
        <el-form-item><el-button @click="handleReset">重置</el-button></el-form-item>
      </el-form>
    </div>

    <div class="card">
      <el-table :data="paginatedData" stripe>
        <el-table-column prop="archiveNo" label="档案编号" width="160" />
        <el-table-column prop="projectNo" label="项目编号" width="150" />
        <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
        <el-table-column prop="category" label="类型" width="100">
          <template #default="{ row }">
            <el-tag size="small">{{ getCategoryLabel(row.category) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="fileCount" label="文件数" width="80" align="center" />
        <el-table-column prop="archiveTime" label="归档时间" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="openViewDialog(row)">查看</el-button>
            <el-button link type="primary" size="small" @click="handleDownload(row)">下载</el-button>
            <el-button link type="primary" size="small" @click="openMilestoneDialog(row)">里程碑</el-button>
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

    <el-dialog v-model="viewDialogVisible" title="档案详情" width="650px">
      <el-descriptions :column="2" border v-if="viewData">
        <el-descriptions-item label="档案编号">{{ viewData.archiveNo }}</el-descriptions-item>
        <el-descriptions-item label="项目编号">{{ viewData.projectNo }}</el-descriptions-item>
        <el-descriptions-item label="标题" :span="2">{{ viewData.title }}</el-descriptions-item>
        <el-descriptions-item label="档案类型">{{ getCategoryLabel(viewData.category) }}</el-descriptions-item>
        <el-descriptions-item label="文件数">{{ viewData.fileCount }}</el-descriptions-item>
        <el-descriptions-item label="归档时间">{{ viewData.archiveTime }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(viewData.status)">{{ getStatusLabel(viewData.status) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="自动归档">
          <el-tag :type="viewData.autoArchive ? 'success' : 'info'" size="small">
            {{ viewData.autoArchive ? '已启用' : '未启用' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="归档说明" :span="2">{{ viewData.description || '-' }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="handleDownload(viewData!)" type="primary">下载档案</el-button>
        <el-button @click="viewDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="milestoneDialogVisible" title="项目里程碑节点" width="600px">
      <el-timeline v-if="milestoneData">
        <el-timeline-item
          v-for="(item, index) in milestoneData.milestones"
          :key="index"
          :color="item.completed ? '#67C23A' : '#E4E7ED'"
          :hollow="!item.completed"
        >
          <div class="milestone-item">
            <div class="milestone-header">
              <span class="milestone-name">{{ item.name }}</span>
              <el-tag size="small" :type="item.completed ? 'success' : 'info'">
                {{ item.completed ? '已完成' : '进行中' }}
              </el-tag>
            </div>
            <div class="milestone-info">
              <span>计划时间: {{ item.planDate }}</span>
              <span v-if="item.completed">完成时间: {{ item.completedDate }}</span>
            </div>
            <div class="milestone-desc">{{ item.description }}</div>
          </div>
        </el-timeline-item>
      </el-timeline>
      <template #footer>
        <el-button @click="milestoneDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'

interface Milestone {
  name: string
  planDate: string
  completedDate?: string
  completed: boolean
  description: string
}

interface Archive {
  id: number
  archiveNo: string
  projectNo: string
  title: string
  category: string
  fileCount: number
  archiveTime: string
  status: string
  autoArchive: boolean
  description?: string
  milestones: Milestone[]
}

const viewDialogVisible = ref(false)
const milestoneDialogVisible = ref(false)
const viewData = ref<Archive | null>(null)
const milestoneData = ref<Archive | null>(null)

const currentPage = ref(1)
const pageSize = ref(10)

const searchForm = reactive({
  keyword: '',
  category: '',
  dateRange: [] as Date[],
  status: ''
})

const allData = ref<Archive[]>([
  { id: 1, archiveNo: 'ARC-2024-001', projectNo: 'PRJ-2024-001', title: '信息中心设备采购项目', category: 'procurement', fileCount: 45, archiveTime: '2024-03-15', status: 'archived', autoArchive: true, description: '已完成全部归档', milestones: [{ name: '需求确认', planDate: '2024-01-10', completedDate: '2024-01-10', completed: true, description: '需求文档已确认' }, { name: '招标完成', planDate: '2024-02-15', completedDate: '2024-02-14', completed: true, description: '招标流程完成' }, { name: '合同签署', planDate: '2024-03-01', completedDate: '2024-03-01', completed: true, description: '合同已签署' }, { name: '项目验收', planDate: '2024-03-20', completedDate: '2024-03-18', completed: true, description: '项目验收通过' }] },
  { id: 2, archiveNo: 'ARC-2024-002', projectNo: 'PRJ-2024-002', title: '后勤保障部办公家具采购', category: 'procurement', fileCount: 28, archiveTime: '2024-03-10', status: 'archived', autoArchive: true, milestones: [{ name: '需求确认', planDate: '2024-01-15', completedDate: '2024-01-15', completed: true, description: '需求文档已确认' }, { name: '招标完成', planDate: '2024-02-20', completedDate: '2024-02-21', completed: true, description: '招标流程完成' }, { name: '合同签署', planDate: '2024-03-05', completedDate: '2024-03-05', completed: true, description: '合同已签署' }, { name: '项目验收', planDate: '2024-03-28', completed: false, description: '等待验收' }] },
  { id: 3, archiveNo: 'ARC-2024-003', projectNo: 'PRJ-2024-003', title: '网络安全设备采购项目', category: 'technical', fileCount: 62, archiveTime: '-', status: 'archiving', autoArchive: false, milestones: [{ name: '需求确认', planDate: '2024-02-01', completedDate: '2024-02-01', completed: true, description: '需求文档已确认' }, { name: '技术评审', planDate: '2024-02-28', completedDate: '2024-02-27', completed: true, description: '技术方案评审通过' }, { name: '招标完成', planDate: '2024-03-15', completed: false, description: '招标进行中' }, { name: '合同签署', planDate: '2024-04-01', completed: false, description: '等待合同签署' }] },
  { id: 4, archiveNo: 'ARC-2024-004', projectNo: 'PRJ-2024-004', title: '空调设备更新项目', category: 'procurement', fileCount: 15, archiveTime: '-', status: 'pending', autoArchive: true, milestones: [{ name: '需求确认', planDate: '2024-03-10', completedDate: '2024-03-10', completed: true, description: '需求文档已确认' }, { name: '招标完成', planDate: '2024-04-01', completed: false, description: '等待招标' }, { name: '合同签署', planDate: '2024-04-15', completed: false, description: '等待合同签署' }, { name: '项目验收', planDate: '2024-05-01', completed: false, description: '等待验收' }] },
  { id: 5, archiveNo: 'ARC-2024-005', projectNo: 'PRJ-2024-005', title: '财务审计系统建设项目', category: 'financial', fileCount: 89, archiveTime: '2024-02-28', status: 'archived', autoArchive: true, milestones: [{ name: '需求确认', planDate: '2023-12-01', completedDate: '2023-12-01', completed: true, description: '需求文档已确认' }, { name: '招标完成', planDate: '2024-01-15', completedDate: '2024-01-14', completed: true, description: '招标流程完成' }, { name: '合同签署', planDate: '2024-01-30', completedDate: '2024-01-30', completed: true, description: '合同已签署' }, { name: '项目验收', planDate: '2024-02-28', completedDate: '2024-02-27', completed: true, description: '项目验收通过' }] },
  { id: 6, archiveNo: 'ARC-2024-006', projectNo: 'PRJ-2024-006', title: '视频会议系统采购', category: 'technical', fileCount: 34, archiveTime: '2024-03-20', status: 'archived', autoArchive: true, milestones: [{ name: '需求确认', planDate: '2024-01-20', completedDate: '2024-01-20', completed: true, description: '需求文档已确认' }, { name: '招标完成', planDate: '2024-02-25', completedDate: '2024-02-24', completed: true, description: '招标流程完成' }, { name: '合同签署', planDate: '2024-03-10', completedDate: '2024-03-10', completed: true, description: '合同已签署' }, { name: '项目验收', planDate: '2024-03-25', completedDate: '2024-03-24', completed: true, description: '项目验收通过' }] },
  { id: 7, archiveNo: 'ARC-2024-007', projectNo: 'PRJ-2024-007', title: '打印机设备采购', category: 'procurement', fileCount: 12, archiveTime: '-', status: 'pending', autoArchive: false, milestones: [{ name: '需求确认', planDate: '2024-03-15', completedDate: '2024-03-15', completed: true, description: '需求文档已确认' }, { name: '招标完成', planDate: '2024-04-10', completed: false, description: '等待招标' }, { name: '合同签署', planDate: '2024-04-25', completed: false, description: '等待合同签署' }, { name: '项目验收', planDate: '2024-05-15', completed: false, description: '等待验收' }] },
  { id: 8, archiveNo: 'ARC-2024-008', projectNo: 'PRJ-2024-008', title: '服务器存储扩容项目', category: 'technical', fileCount: 56, archiveTime: '2024-03-18', status: 'archived', autoArchive: true, milestones: [{ name: '需求确认', planDate: '2024-01-05', completedDate: '2024-01-05', completed: true, description: '需求文档已确认' }, { name: '招标完成', planDate: '2024-02-10', completedDate: '2024-02-09', completed: true, description: '招标流程完成' }, { name: '合同签署', planDate: '2024-02-25', completedDate: '2024-02-25', completed: true, description: '合同已签署' }, { name: '项目验收', planDate: '2024-03-20', completedDate: '2024-03-18', completed: true, description: '项目验收通过' }] },
  { id: 9, archiveNo: 'ARC-2024-009', projectNo: 'PRJ-2024-009', title: '办公楼网络改造', category: 'technical', fileCount: 78, archiveTime: '-', status: 'archiving', autoArchive: true, milestones: [{ name: '需求确认', planDate: '2024-02-01', completedDate: '2024-02-01', completed: true, description: '需求文档已确认' }, { name: '招标完成', planDate: '2024-03-01', completedDate: '2024-03-02', completed: true, description: '招标流程完成' }, { name: '合同签署', planDate: '2024-03-15', completedDate: '2024-03-15', completed: true, description: '合同已签署' }, { name: '项目验收', planDate: '2024-04-15', completed: false, description: '等待验收' }] },
  { id: 10, archiveNo: 'ARC-2024-010', projectNo: 'PRJ-2024-010', title: '办公用品集中采购', category: 'procurement', fileCount: 8, archiveTime: '2024-03-22', status: 'archived', autoArchive: true, milestones: [{ name: '需求确认', planDate: '2024-02-15', completedDate: '2024-02-15', completed: true, description: '需求文档已确认' }, { name: '招标完成', planDate: '2024-03-01', completedDate: '2024-02-28', completed: true, description: '招标流程完成' }, { name: '合同签署', planDate: '2024-03-10', completedDate: '2024-03-10', completed: true, description: '合同已签署' }, { name: '项目验收', planDate: '2024-03-25', completedDate: '2024-03-24', completed: true, description: '项目验收通过' }] },
])

const filteredData = computed(() => {
  return allData.value.filter(item => {
    const matchKeyword = !searchForm.keyword ||
      item.archiveNo.toLowerCase().includes(searchForm.keyword.toLowerCase()) ||
      item.projectNo.toLowerCase().includes(searchForm.keyword.toLowerCase()) ||
      item.title.toLowerCase().includes(searchForm.keyword.toLowerCase())
    const matchCategory = !searchForm.category || item.category === searchForm.category
    const matchStatus = !searchForm.status || item.status === searchForm.status
    let matchDate = true
    if (searchForm.dateRange && searchForm.dateRange.length === 2) {
      const start = new Date(searchForm.dateRange[0]).getTime()
      const end = new Date(searchForm.dateRange[1]).getTime()
      const itemDate = new Date(item.archiveTime).getTime()
      matchDate = itemDate >= start && itemDate <= end
    }
    return matchKeyword && matchCategory && matchStatus && matchDate
  })
})

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredData.value.slice(start, end)
})

const getCategoryLabel = (category: string) => {
  const map: Record<string, string> = { procurement: '采购档案', contract: '合同档案', technical: '技术档案', financial: '财务档案' }
  return map[category] || category
}

const getStatusType = (status: string) => {
  const map: Record<string, any> = { archived: 'success', pending: 'warning', archiving: 'primary' }
  return map[status] || 'info'
}

const getStatusLabel = (status: string) => {
  const map: Record<string, string> = { archived: '已归档', pending: '待归档', archiving: '归档中' }
  return map[status] || status
}

const openViewDialog = (row: Archive) => {
  viewData.value = { ...row }
  viewDialogVisible.value = true
}

const openMilestoneDialog = (row: Archive) => {
  milestoneData.value = { ...row }
  milestoneDialogVisible.value = true
}

const handleDownload = (row: Archive) => {
  const headers = ['档案编号', '项目编号', '标题', '类型', '文件数', '归档时间', '状态']
  const rows = [[row.archiveNo, row.projectNo, row.title, getCategoryLabel(row.category), row.fileCount, row.archiveTime, getStatusLabel(row.status)]]
  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
  const BOM = '\uFEFF'
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${row.archiveNo}_档案.csv`
  link.click()
  URL.revokeObjectURL(url)
}

const handleExport = () => {
  const headers = ['档案编号', '项目编号', '标题', '类型', '文件数', '归档时间', '状态']
  const rows = filteredData.value.map(item => [
    item.archiveNo, item.projectNo, item.title, getCategoryLabel(item.category), item.fileCount, item.archiveTime, getStatusLabel(item.status)
  ])
  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
  const BOM = '\uFEFF'
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `档案管理_${new Date().toISOString().split('T')[0]}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

const handleReset = () => {
  searchForm.keyword = ''
  searchForm.category = ''
  searchForm.dateRange = []
  searchForm.status = ''
}
</script>

<style scoped lang="scss">
.page { .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; h2 { color: #f0f6fc; font-size: 22px; font-weight: 600; } } .search-card { margin-bottom: 16px; } }

.milestone-item {
  .milestone-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; .milestone-name { font-weight: 600; color: #f0f6fc; } }
  .milestone-info { font-size: 13px; color: #8b949e; margin-bottom: 4px; span { margin-right: 16px; } }
  .milestone-desc { font-size: 12px; color: #6e7681; }
}
</style>
