<template>
  <div class="my-analytics-page">
    <el-card v-loading="loading">
      <template #header>
        <div class="flex-between">
          <span class="card-title">我的数据分析</span>
          <el-select v-model="days" @change="loadData" style="width: 150px">
            <el-option label="近7天" :value="7" />
            <el-option label="近15天" :value="15" />
            <el-option label="近30天" :value="30" />
            <el-option label="近60天" :value="60" />
            <el-option label="近90天" :value="90" />
          </el-select>
        </div>
      </template>

      <el-descriptions :column="2" border v-if="analytics">
        <el-descriptions-item label="统计时间段">
          {{ formatDateTime(analytics.start_date) }} 至 {{ formatDateTime(analytics.end_date) }}
        </el-descriptions-item>
        <el-descriptions-item label="统计天数">
          {{ analytics.period_days }} 天
        </el-descriptions-item>
        <el-descriptions-item label="链接总数">
          <strong>{{ analytics.total_links }}</strong>
        </el-descriptions-item>
        <el-descriptions-item label="启用中链接">
          <strong style="color: #67C23A">{{ analytics.active_links }}</strong>
        </el-descriptions-item>
        <el-descriptions-item label="总点击数">
          <strong style="color: #409EFF">{{ analytics.total_scans }}</strong>
        </el-descriptions-item>
        <el-descriptions-item label="总转化数">
          <strong style="color: #E6A23C">{{ analytics.total_conversions }}</strong>
        </el-descriptions-item>
        <el-descriptions-item label="转化率" :span="2">
          <el-tag type="success" size="large">
            {{ analytics.conversion_rate.toFixed(2) }}%
          </el-tag>
        </el-descriptions-item>
      </el-descriptions>

      <el-empty v-else description="暂无数据" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { referrerSelfAPI, type ReferrerAnalytics } from '@/api/referrer-self'
import { formatDateTime } from '@/utils/format'

const loading = ref(false)
const days = ref(30)
const analytics = ref<ReferrerAnalytics>()

onMounted(() => {
  loadData()
})

async function loadData() {
  loading.value = true
  try {
    const response = await referrerSelfAPI.getMyAnalytics(days.value)
    if (response.success && response.data) {
      analytics.value = response.data
      console.log('✅ 数据分析:', analytics.value)
    }
  } catch (error) {
    console.error('加载数据分析失败:', error)
    ElMessage.error('加载数据分析失败')
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.my-analytics-page {
  .card-title {
    font-weight: 600;
    font-size: 16px;
  }

  .flex-between {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>

