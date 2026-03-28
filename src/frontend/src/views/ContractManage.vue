<template>
  <div class="page">
    <div class="page-header">
      <h2>采购合同管理</h2>
      <div class="header-actions">
        <el-button>智能生成</el-button>
        <el-button type="primary">新建合同</el-button>
      </div>
    </div>

    <div class="card">
      <el-table :data="tableData" stripe>
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
          <template #default>
            <el-button link type="primary" size="small">查看</el-button>
            <el-button link type="primary" size="small">编辑</el-button>
            <el-button link type="success" size="small">签署</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        :total="tableData.length"
        :page-size="10"
        layout="prev, pager, next"
        style="margin-top: 16px; justify-content: flex-end;"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
const tableData = [
  { id: 1, contractNo: 'CON-2024-089', title: '办公设备采购合同', supplierName: 'XX科技有限公司', totalAmount: 800000, signDate: '2024-02-15', status: 'performing' },
  { id: 2, contractNo: 'CON-2024-090', title: '软件开发服务合同', supplierName: 'YY软件公司', totalAmount: 1500000, signDate: '2024-03-01', status: 'signed' },
  { id: 3, contractNo: 'CON-2024-091', title: '网络安全设备合同', supplierName: 'ZZ网络公司', totalAmount: 2000000, signDate: '2024-03-10', status: 'pending' },
  { id: 4, contractNo: 'CON-2024-088', title: '办公家具采购合同', supplierName: 'AA家具公司', totalAmount: 350000, signDate: '2024-01-20', status: 'completed' },
]
const getStatusType = (s: string) => ({ draft: 'info', pending: 'warning', signed: 'success', performing: 'primary', completed: 'success' }[s] || 'info')
const getStatusLabel = (s: string) => ({ draft: '草稿', pending: '待签署', signed: '已签署', performing: '执行中', completed: '已完成' }[s] || s)
</script>

<style scoped lang="scss">
.page { .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; h2 { color: #f0f6fc; font-size: 22px; font-weight: 600; } .header-actions { display: flex; gap: 8px; } } }
</style>
