<template>
  <div class="dashboard">
    <el-row :gutter="20" class="stats-row">
      <el-col :xs="12" :sm="12" :md="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon business">
              <el-icon :size="32"><OfficeBuilding /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.totalBusinessLines }}</div>
              <div class="stat-label">业务线总数</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="12" :sm="12" :md="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon groups">
              <el-icon :size="32"><ChatDotSquare /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.totalGroups }}</div>
              <div class="stat-label">群组总数</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="12" :sm="12" :md="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon members">
              <el-icon :size="32"><User /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.totalMembers }}</div>
              <div class="stat-label">成员总数</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="12" :sm="12" :md="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon rules">
              <el-icon :size="32"><Setting /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.activeRules }}</div>
              <div class="stat-label">活跃规则</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="24">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>快捷操作</span>
            </div>
          </template>
          <div class="quick-actions">
            <el-button type="primary" @click="goTo('/business-lines')">
              <el-icon><Plus /></el-icon>
              创建业务线
            </el-button>
            <el-button type="success" @click="goTo('/join-rules/create')">
              <el-icon><Plus /></el-icon>
              创建加群规则
            </el-button>
            <el-button type="info" @click="handleSync">
              <el-icon><Refresh /></el-icon>
              同步数据
            </el-button>
            <el-button @click="goTo('/analytics')">
              <el-icon><DataAnalysis /></el-icon>
              数据分析
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="24">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>欢迎使用企业微信群管理系统</span>
            </div>
          </template>
          <div class="welcome-content">
            <p>👋 欢迎回来，{{ username }}！</p>
            <p>系统运行正常，您可以开始管理您的企业微信群组了。</p>
            <el-divider />
            <p><strong>系统功能：</strong></p>
            <ul>
              <li>✅ 业务线管理：创建和管理不同的业务线</li>
              <li>✅ 群组管理：查看和同步企业微信群组信息</li>
              <li>✅ 加群规则：配置自动化的加群规则和群池</li>
              <li>✅ 数据分析：查看分销员数据和转化率分析</li>
            </ul>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import { groupsAPI } from '@/api/groups'
import { businessLinesAPI } from '@/api/business-lines'
import { joinRulesAPI } from '@/api/join-rules'

const router = useRouter()
const authStore = useAuthStore()

const username = ref(authStore.username || '管理员')

const stats = ref({
  totalBusinessLines: 0,
  totalGroups: 0,
  totalMembers: 0,
  activeRules: 0,
})

onMounted(async () => {
  // 加载统计数据（路由守卫已确保只有管理员能访问此页面）
  await loadStats()
})

async function loadStats() {
  try {
    // 加载群组统计
    const overview = await groupsAPI.getOverview()
    console.log('📊 群组统计响应:', overview)
    if (overview.success && overview.data) {
      stats.value.totalGroups = overview.data.total_groups
      stats.value.totalMembers = overview.data.total_members
    }

    // 加载业务线数量 - 统一格式 {success, data: {items, total}}
    const businessLinesRes: any = await businessLinesAPI.getList()
    console.log('🏢 业务线响应:', businessLinesRes)
    
    if (businessLinesRes.success && businessLinesRes.data) {
      // 从 data.items 获取列表，从 data.total 获取总数
      const items = businessLinesRes.data.items || businessLinesRes.data
      stats.value.totalBusinessLines = Array.isArray(items) ? items.length : businessLinesRes.data.total || 0
      console.log('✅ 业务线总数:', stats.value.totalBusinessLines)
    }

    // 加载活跃规则数量 - 统一格式 {success, data: {items, total}}
    const rulesRes: any = await joinRulesAPI.getList({ page: 1, page_size: 1000, is_active: true })
    console.log('⚙️ 规则响应:', rulesRes)
    
    if (rulesRes.success && rulesRes.data) {
      // 从 data.items 获取列表
      const items = rulesRes.data.items || rulesRes.data
      if (Array.isArray(items)) {
        // 筛选活跃的规则
        const activeRules = items.filter((rule: any) => rule.is_active === true)
        stats.value.activeRules = activeRules.length
        console.log('✅ 活跃规则数:', activeRules.length)
      } else {
        // 使用 total 字段
        stats.value.activeRules = rulesRes.data.total || 0
        console.log('✅ 活跃规则数（从total）:', stats.value.activeRules)
      }
    }
  } catch (error) {
    console.error('❌ 加载统计数据失败:', error)
  }
}

function goTo(path: string) {
  router.push(path)
}

function handleSync() {
  ElMessage.info('数据同步功能开发中...')
}
</script>

<style lang="scss" scoped>
.dashboard {
  .stats-row {
    margin-bottom: 20px;
  }

  .stat-card {
    margin-bottom: 10px;
    
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
        flex-shrink: 0;

        // 移动端缩小图标
        @media (max-width: 768px) {
          width: 48px;
          height: 48px;
          
          :deep(.el-icon) {
            font-size: 24px !important;
          }
        }

        &.business {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: #fff;
        }

        &.groups {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          color: #fff;
        }

        &.members {
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
          color: #fff;
        }

        &.rules {
          background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
          color: #fff;
        }
      }

      .stat-info {
        flex: 1;
        min-width: 0;

        .stat-value {
          font-size: 28px;
          font-weight: 600;
          color: #303133;
          line-height: 1;
          margin-bottom: 8px;
          
          @media (max-width: 768px) {
            font-size: 22px;
          }
        }

        .stat-label {
          font-size: 14px;
          color: #909399;
          white-space: nowrap;
          
          @media (max-width: 768px) {
            font-size: 12px;
          }
        }
      }
    }
  }

  .quick-actions {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    
    // 移动端按钮全宽
    @media (max-width: 768px) {
      :deep(.el-button) {
        flex: 1;
        min-width: calc(50% - 6px);
      }
    }
  }

  .welcome-content {
    line-height: 1.8;
    
    @media (max-width: 768px) {
      font-size: 14px;
    }

    ul {
      padding-left: 20px;

      li {
        margin: 8px 0;
      }
    }
  }

  .card-header {
    font-weight: 600;
  }
}
</style>

