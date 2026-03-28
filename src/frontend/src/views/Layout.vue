<template>
  <div class="layout-container">
    <aside class="sidebar">
      <div class="logo">智能采购系统</div>
      <el-menu
        :default-active="route.path"
        class="menu"
        router
        background-color="transparent"
        text-color="#8b949e"
        active-text-color="#0066FF"
      >
        <el-menu-item v-for="item in menuItems" :key="item.path" :index="item.path">
          <el-icon><component :is="item.icon" /></el-icon>
          <span>{{ item.title }}</span>
        </el-menu-item>
      </el-menu>
    </aside>
    <main class="main-content">
      <header class="header">
        <div class="header-left">
          <el-icon class="collapse-btn" @click="collapsed = !collapsed">
            <Expand v-if="collapsed" />
            <Fold v-else />
          </el-icon>
        </div>
        <div class="header-right">
          <el-badge :value="5" class="notification-badge">
            <el-icon size="20"><Bell /></el-icon>
          </el-badge>
          <div class="user-info">
            <el-icon><Avatar /></el-icon>
            <span>Admin</span>
          </div>
        </div>
      </header>
      <div class="content">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { Bell, Avatar, Fold, Expand, Odometer, Calendar, Document, Folder, Star, Tickets, Setting, FolderOpened, Search } from '@element-plus/icons-vue'

const route = useRoute()
const collapsed = ref(false)

const menuItems = [
  { path: '/dashboard', title: '首页', icon: Odometer },
  { path: '/plan', title: '采购计划', icon: Calendar },
  { path: '/requirement', title: '采购需求', icon: Document },
  { path: '/document', title: '采购文件', icon: Folder },
  { path: '/review', title: '采购评审', icon: Star },
  { path: '/contract', title: '合同管理', icon: Tickets },
  { path: '/archive', title: '档案管理', icon: FolderOpened },
  { path: '/query', title: '数据查询', icon: Search },
  { path: '/system', title: '系统管理', icon: Setting },
]
</script>

<style scoped lang="scss">
.layout-container {
  display: flex;
  min-height: 100vh;
}
</style>
