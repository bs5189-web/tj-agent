import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/views/Layout.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: { title: '首页', icon: 'Odometer' }
      },
      {
        path: 'plan',
        name: 'Plan',
        component: () => import('@/views/PlanManage.vue'),
        meta: { title: '采购计划', icon: 'Calendar' }
      },
      {
        path: 'plan/:id',
        name: 'PlanDetail',
        component: () => import('@/views/PlanManage.vue'),
        meta: { title: '采购计划详情', icon: 'Calendar' }
      },
      {
        path: 'requirement',
        name: 'Requirement',
        component: () => import('@/views/RequirementManage.vue'),
        meta: { title: '采购需求', icon: 'Document' }
      },
      {
        path: 'requirement/:planId',
        name: 'RequirementByPlan',
        component: () => import('@/views/RequirementManage.vue'),
        meta: { title: '采购需求', icon: 'Document' }
      },
      {
        path: 'requirement-filter/:status',
        name: 'RequirementByStatus',
        component: () => import('@/views/RequirementManage.vue'),
        meta: { title: '采购需求', icon: 'Document' }
      },
      {
        path: 'document',
        name: 'Document',
        component: () => import('@/views/DocumentManage.vue'),
        meta: { title: '采购文件', icon: 'Folder' }
      },
      {
        path: 'review',
        name: 'Review',
        component: () => import('@/views/ReviewManage.vue'),
        meta: { title: '采购评审', icon: 'Rating' }
      },
      {
        path: 'review/:contractId',
        name: 'ReviewByContract',
        component: () => import('@/views/ReviewManage.vue'),
        meta: { title: '采购评审', icon: 'Rating' }
      },
      {
        path: 'contract',
        name: 'Contract',
        component: () => import('@/views/ContractManage.vue'),
        meta: { title: '合同管理', icon: 'Tickets' }
      },
      {
        path: 'contract/:requirementId',
        name: 'ContractByRequirement',
        component: () => import('@/views/ContractManage.vue'),
        meta: { title: '合同管理', icon: 'Tickets' }
      },
      {
        path: 'contract/:requirementId/:reviewId',
        name: 'ContractByReview',
        component: () => import('@/views/ContractManage.vue'),
        meta: { title: '合同管理', icon: 'Tickets' }
      },
      {
        path: 'archive',
        name: 'Archive',
        component: () => import('@/views/ArchiveManage.vue'),
        meta: { title: '档案管理', icon: 'FolderOpened' }
      },
      {
        path: 'query',
        name: 'Query',
        component: () => import('@/views/QueryManage.vue'),
        meta: { title: '数据查询', icon: 'Search' }
      },
      {
        path: 'system',
        name: 'System',
        component: () => import('@/views/SystemManage.vue'),
        meta: { title: '系统管理', icon: 'Setting' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
