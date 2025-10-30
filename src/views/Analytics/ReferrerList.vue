<template>
  <div class="referrer-analytics-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span class="card-title">分销员数据分析</span>
          <div class="time-selector">
            <!-- 快捷按钮 -->
            <el-button-group>
              <el-button 
                :type="periodType === 'today' ? 'primary' : 'default'"
                @click="selectPeriod('today')"
              >
                今天
              </el-button>
              <el-button 
                :type="periodType === 'yesterday' ? 'primary' : 'default'"
                @click="selectPeriod('yesterday')"
              >
                昨天
              </el-button>
              <el-button 
                :type="periodType === 'recent' ? 'primary' : 'default'"
                @click="selectPeriod('recent', 7)"
              >
                最近7天
              </el-button>
              <el-button 
                :type="periodType === 'recent' && timeRange === 30 ? 'primary' : 'default'"
                @click="selectPeriod('recent', 30)"
              >
                最近30天
              </el-button>
            </el-button-group>
            
            <!-- 自定义日期范围 -->
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              size="default"
              style="width: 240px"
              @change="handleDateRangeChange"
            />
          </div>
        </div>
      </template>

      <!-- 排行榜 -->
      <el-table v-loading="loading" :data="leaderboardData" stripe>
        <el-table-column type="index" label="排名" width="80" />
        <el-table-column prop="referrer" label="分销员" min-width="150" />
        <el-table-column prop="total_clicks" label="总点击数" width="120" sortable />
        <el-table-column prop="total_links" label="短链总数" width="120" sortable />
        <el-table-column prop="active_links" label="活跃链接" width="120" sortable />
        <el-table-column prop="avg_ctr" label="平均点击率" width="120" sortable>
          <template #default="{ row }">
            <el-tag type="success">
              {{ row.avg_ctr.toFixed(1) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" link @click="handleViewDetail(row)">
              查看详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 详情对话框 -->
    <el-dialog v-model="detailVisible" title="分销员详情" width="80%" destroy-on-close>
      <div v-if="detailData">
        <!-- 统计卡片 -->
        <el-row :gutter="20" class="stats-row">
          <el-col :span="6">
            <el-statistic title="总点击数" :value="detailData.total_clicks || 0">
              <template #suffix>次</template>
            </el-statistic>
          </el-col>
          <el-col :span="6">
            <el-statistic title="短链总数" :value="detailData.total_links || 0">
              <template #suffix>个</template>
            </el-statistic>
          </el-col>
          <el-col :span="6">
            <el-statistic title="活跃链接" :value="detailData.active_links || 0">
              <template #suffix>个</template>
            </el-statistic>
          </el-col>
          <el-col :span="6">
            <el-statistic
              title="平均点击率"
              :value="detailData.avg_ctr || 0"
              :precision="1"
            />
          </el-col>
        </el-row>

        <!-- 趋势图表 -->
        <el-divider />
        <div v-if="detailData.daily_stats && detailData.daily_stats.length > 0">
          <h4>趋势分析</h4>
          <div class="chart-container">
            <v-chart :option="chartOption" autoresize />
          </div>
        </div>

        <!-- 热门群组 -->
        <el-divider />
        <div v-if="detailData.top_groups && detailData.top_groups.length > 0">
          <h4>热门群组</h4>
          <el-table :data="detailData.top_groups" size="small">
            <el-table-column prop="group_name" label="群组名称" />
            <el-table-column prop="member_count" label="成员数" width="120" />
          </el-table>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
} from 'echarts/components'
import VChart from 'vue-echarts'
import { analyticsAPI } from '@/api/analytics'
import type { ReferrerStats } from '@/types/business'

use([CanvasRenderer, LineChart, TitleComponent, TooltipComponent, LegendComponent, GridComponent])

const loading = ref(false)
const periodType = ref<'today' | 'yesterday' | 'recent' | 'custom'>('today')
const timeRange = ref(30)
const dateRange = ref<[Date, Date] | null>(null)
const leaderboardData = ref<ReferrerStats[]>([])
const detailVisible = ref(false)
const detailData = ref<any>(null)
const currentReferrer = ref('')

onMounted(() => {
  loadLeaderboard()
})

function selectPeriod(type: 'today' | 'yesterday' | 'recent', days?: number) {
  periodType.value = type
  if (days) {
    timeRange.value = days
  }
  dateRange.value = null
  loadLeaderboard()
}

function handleDateRangeChange(value: any) {
  if (value && value.length === 2) {
    periodType.value = 'custom'
    loadLeaderboard()
  }
}

async function loadLeaderboard() {
  loading.value = true
  try {
    const params: any = {
      limit: 20,
    }
    
    // 根据选择的时间类型设置参数
    if (periodType.value === 'custom' && dateRange.value) {
      // 自定义日期范围 - 必须传 period_type=custom
      params.period_type = 'custom'
      const [startDate, endDate] = dateRange.value
      params.start_date = startDate.toISOString().split('T')[0]
      params.end_date = endDate.toISOString().split('T')[0]
      console.log('📅 自定义日期范围:', params.start_date, '至', params.end_date)
    } else if (periodType.value === 'recent') {
      params.period_type = 'recent'
      params.days = timeRange.value
      console.log('📅 最近', params.days, '天')
    } else {
      // today 或 yesterday
      params.period_type = periodType.value
      console.log('📅', periodType.value === 'today' ? '今天' : '昨天')
    }
    
    console.log('📊 完整请求参数:', params)
    const response = await analyticsAPI.getLeaderboard(params)
    console.log('📊 排行榜响应:', response)
    
    if (response.success && response.data) {
      // 后端返回的字段是 top_referrers，不是 leaderboard
      leaderboardData.value = response.data.top_referrers || response.data.leaderboard || []
      console.log('✅ 加载了', leaderboardData.value.length, '个分销员数据')
      
      // 显示时间范围信息
      if (response.data.period) {
        console.log('📊 数据时间范围:', response.data.period)
      }
    }
  } catch (error) {
    console.error('❌ 加载排行榜失败:', error)
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

async function handleViewDetail(row: ReferrerStats) {
  currentReferrer.value = row.referrer
  try {
    const response = await analyticsAPI.getReferrerOverview(row.referrer, {
      days: timeRange.value,
    })
    if (response.success && response.data) {
      detailData.value = response.data
      detailVisible.value = true
    }
  } catch (error) {
    console.error('加载详情失败:', error)
    ElMessage.error('加载详情失败')
  }
}

function getConversionType(rate: number): 'success' | 'warning' | 'danger' {
  if (rate >= 80) return 'success'
  if (rate >= 50) return 'warning'
  return 'danger'
}

const chartOption = computed(() => {
  if (!detailData.value?.daily_stats) return {}

  const dates = detailData.value.daily_stats.map((item: any) => item.date)
  const invites = detailData.value.daily_stats.map((item: any) => item.invites)
  const joins = detailData.value.daily_stats.map((item: any) => item.joins)

  return {
    tooltip: {
      trigger: 'axis',
    },
    legend: {
      data: ['邀请人数', '加群人数'],
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: dates,
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        name: '邀请人数',
        type: 'line',
        data: invites,
        smooth: true,
      },
      {
        name: '加群人数',
        type: 'line',
        data: joins,
        smooth: true,
      },
    ],
  }
})
</script>

<style lang="scss" scoped>
.referrer-analytics-page {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
  }

  .card-title {
    font-weight: 600;
    font-size: 16px;
  }

  .time-selector {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
  }

  .stats-row {
    margin-bottom: 20px;
  }

  .chart-container {
    height: 400px;
    margin-top: 20px;
  }

  h4 {
    margin: 10px 0;
    font-size: 14px;
    font-weight: 600;
  }
}
</style>

