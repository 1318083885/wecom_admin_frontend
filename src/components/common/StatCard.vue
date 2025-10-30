<template>
  <el-card class="stat-card" :body-style="{ padding: '20px' }">
    <div class="stat-content">
      <div class="stat-icon" :class="iconClass">
        <el-icon :size="iconSize">
          <component :is="icon" />
        </el-icon>
      </div>
      <div class="stat-info">
        <div class="stat-value">{{ value }}</div>
        <div class="stat-label">{{ label }}</div>
        <div v-if="trend !== undefined" class="stat-trend" :class="trendClass">
          <el-icon>
            <component :is="trend > 0 ? 'CaretTop' : 'CaretBottom'" />
          </el-icon>
          <span>{{ Math.abs(trend) }}%</span>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  label: string
  value: string | number
  icon: string
  iconClass?: string
  iconSize?: number
  trend?: number
}

const props = withDefaults(defineProps<Props>(), {
  iconClass: 'primary',
  iconSize: 32,
})

const trendClass = computed(() => {
  if (props.trend === undefined) return ''
  return props.trend > 0 ? 'trend-up' : 'trend-down'
})
</script>

<style lang="scss" scoped>
.stat-card {
  .stat-content {
    display: flex;
    align-items: center;

    .stat-icon {
      width: 64px;
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      margin-right: 16px;
      color: #fff;

      &.primary {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }

      &.success {
        background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
      }

      &.warning {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      }

      &.info {
        background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      }
    }

    .stat-info {
      flex: 1;

      .stat-value {
        font-size: 28px;
        font-weight: 600;
        color: #303133;
        line-height: 1;
        margin-bottom: 8px;
      }

      .stat-label {
        font-size: 14px;
        color: #909399;
        margin-bottom: 4px;
      }

      .stat-trend {
        font-size: 12px;
        display: flex;
        align-items: center;
        gap: 2px;

        &.trend-up {
          color: #67c23a;
        }

        &.trend-down {
          color: #f56c6c;
        }
      }
    }
  }
}
</style>

