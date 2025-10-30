<template>
  <div class="referrer-detail-page">
    <el-page-header @back="goBack" title="返回">
      <template #content>
        <span class="page-title">分销员详情</span>
      </template>
    </el-page-header>

    <div v-loading="loading" class="content">
      <el-row :gutter="20">
        <!-- 基本信息 -->
        <el-col :span="16">
          <el-card>
            <template #header>
              <div class="flex-between">
                <span>基本信息</span>
                <el-button
                  v-if="canUpdate"
                  type="primary"
                  size="small"
                  @click="handleEdit"
                >
                  <el-icon><Edit /></el-icon>
                  编辑
                </el-button>
              </div>
            </template>
            <el-descriptions :column="2" border>
              <el-descriptions-item label="分销员编号">
                <el-tag type="success">{{ referrerData?.referrer }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="显示名称">
                {{ referrerData?.display_name }}
              </el-descriptions-item>
              <el-descriptions-item label="业务线">
                {{ businessLineName }}
              </el-descriptions-item>
              <el-descriptions-item label="优先级">
                {{ referrerData?.priority }}
              </el-descriptions-item>
              <el-descriptions-item label="配置策略">
                <el-tag :type="referrerData?.config_strategy === 'SHARED' ? 'success' : 'warning'">
                  {{ referrerData?.config_strategy }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="状态">
                <el-tag :type="referrerData?.is_active ? 'success' : 'info'">
                  {{ referrerData?.is_active ? '启用' : '禁用' }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="创建时间">
                {{ formatDateTime(referrerData?.created_at || '') }}
              </el-descriptions-item>
              <el-descriptions-item label="更新时间">
                {{ formatDateTime(referrerData?.updated_at || '') }}
              </el-descriptions-item>
              <el-descriptions-item label="备注" :span="2">
                {{ referrerData?.remark || '无' }}
              </el-descriptions-item>
            </el-descriptions>
          </el-card>
        </el-col>

        <!-- 统计卡片 -->
        <el-col :span="8">
          <el-card>
            <template #header>
              <span>统计数据</span>
            </template>
            <div class="stat-item">
              <div class="stat-label">总扫码次数</div>
              <div class="stat-value">{{ referrerData?.total_scans || 0 }}</div>
            </div>
            <el-divider />
            <div class="stat-item">
              <div class="stat-label">总转化次数</div>
              <div class="stat-value">{{ referrerData?.total_conversions || 0 }}</div>
            </div>
            <el-divider />
            <div class="stat-item">
              <div class="stat-label">转化率</div>
              <div class="stat-value">
                {{ ((referrerData?.conversion_rate || 0) * 100).toFixed(1) }}%
              </div>
            </div>
            <el-divider />
            <div class="stat-item">
              <div class="stat-label">最后扫码时间</div>
              <div class="stat-value small">
                {{ referrerData?.last_scan_at ? formatDateTime(referrerData.last_scan_at) : '暂无' }}
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 相关短链 -->
      <el-card style="margin-top: 20px">
        <template #header>
          <span>关联短链</span>
        </template>
        <el-button type="primary" @click="viewShortUrls">
          <el-icon><Link /></el-icon>
          查看该分销员的所有短链
        </el-button>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import { referrersAPI } from '@/api/referrers'
import { businessLinesAPI } from '@/api/business-lines'
import type { ReferrerConfig, BusinessLine } from '@/types/business'
import { formatDateTime } from '@/utils/format'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const loading = ref(false)
const referrerData = ref<ReferrerConfig | null>(null)
const businessLines = ref<BusinessLine[]>([])

const canUpdate = computed(() => authStore.hasPermission('referrers:update'))

const businessLineName = computed(() => {
  if (!referrerData.value) return ''
  const line = businessLines.value.find((item) => item.id === referrerData.value?.business_line_id)
  return line?.name || `业务线${referrerData.value.business_line_id}`
})

onMounted(() => {
  loadBusinessLines()
  loadDetail()
})

async function loadBusinessLines() {
  try {
    const response = await businessLinesAPI.getList()
    if (response.success && response.data) {
      // 兼容两种格式：{items: []} 或直接 []
      if (Array.isArray(response.data)) {
        businessLines.value = response.data
      } else if (typeof response.data === 'object' && 'items' in response.data) {
        businessLines.value = (response.data as any).items || []
      }
    }
  } catch (error) {
    console.error('加载业务线失败:', error)
  }
}

async function loadDetail() {
  const id = Number(route.params.id)
  if (!id) {
    ElMessage.error('参数错误')
    goBack()
    return
  }

  loading.value = true
  try {
    const response = await referrersAPI.getDetail(id)
    if (response.success && response.data) {
      referrerData.value = response.data
    }
  } catch (error) {
    console.error('加载分销员详情失败:', error)
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

function goBack() {
  router.push('/referrers')
}

function handleEdit() {
  router.push(`/referrers/${route.params.id}/edit`)
}

function viewShortUrls() {
  // 跳转到短链接管理页面，并带上 referrer 参数
  router.push({
    path: '/short-urls',
    query: { referrer: referrerData.value?.referrer },
  })
}
</script>

<style lang="scss" scoped>
.referrer-detail-page {
  .page-title {
    font-size: 18px;
    font-weight: 600;
  }

  .content {
    margin-top: 20px;
  }

  .stat-item {
    text-align: center;

    .stat-label {
      font-size: 14px;
      color: #909399;
      margin-bottom: 8px;
    }

    .stat-value {
      font-size: 24px;
      font-weight: bold;
      color: #303133;

      &.small {
        font-size: 14px;
        font-weight: normal;
      }
    }
  }
}
</style>

