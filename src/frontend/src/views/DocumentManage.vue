<template>
  <div class="page">
    <div class="page-header">
      <h2>采购文件管理</h2>
      <el-button type="primary" @click="openCreateDialog">新建文件</el-button>
    </div>

    <div class="card search-card">
      <el-form inline>
        <el-form-item><el-input v-model="searchForm.keyword" placeholder="搜索文件编号/标题" prefix-icon="Search" /></el-form-item>
        <el-form-item>
          <el-select v-model="searchForm.category" placeholder="类别" style="width: 120px">
            <el-option label="全部" value="" />
            <el-option label="货物类" value="货物类" />
            <el-option label="服务类" value="服务类" />
            <el-option label="工程类" value="工程类" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-select v-model="searchForm.status" placeholder="状态" style="width: 120px">
            <el-option label="全部" value="" />
            <el-option label="草稿" value="draft" />
            <el-option label="审批中" value="pending" />
            <el-option label="已通过" value="approved" />
          </el-select>
        </el-form-item>
        <el-form-item><el-button @click="handleReset">重置</el-button></el-form-item>
      </el-form>
    </div>

    <div class="card">
      <el-table :data="paginatedData" stripe>
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
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="openViewDialog(row)">查看</el-button>
            <el-button link type="primary" size="small" @click="openEditDialog(row)">编辑</el-button>
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

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑采购文件' : '新建采购文件'" width="600px">
      <el-form label-width="100px">
        <el-form-item label="文件标题"><el-input v-model="formData.title" placeholder="请输入文件标题" /></el-form-item>
        <el-form-item label="类别">
          <el-select v-model="formData.category" style="width: 100%">
            <el-option label="货物类" value="货物类" />
            <el-option label="服务类" value="服务类" />
            <el-option label="工程类" value="工程类" />
          </el-select>
        </el-form-item>
        <el-form-item label="采购方式">
          <el-select v-model="formData.purchaseType" style="width: 100%">
            <el-option label="公开招标" value="公开招标" />
            <el-option label="邀请招标" value="邀请招标" />
            <el-option label="竞争性谈判" value="竞争性谈判" />
            <el-option label="询价采购" value="询价采购" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="viewDialogVisible" title="采购文件详情" width="600px">
      <el-descriptions :column="2" border v-if="viewData">
        <el-descriptions-item label="文件编号">{{ viewData.docNo }}</el-descriptions-item>
        <el-descriptions-item label="版本">{{ viewData.version }}</el-descriptions-item>
        <el-descriptions-item label="文件标题" :span="2">{{ viewData.title }}</el-descriptions-item>
        <el-descriptions-item label="类别">{{ viewData.category }}</el-descriptions-item>
        <el-descriptions-item label="采购方式">{{ viewData.purchaseType }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(viewData.status)">{{ getStatusLabel(viewData.status) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ viewData.createTime }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="viewDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { documentData as mockData } from '@/api/mock'
import type { Document } from '@/api/mock'

const dialogVisible = ref(false)
const viewDialogVisible = ref(false)
const isEdit = ref(false)
const editingId = ref<number | null>(null)
const viewData = ref<Document | null>(null)

const currentPage = ref(1)
const pageSize = ref(10)

const formData = reactive({
  title: '',
  category: '货物类',
  purchaseType: '公开招标'
})

const searchForm = reactive({
  keyword: '',
  category: '',
  status: ''
})

let nextId = Math.max(...mockData.map(d => d.id)) + 1

const allData = ref<Document[]>([...mockData])

const filteredData = computed(() => {
  return allData.value.filter(item => {
    const matchKeyword = !searchForm.keyword || item.docNo.toLowerCase().includes(searchForm.keyword.toLowerCase()) || item.title.toLowerCase().includes(searchForm.keyword.toLowerCase())
    const matchCategory = !searchForm.category || item.category === searchForm.category
    const matchStatus = !searchForm.status || item.status === searchForm.status
    return matchKeyword && matchCategory && matchStatus
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
  Object.assign(formData, { title: '', category: '货物类', purchaseType: '公开招标' })
  dialogVisible.value = true
}

const openEditDialog = (row: Document) => {
  isEdit.value = true
  editingId.value = row.id
  Object.assign(formData, {
    title: row.title,
    category: row.category,
    purchaseType: row.purchaseType
  })
  dialogVisible.value = true
}

const openViewDialog = (row: Document) => {
  viewData.value = { ...row }
  viewDialogVisible.value = true
}

const handleSave = () => {
  if (isEdit.value && editingId.value !== null) {
    const index = allData.value.findIndex(d => d.id === editingId.value)
    if (index !== -1) {
      allData.value[index] = {
        ...allData.value[index],
        title: formData.title,
        category: formData.category,
        purchaseType: formData.purchaseType
      }
    }
  } else {
    const newDoc: Document = {
      id: nextId++,
      docNo: `DOC-2024-${String(nextId).padStart(3, '0')}`,
      title: formData.title,
      category: formData.category,
      purchaseType: formData.purchaseType,
      version: 'V1.0',
      status: 'draft',
      createTime: new Date().toISOString().split('T')[0]
    }
    allData.value.unshift(newDoc)
  }
  dialogVisible.value = false
}

const handleReset = () => {
  searchForm.keyword = ''
  searchForm.category = ''
  searchForm.status = ''
}

const getStatusType = (s: string) => ({ draft: 'info', pending: 'warning', approved: 'success' }[s] || 'info')
const getStatusLabel = (s: string) => ({ draft: '草稿', pending: '审批中', approved: '已通过' }[s] || s)
</script>

<style scoped lang="scss">
.page { .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; h2 { color: #f0f6fc; font-size: 22px; font-weight: 600; } } .search-card { margin-bottom: 16px; } }
</style>
