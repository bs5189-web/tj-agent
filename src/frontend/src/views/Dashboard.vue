<template>
  <div class="dashboard">
    <div class="page-header">
      <h2>数据概览</h2>
    </div>
    
    <el-row :gutter="16" class="stats-row">
      <el-col :xs="24" :sm="12" :lg="6" v-for="stat in stats" :key="stat.label">
        <div class="data-card">
          <div class="data-label">{{ stat.label }}</div>
          <div class="data-value">{{ stat.value }}</div>
          <div class="data-trend" :class="stat.trend > 0 ? 'up' : 'down'">
            <el-icon v-if="stat.trend > 0"><TrendCharts /></el-icon>
            <el-icon v-else><Bottom /></el-icon>
            {{ Math.abs(stat.trend) }}% 较上月
          </div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="16" class="charts-row">
      <el-col :xs="24" :lg="16">
        <div class="card">
          <div class="card-header">
            <span class="card-title">采购趋势</span>
            <el-button link type="primary">查看更多</el-button>
          </div>
          <div ref="trendChartRef" class="chart-container"></div>
        </div>
      </el-col>
      <el-col :xs="24" :lg="8">
        <div class="card">
          <div class="card-header">
            <span class="card-title">采购类型分布</span>
          </div>
          <div ref="pieChartRef" class="chart-container"></div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="16" class="bottom-row">
      <el-col :xs="24" :lg="12">
        <div class="card">
          <div class="card-header">
            <span class="card-title">待办事项</span>
            <el-button link type="primary">查看全部</el-button>
          </div>
          <el-table :data="todoList" size="small">
            <el-table-column prop="title" label="待办事项" />
            <el-table-column prop="time" label="时间" width="100" />
            <el-table-column prop="priority" label="优先级" width="80">
              <template #default="{ row }">
                <el-tag :type="getPriorityType(row.priority)" size="small">{{ row.priority }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-col>
      <el-col :xs="24" :lg="12">
        <div class="card">
          <div class="card-header">
            <span class="card-title">预警通知</span>
          </div>
          <div v-for="item in warnings" :key="item.id" style="margin-bottom: 12px;">
            <el-alert :type="item.type" :title="item.title" :description="item.time" :closable="false" show-icon />
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import * as echarts from 'echarts'
import { todoListData, warningListData, getDashboardStats } from '@/api/mock'

const trendChartRef = ref<HTMLElement>()
const pieChartRef = ref<HTMLElement>()

const stats = computed(() => {
  const { totalPlans, pendingRequirements, performingContracts, completionRate } = getDashboardStats()
  return [
    { label: '年度采购计划', value: totalPlans.toString(), trend: 12.5 },
    { label: '待处理需求', value: pendingRequirements.toString(), trend: -5.2 },
    { label: '执行中合同', value: performingContracts.toString(), trend: 8.1 },
    { label: '履约完成率', value: `${completionRate}%`, trend: 2.3 },
  ]
})

const todoList = todoListData

const warnings = warningListData

const getPriorityType = (priority: string) => {
  const map: Record<string, any> = { '高': 'danger', '中': 'warning', '低': 'info' }
  return map[priority] || 'info'
}

onMounted(() => {
  if (trendChartRef.value) {
    const chart = echarts.init(trendChartRef.value)
    chart.setOption({
      tooltip: { trigger: 'axis' },
      legend: { data: ['采购计划', '采购需求'], textStyle: { color: '#8b949e' } },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: ['1月', '2月', '3月', '4月', '5月', '6月'],
        axisLine: { lineStyle: { color: '#30363d' } },
        axisLabel: { color: '#8b949e' },
      },
      yAxis: {
        type: 'value',
        axisLine: { lineStyle: { color: '#30363d' } },
        splitLine: { lineStyle: { color: '#30363d', type: 'dashed' } },
      },
      series: [
        { name: '采购计划', type: 'line', smooth: true, data: [120, 132, 101, 134, 90, 130], itemStyle: { color: '#0066FF' }, areaStyle: { color: 'rgba(0, 102, 255, 0.2)' } },
        { name: '采购需求', type: 'line', smooth: true, data: [80, 92, 71, 94, 60, 110], itemStyle: { color: '#00D4FF' }, areaStyle: { color: 'rgba(0, 212, 255, 0.2)' } },
      ],
    })
  }

  if (pieChartRef.value) {
    const chart = echarts.init(pieChartRef.value)
    chart.setOption({
      tooltip: { trigger: 'item' },
      series: [{
        type: 'pie',
        radius: ['45%', '70%'],
        center: ['50%', '50%'],
        data: [
          { value: 45, name: '物资采购', itemStyle: { color: '#0066FF' } },
          { value: 25, name: '服务采购', itemStyle: { color: '#00D4FF' } },
          { value: 18, name: '工程采购', itemStyle: { color: '#7C3AED' } },
          { value: 12, name: '其他', itemStyle: { color: '#8b949e' } },
        ],
      }],
    })
  }
})
</script>

<style scoped lang="scss">
.dashboard {
  .page-header {
    margin-bottom: 24px;
    h2 { color: #f0f6fc; font-size: 22px; font-weight: 600; }
  }
  .stats-row { margin-bottom: 16px; }
  .charts-row { margin-bottom: 16px; }
  .bottom-row { margin-bottom: 16px; }
  .chart-container { height: 280px; }
}
</style>
