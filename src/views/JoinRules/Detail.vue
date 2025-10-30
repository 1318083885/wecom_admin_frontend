<template>
  <div class="rule-detail-page">
    <el-page-header @back="goBack">
      <template #content>
        <span class="page-title">规则详情</span>
      </template>
      <template #extra>
        <el-button v-if="canUpdate" type="primary" @click="handleEdit">
          <el-icon><Edit /></el-icon>
          编辑规则
        </el-button>
      </template>
    </el-page-header>

    <div v-loading="loading" class="mt-20">
      <!-- 基本信息 -->
      <el-card>
        <template #header>
          <div class="flex-between">
            <span>基本信息</span>
            <el-tag :type="ruleDetail?.is_active ? 'success' : 'info'">
              {{ ruleDetail?.is_active ? '启用' : '禁用' }}
            </el-tag>
          </div>
        </template>

        <el-descriptions :column="2" border>
          <el-descriptions-item label="规则ID">{{ ruleDetail?.id }}</el-descriptions-item>
          <el-descriptions-item label="规则名称">{{ ruleDetail?.name }}</el-descriptions-item>
          <el-descriptions-item label="业务线ID">
            {{ ruleDetail?.business_line_id }}
          </el-descriptions-item>
          <el-descriptions-item label="选择策略">
            <el-tag>{{ getStrategyText(ruleDetail?.selection_strategy) }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="每次分配群数">
            {{ ruleDetail?.groups_per_assignment }} 个
          </el-descriptions-item>
          <el-descriptions-item label="最大成员数">
            {{ ruleDetail?.max_members_per_group || 200 }} 人
          </el-descriptions-item>
          <el-descriptions-item label="优先级">
            {{ ruleDetail?.priority || 100 }}
          </el-descriptions-item>
          <el-descriptions-item label="自动刷新群池">
            <el-tag :type="ruleDetail?.auto_refresh_groups ? 'success' : 'info'">
              {{ ruleDetail?.auto_refresh_groups ? '是' : '否' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间" :span="2">
            {{ formatDateTime(ruleDetail?.created_at) }}
          </el-descriptions-item>
          <el-descriptions-item label="更新时间" :span="2">
            {{ formatDateTime(ruleDetail?.updated_at) }}
          </el-descriptions-item>
          <el-descriptions-item label="描述" :span="2">
            {{ ruleDetail?.description || '-' }}
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 统计数据 -->
      <el-card class="mt-20">
        <template #header>
          <span>统计数据</span>
        </template>

        <el-row :gutter="20">
          <el-col :xs="12" :sm="6">
            <el-statistic title="总分配次数" :value="ruleDetail?.total_assignments || 0" />
          </el-col>
          <el-col :xs="12" :sm="6">
            <el-statistic
              title="成功率"
              :value="ruleDetail?.success_rate || 0"
              suffix="%"
              :precision="1"
            />
          </el-col>
          <el-col :xs="12" :sm="6">
            <el-statistic
              title="可用群组数"
              :value="ruleDetail?.available_groups_count || 0"
            />
          </el-col>
          <el-col :xs="12" :sm="6">
            <el-statistic title="总群组数" :value="ruleDetail?.total_groups_count || 0" />
          </el-col>
        </el-row>

        <el-divider />

        <el-descriptions :column="2" border>
          <el-descriptions-item label="最后分配时间" :span="2">
            {{ ruleDetail?.last_assignment_at ? formatDateTime(ruleDetail.last_assignment_at) : '暂无' }}
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 群池状态 -->
      <el-card class="mt-20">
        <template #header>
          <div class="flex-between">
            <span>群池状态（{{ poolStatus.length }} 个群组）</span>
            <el-button size="small" @click="loadPoolStatus">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </div>
        </template>

        <el-table :data="poolStatus" stripe>
          <el-table-column prop="group_chat_id" label="群组ID" width="200" show-overflow-tooltip />
          <el-table-column label="群名称" min-width="200">
            <template #default="{ row }">
              {{ getGroupName(row.group_chat_id) }}
            </template>
          </el-table-column>
          <el-table-column label="成员数" width="150">
            <template #default="{ row }">
              <el-progress
                :percentage="(row.current_member_count / row.max_member_count) * 100"
                :color="getProgressColor(row.current_member_count / row.max_member_count)"
              >
                <span>{{ row.current_member_count }} / {{ row.max_member_count }}</span>
              </el-progress>
            </template>
          </el-table-column>
          <el-table-column prop="availability_score" label="可用性评分" width="120">
            <template #default="{ row }">
              {{ (row.availability_score * 100).toFixed(0) }}%
            </template>
          </el-table-column>
          <el-table-column prop="assignment_count" label="分配次数" width="100" />
          <el-table-column prop="is_available" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.is_available ? 'success' : 'danger'">
                {{ row.is_available ? '可用' : '不可用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="unavailable_reason" label="不可用原因" min-width="150">
            <template #default="{ row }">
              {{ row.unavailable_reason || '-' }}
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <!-- 企微配置 -->
      <el-card v-if="ruleDetail && ruleDetail.wecom_join_way_id" class="mt-20">
        <template #header>
          <div class="flex-between">
            <span>企微加群配置</span>
            <el-tag type="success">已配置</el-tag>
          </div>
        </template>

        <el-descriptions :column="1" border>
          <el-descriptions-item label="配置ID">
            <el-text copyable>{{ ruleDetail.wecom_join_way_id }}</el-text>
          </el-descriptions-item>
          
          <el-descriptions-item label="加群链接">
            <div v-if="ruleDetail.join_link_url" class="link-item">
              <el-link
                :href="ruleDetail.join_link_url"
                target="_blank"
                type="primary"
              >
                {{ ruleDetail.join_link_url }}
              </el-link>
              <el-button size="small" @click="copyToClipboard(ruleDetail.join_link_url)">
                <el-icon><CopyDocument /></el-icon>
                复制链接
              </el-button>
            </div>
            <span v-else>-</span>
          </el-descriptions-item>

          <el-descriptions-item v-if="ruleDetail.rule_options && Object.keys(ruleDetail.rule_options).length > 0" label="扩展配置">
            <el-button size="small" @click="showRuleOptions = !showRuleOptions">
              <el-icon><View /></el-icon>
              {{ showRuleOptions ? '隐藏' : '查看' }}配置详情
            </el-button>
          </el-descriptions-item>
        </el-descriptions>

        <!-- 扩展配置详情 -->
        <el-collapse-transition>
          <div v-if="showRuleOptions && ruleDetail.rule_options" class="rule-options-detail">
            <el-divider content-position="left">配置详情（JSON）</el-divider>
            <pre class="json-display">{{ JSON.stringify(ruleDetail.rule_options, null, 2) }}</pre>
          </div>
        </el-collapse-transition>

        <el-alert
          title="使用说明"
          type="info"
          :closable="false"
          style="margin-top: 16px"
        >
          <p>• 用户访问加群链接后，会自动进入企业微信加群流程</p>
          <p>• 系统会根据配置的策略自动分配群组</p>
        </el-alert>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import { joinRulesAPI } from '@/api/join-rules'
import { groupsAPI } from '@/api/groups'
import { formatDateTime } from '@/utils/format'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const loading = ref(false)
const ruleDetail = ref<any>(null)
const poolStatus = ref<any[]>([])
const groupDetailsMap = ref<Map<string, any>>(new Map())
const showRuleOptions = ref(false)

const ruleId = computed(() => Number(route.params.id))
const canUpdate = computed(() => authStore.hasPermission('rules:update'))

onMounted(() => {
  loadDetail()
})

async function loadDetail() {
  loading.value = true
  try {
    const response: any = await joinRulesAPI.getDetail(ruleId.value)
    console.log('📝 规则详情响应:', response)
    
    // 后端直接返回对象（不包装）
    if (response.id) {
      ruleDetail.value = response
      poolStatus.value = response.pool_status || []
      console.log('✅ 规则详情加载成功，群池数量:', poolStatus.value.length)
      
      // 加载每个群的详细信息
      await loadGroupDetails()
    } else if (response.success && response.data) {
      // 包装格式
      ruleDetail.value = response.data
      poolStatus.value = response.data.pool_status || []
      console.log('✅ 规则详情加载成功（包装格式）')
      
      // 加载每个群的详细信息
      await loadGroupDetails()
    } else {
      console.error('❌ 无法识别的响应格式:', response)
      ElMessage.error('数据格式错误')
    }
  } catch (error) {
    console.error('❌ 加载规则详情失败:', error)
    ElMessage.error('加载规则详情失败')
  } finally {
    loading.value = false
  }
}

async function loadGroupDetails() {
  // 批量加载群的详细信息以获取真实的群名称和成员数
  for (const poolItem of poolStatus.value) {
    try {
      const groupResponse: any = await groupsAPI.getDetail(poolItem.group_chat_id)
      console.log(`群详情 ${poolItem.group_chat_id}:`, groupResponse)
      
      let groupDetail = null
      if (groupResponse.success && groupResponse.data) {
        groupDetail = groupResponse.data
      } else if (groupResponse.chat_id) {
        groupDetail = groupResponse
      }
      
      if (groupDetail) {
        groupDetailsMap.value.set(poolItem.group_chat_id, groupDetail)
        // 更新 pool_status 中的成员数（使用真实数据）
        poolItem.current_member_count = groupDetail.member_count || poolItem.current_member_count
        poolItem.max_member_count = groupDetail.max_members || poolItem.max_member_count
      }
    } catch (error) {
      console.error(`加载群 ${poolItem.group_chat_id} 详情失败:`, error)
    }
  }
  console.log('✅ 群详情加载完成')
}

async function loadPoolStatus() {
  try {
    // 重新加载规则详情和群详细信息
    await loadDetail()
    ElMessage.success('刷新成功')
  } catch (error) {
    console.error('刷新群池状态失败:', error)
    ElMessage.error('刷新失败')
  }
}

function handleEdit() {
  router.push(`/join-rules/${ruleId.value}/edit`)
}

function goBack() {
  router.back()
}

function getStrategyText(strategy: string | undefined): string {
  if (!strategy) return '-'
  const map: Record<string, string> = {
    round_robin: '轮询',
    random: '随机',
    load_balance: '负载均衡',
  }
  return map[strategy] || strategy
}

function getGroupName(chatId: string): string {
  const groupDetail = groupDetailsMap.value.get(chatId)
  return groupDetail?.name || chatId.slice(-12)
}

function getProgressColor(ratio: number): string {
  if (ratio >= 0.9) return '#F56C6C'
  if (ratio >= 0.7) return '#E6A23C'
  return '#67C23A'
}

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success('链接已复制到剪贴板')
  } catch (error) {
    console.error('复制失败:', error)
    ElMessage.error('复制失败，请手动复制')
  }
}
</script>

<style lang="scss" scoped>
.rule-detail-page {
  .page-title {
    font-weight: 600;
    font-size: 16px;
  }

  .link-item {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
  }

  .rule-options-detail {
    margin-top: 16px;
    
    .json-display {
      background: #f5f7fa;
      border: 1px solid #dcdfe6;
      border-radius: 4px;
      padding: 12px;
      font-size: 12px;
      line-height: 1.6;
      overflow-x: auto;
      color: #303133;
    }
  }
}
</style>

