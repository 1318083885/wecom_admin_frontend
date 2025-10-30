<template>
  <div class="group-detail-page">
    <el-page-header @back="goBack">
      <template #content>
        <span class="page-title">群组详情</span>
      </template>
    </el-page-header>

    <el-card v-loading="loading" class="mt-20">
      <template #header>
        <div class="flex-between">
          <span>基本信息</span>
          <el-button type="primary" @click="handleSync">
            <el-icon><Refresh /></el-icon>
            同步群信息
          </el-button>
        </div>
      </template>

      <el-descriptions :column="2" border>
        <el-descriptions-item label="群名称">{{ groupDetail?.name }}</el-descriptions-item>
        <el-descriptions-item label="群ID">{{ groupDetail?.chat_id }}</el-descriptions-item>
        <el-descriptions-item label="成员数">
          {{ groupDetail?.member_count }} / {{ groupDetail?.max_members }}
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(groupDetail?.status)">
            {{ getStatusText(groupDetail?.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="所属业务线">
          {{ groupDetail?.business_line_name || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="群主">{{ groupDetail?.owner_userid || '-' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">
          {{ formatDateTime(groupDetail?.created_at) }}
        </el-descriptions-item>
        <el-descriptions-item label="更新时间">
          {{ formatDateTime(groupDetail?.updated_at) }}
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-card class="mt-20">
      <template #header>
        <span>成员列表</span>
      </template>

      <el-table v-loading="membersLoading" :data="members" stripe>
        <el-table-column prop="nickname" label="昵称" min-width="150">
          <template #default="{ row }">
            {{ row.nickname || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="external_user_id" label="用户ID" min-width="200" show-overflow-tooltip />
        <el-table-column prop="user_type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="row.user_type === 1 ? 'success' : 'info'">
              {{ row.user_type === 1 ? '内部' : '外部' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'info'">
              {{ row.status === 'active' ? '在群' : '已退群' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="referrer" label="分销员" width="120">
          <template #default="{ row }">
            {{ row.referrer || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="join_time" label="加入时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.join_time) }}
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination mt-20">
        <el-pagination
          v-model:current-page="membersPagination.page"
          v-model:page-size="membersPagination.page_size"
          :total="membersPagination.total"
          :page-sizes="[20, 50, 100]"
          layout="total, sizes, prev, pager, next"
          @current-change="loadMembers"
          @size-change="handleMembersSizeChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { groupsAPI } from '@/api/groups'
import type { Group, GroupMember } from '@/types/business'
import { formatDateTime } from '@/utils/format'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const groupDetail = ref<Group>()
const chatId = route.params.chatId as string

const membersLoading = ref(false)
const members = ref<GroupMember[]>([])
const membersPagination = reactive({
  page: 1,
  page_size: 20,
  total: 0,
})

onMounted(() => {
  loadDetail()
  loadMembers()
})

async function loadDetail() {
  loading.value = true
  try {
    const response = await groupsAPI.getDetail(chatId)
    if (response.success && response.data) {
      groupDetail.value = response.data
    }
  } catch (error) {
    console.error('加载群组详情失败:', error)
    ElMessage.error('加载群组详情失败')
  } finally {
    loading.value = false
  }
}

async function loadMembers() {
  membersLoading.value = true
  try {
    const response = await groupsAPI.getMembers(chatId, {
      page: membersPagination.page,
      page_size: membersPagination.page_size,
    })
    if (response.success && response.data) {
      members.value = response.data.items
      membersPagination.total = response.data.total
    }
  } catch (error) {
    console.error('加载成员列表失败:', error)
  } finally {
    membersLoading.value = false
  }
}

async function handleSync() {
  try {
    await groupsAPI.sync(chatId)
    ElMessage.success('同步成功')
    loadDetail()
    loadMembers()
  } catch (error) {
    console.error('同步失败:', error)
  }
}

function handleMembersSizeChange() {
  membersPagination.page = 1
  loadMembers()
}

function goBack() {
  router.back()
}

function getStatusType(status: string | undefined): 'success' | 'warning' | 'info' {
  if (!status) return 'info'
  const map: Record<string, 'success' | 'warning' | 'info'> = {
    active: 'success',
    full: 'warning',
    inactive: 'info',
  }
  return map[status] || 'info'
}

function getStatusText(status: string | undefined): string {
  if (!status) return ''
  const map: Record<string, string> = {
    active: '活跃',
    full: '已满',
    inactive: '非活跃',
  }
  return map[status] || status
}
</script>

<style lang="scss" scoped>
.group-detail-page {
  .page-title {
    font-weight: 600;
    font-size: 16px;
  }

  .pagination {
    display: flex;
    justify-content: flex-end;
  }
}
</style>

