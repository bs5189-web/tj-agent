<template>
  <div class="page">
    <div class="page-header">
      <h2>采购需求管理</h2>
      <el-button type="primary" @click="dialogVisible = true">发起需求</el-button>
    </div>

    <div class="card search-card">
      <el-form inline>
        <el-form-item><el-input placeholder="搜索需求编号/标题" prefix-icon="Search" /></el-form-item>
        <el-form-item>
          <el-select placeholder="状态" style="width: 120px">
            <el-option label="草稿" value="draft" />
            <el-option label="合规检查中" value="checking" />
            <el-option label="审批中" value="pending" />
            <el-option label="已通过" value="approved" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-select placeholder="紧急度" style="width: 100px">
            <el-option label="低" value="low" />
            <el-option label="中" value="medium" />
            <el-option label="高" value="high" />
          </el-select>
        </el-form-item>
      </el-form>
    </div>

    <div class="card">
      <el-table :data="tableData" stripe>
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
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="120" />
        <el-table-column label="操作" width="120">
          <template #default>
            <el-button link type="primary" size="small">查看</el-button>
            <el-button link type="primary" size="small">编辑</el-button>
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

    <el-dialog v-model="dialogVisible" title="发起采购需求" width="600px">
      <el-form label-width="100px">
        <el-form-item label="需求标题"><el-input placeholder="请输入需求标题" /></el-form-item>
        <el-form-item label="需求部门"><el-input placeholder="请输入部门名称" /></el-form-item>
        <el-form-item label="采购物品"><el-input placeholder="请输入采购物品名称" /></el-form-item>
        <el-form-item label="预估金额"><el-input type="number" placeholder="请输入预估金额"><template #append>元</template></el-input></el-form-item>
        <el-form-item label="紧急度">
          <el-select style="width: 100%">
            <el-option label="低" value="low" />
            <el-option label="中" value="medium" />
            <el-option label="高" value="high" />
          </el-select>
        </el-form-item>
        <el-form-item label="需求理由"><el-input type="textarea" :rows="3" placeholder="请输入需求理由" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="dialogVisible = false">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { requirementData } from '@/api/mock'

const dialogVisible = ref(false)

const tableData = requirementData

const getUrgencyType = (level: string) => ({ low: 'info', medium: 'warning', high: 'danger' }[level] || 'info')
const getUrgencyLabel = (level: string) => ({ low: '低', medium: '中', high: '高' }[level] || level)
const getStatusType = (status: string) => ({ draft: 'info', checking: 'warning', pending: 'warning', approved: 'success', rejected: 'danger' }[status] || 'info')
const getStatusLabel = (status: string) => ({ draft: '草稿', checking: '合规检查中', pending: '审批中', approved: '已通过', rejected: '已驳回' }[status] || status)
</script>

<style scoped lang="scss">
.page { .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; h2 { color: #f0f6fc; font-size: 22px; font-weight: 600; } } .search-card { margin-bottom: 16px; } }
</style>
