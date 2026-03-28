<template>
  <div class="page">
    <div class="page-header">
      <h2>采购评审管理</h2>
      <el-button type="primary">创建评审</el-button>
    </div>

    <div class="card">
      <el-table :data="tableData" stripe>
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
        <el-table-column prop="endTime" label="结束时间" width="150" />
        <el-table-column label="操作" width="160">
          <template #default>
            <el-button link type="primary" size="small">专家</el-button>
            <el-button link type="primary" size="small">评分</el-button>
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
import { reviewData } from '@/api/mock'

const tableData = reviewData
const getStatusType = (s: string) => ({ preparing: 'info', ongoing: 'warning', completed: 'success' }[s] || 'info')
const getStatusLabel = (s: string) => ({ preparing: '准备中', ongoing: '评审中', completed: '已完成' }[s] || s)
</script>

<style scoped lang="scss">
.page { .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; h2 { color: #f0f6fc; font-size: 22px; font-weight: 600; } } }
</style>
