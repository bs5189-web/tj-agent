<template>
  <div class="page">
    <div class="page-header">
      <h2>采购文件管理</h2>
      <el-button type="primary">新建文件</el-button>
    </div>

    <div class="card search-card">
      <el-form inline>
        <el-form-item><el-input placeholder="搜索文件编号/标题" prefix-icon="Search" /></el-form-item>
        <el-form-item>
          <el-select placeholder="类别" style="width: 120px">
            <el-option label="货物类" value="goods" />
            <el-option label="服务类" value="service" />
            <el-option label="工程类" value="project" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-select placeholder="状态" style="width: 120px">
            <el-option label="草稿" value="draft" />
            <el-option label="审批中" value="pending" />
            <el-option label="已通过" value="approved" />
          </el-select>
        </el-form-item>
      </el-form>
    </div>

    <div class="card">
      <el-table :data="tableData" stripe>
        <el-table-column prop="docNo" label="文件编号" width="140" />
        <el-table-column prop="title" label="文件标题" width="220" />
        <el-table-column prop="category" label="类别" width="100" />
        <el-table-column prop="purchaseType" label="采购方式" width="120" />
        <el-table-column prop="version" label="版本" width="80" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="120" />
        <el-table-column label="操作" width="160">
          <template #default>
            <el-button link type="primary" size="small">编辑</el-button>
            <el-button link type="primary" size="small">审核</el-button>
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
import { documentData } from '@/api/mock'

const tableData = documentData
const getStatusType = (s: string) => ({ draft: 'info', pending: 'warning', approved: 'success' }[s] || 'info')
const getStatusLabel = (s: string) => ({ draft: '草稿', pending: '审批中', approved: '已通过' }[s] || s)
</script>

<style scoped lang="scss">
.page { .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; h2 { color: #f0f6fc; font-size: 22px; font-weight: 600; } } .search-card { margin-bottom: 16px; } }
</style>
