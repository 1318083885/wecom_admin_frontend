<template>
  <div class="sync-page">
    <el-row :gutter="20">
      <!-- 快速同步 -->
      <el-col :span="24">
        <el-card>
          <template #header>
            <span class="card-title">数据同步</span>
          </template>

          <el-alert
            title="同步说明"
            type="info"
            :closable="false"
            style="margin-bottom: 20px"
          >
            <p>数据同步将从企业微信服务器拉取最新的群组和成员信息，建议在以下情况执行同步：</p>
            <ul>
              <li>新建群组后需要更新群组列表</li>
              <li>群组成员变动需要更新成员信息</li>
              <li>定期同步以保持数据最新</li>
            </ul>
          </el-alert>

          <el-row :gutter="20">
            <el-col :span="8">
              <el-card shadow="hover" class="sync-card">
                <div class="sync-item">
                  <el-icon :size="48" color="#409EFF">
                    <ChatDotSquare />
                  </el-icon>
                  <h3>同步群组信息</h3>
                  <p>更新所有群组的基本信息</p>
                  <el-button type="primary" :loading="syncing.groups" @click="handleSyncGroups">
                    {{ syncing.groups ? '同步中...' : '立即同步' }}
                  </el-button>
                </div>
              </el-card>
            </el-col>

            <el-col :span="8">
              <el-card shadow="hover" class="sync-card">
                <div class="sync-item">
                  <el-icon :size="48" color="#67C23A">
                    <User />
                  </el-icon>
                  <h3>同步群成员</h3>
                  <p>更新所有群组的成员列表</p>
                  <el-button type="success" :loading="syncing.members" @click="handleSyncMembers">
                    {{ syncing.members ? '同步中...' : '立即同步' }}
                  </el-button>
                </div>
              </el-card>
            </el-col>

            <el-col :span="8">
              <el-card shadow="hover" class="sync-card">
                <div class="sync-item">
                  <el-icon :size="48" color="#E6A23C">
                    <Refresh />
                  </el-icon>
                  <h3>全量同步</h3>
                  <p>同步所有数据（群组+成员）</p>
                  <el-button
                    type="warning"
                    :loading="syncing.all"
                    @click="handleSyncAll"
                  >
                    {{ syncing.all ? '同步中...' : '立即同步' }}
                  </el-button>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </el-card>
      </el-col>

      <!-- 同步历史 -->
      <el-col :span="24" style="margin-top: 20px">
        <el-card>
          <template #header>
            <div class="flex-between">
              <span class="card-title">同步历史</span>
              <el-button @click="loadHistory">
                <el-icon><Refresh /></el-icon>
                刷新
              </el-button>
            </div>
          </template>

          <el-table v-loading="historyLoading" :data="historyData" stripe>
            <el-table-column prop="type" label="同步类型" width="120">
              <template #default="{ row }">
                <el-tag :type="getSyncTypeTagType(row.type)">
                  {{ getSyncTypeText(row.type) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusTagType(row.status)">
                  {{ getStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="total_count" label="总数" width="100" />
            <el-table-column prop="success_count" label="成功" width="100" />
            <el-table-column prop="failed_count" label="失败" width="100" />
            <el-table-column prop="duration" label="耗时" width="120">
              <template #default="{ row }">
                {{ row.duration ? row.duration + 's' : '-' }}
              </template>
            </el-table-column>
            <el-table-column prop="started_at" label="开始时间" width="180">
              <template #default="{ row }">
                {{ formatDateTime(row.started_at) }}
              </template>
            </el-table-column>
            <el-table-column prop="error_message" label="错误信息" min-width="200" show-overflow-tooltip />
          </el-table>

          <div class="pagination">
            <el-pagination
              v-model:current-page="historyPagination.page"
              v-model:page-size="historyPagination.pageSize"
              :total="historyPagination.total"
              :page-sizes="[10, 20, 50]"
              layout="total, sizes, prev, pager, next"
              @current-change="loadHistory"
              @size-change="handleHistorySizeChange"
            />
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { formatDateTime } from '@/utils/format'
import { syncAPI } from '@/api/sync'

const syncing = reactive({
  groups: false,
  members: false,
  all: false,
})

const historyLoading = ref(false)
const historyData = ref<any[]>([])
const historyPagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0,
})

onMounted(() => {
  loadHistory()
})

async function handleSyncGroups() {
  try {
    await ElMessageBox.confirm('确定要同步所有群组信息吗？此操作可能需要较长时间。', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info',
    })

    syncing.groups = true
    console.log('🔄 开始同步群组信息...')
    
    const response = await syncAPI.syncAllGroups()
    
    if (response.success) {
      console.log('✅ 群组同步成功:', response.data)
      ElMessage.success(response.message || '群组信息同步成功')
      loadHistory()
    } else {
      console.error('❌ 群组同步失败:', response)
      ElMessage.error(response.message || '同步失败')
    }
  } catch (error: any) {
    console.error('❌ 群组同步异常:', error)
    if (error !== 'cancel') {
      ElMessage.error(error.message || '同步失败')
    }
  } finally {
    syncing.groups = false
  }
}

async function handleSyncMembers() {
  try {
    await ElMessageBox.confirm('确定要同步所有群成员信息吗？此操作可能需要较长时间。', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info',
    })

    syncing.members = true
    console.log('🔄 开始同步群成员信息...')
    
    const response = await syncAPI.syncAllMembers()
    
    if (response.success) {
      console.log('✅ 成员同步成功:', response.data)
      ElMessage.success(response.message || '群成员信息同步成功')
      loadHistory()
    } else {
      console.error('❌ 成员同步失败:', response)
      ElMessage.error(response.message || '同步失败')
    }
  } catch (error: any) {
    console.error('❌ 成员同步异常:', error)
    if (error !== 'cancel') {
      ElMessage.error(error.message || '同步失败')
    }
  } finally {
    syncing.members = false
  }
}

async function handleSyncAll() {
  try {
    await ElMessageBox.confirm(
      '全量同步将从企业微信完全同步所有群组和成员数据，耗时较长，确定要执行吗？',
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    syncing.all = true
    console.log('🔄 开始全量同步...')
    
    const response = await syncAPI.fullSync()
    
    if (response.success) {
      console.log('✅ 全量同步成功:', response.data)
      ElMessage.success(response.message || '全量同步成功')
      loadHistory()
    } else {
      console.error('❌ 全量同步失败:', response)
      ElMessage.error(response.message || '同步失败')
    }
  } catch (error: any) {
    console.error('❌ 全量同步异常:', error)
    if (error !== 'cancel') {
      ElMessage.error(error.message || '同步失败')
    }
  } finally {
    syncing.all = false
  }
}

function loadHistory() {
  historyLoading.value = true
  // 模拟数据
  setTimeout(() => {
    historyData.value = [
      {
        type: 'groups',
        status: 'success',
        total_count: 50,
        success_count: 50,
        failed_count: 0,
        duration: 15,
        started_at: new Date().toISOString(),
        error_message: null,
      },
      {
        type: 'members',
        status: 'success',
        total_count: 500,
        success_count: 495,
        failed_count: 5,
        duration: 45,
        started_at: new Date(Date.now() - 3600000).toISOString(),
        error_message: '部分成员信息同步失败',
      },
    ]
    historyPagination.total = 2
    historyLoading.value = false
  }, 500)
}

function handleHistorySizeChange() {
  historyPagination.page = 1
  loadHistory()
}

function getSyncTypeText(type: string): string {
  const map: Record<string, string> = {
    groups: '群组',
    members: '成员',
    all: '全量',
  }
  return map[type] || type
}

function getSyncTypeTagType(type: string): 'primary' | 'success' | 'warning' {
  const map: Record<string, 'primary' | 'success' | 'warning'> = {
    groups: 'primary',
    members: 'success',
    all: 'warning',
  }
  return map[type] || 'primary'
}

function getStatusText(status: string): string {
  const map: Record<string, string> = {
    success: '成功',
    failed: '失败',
    running: '进行中',
  }
  return map[status] || status
}

function getStatusTagType(status: string): 'success' | 'danger' | 'warning' {
  const map: Record<string, 'success' | 'danger' | 'warning'> = {
    success: 'success',
    failed: 'danger',
    running: 'warning',
  }
  return map[status] || 'warning'
}
</script>

<style lang="scss" scoped>
.sync-page {
  .card-title {
    font-weight: 600;
    font-size: 16px;
  }

  .sync-card {
    .sync-item {
      text-align: center;
      padding: 20px;

      h3 {
        margin: 15px 0 10px;
        font-size: 16px;
        color: #303133;
      }

      p {
        color: #909399;
        font-size: 14px;
        margin-bottom: 20px;
      }
    }
  }

  .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>

