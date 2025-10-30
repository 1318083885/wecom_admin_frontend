<template>
  <div class="join-rules-page">
    <el-card>
      <template #header>
        <div class="flex-between">
          <span class="card-title">加群规则</span>
          <el-button v-if="canCreate" type="primary" @click="handleCreate">
            <el-icon><Plus /></el-icon>
            创建规则
          </el-button>
        </div>
      </template>

      <el-table v-loading="loading" :data="tableData" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="规则名称" min-width="180" />
        <el-table-column prop="selection_strategy" label="选择策略" width="120">
          <template #default="{ row }">
            {{ getStrategyText(row.selection_strategy) }}
          </template>
        </el-table-column>
        <el-table-column prop="groups_per_assignment" label="每次分配群数" width="120" />
        <el-table-column prop="is_active" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.is_active ? 'success' : 'info'">
              {{ row.is_active ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="success_rate" label="成功率" width="100">
          <template #default="{ row }">
            {{ row.success_rate ? row.success_rate.toFixed(1) + '%' : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="total_assignments" label="分配次数" width="100" />
        <el-table-column prop="created_at" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="info" link @click="handleView(row)">
              <el-icon><View /></el-icon>
              查看
            </el-button>
            <el-button v-if="canUpdate" size="small" type="primary" link @click="handleEdit(row)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button
              v-if="canDelete"
              size="small"
              type="danger"
              link
              @click="handleDelete(row)"
            >
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.page_size"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @current-change="loadData"
          @size-change="handleSizeChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import { joinRulesAPI } from '@/api/join-rules'
import type { JoinRule } from '@/types/business'
import { formatDateTime } from '@/utils/format'

const router = useRouter()
const authStore = useAuthStore()

const loading = ref(false)
const tableData = ref<JoinRule[]>([])

const pagination = reactive({
  page: 1,
  page_size: 20,
  total: 0,
})

const canCreate = computed(() => authStore.hasPermission('rules:create'))
const canUpdate = computed(() => authStore.hasPermission('rules:update'))
const canDelete = computed(() => authStore.hasPermission('rules:delete'))

onMounted(() => {
  loadData()
})

async function loadData() {
  loading.value = true
  try {
    const response = await joinRulesAPI.getList({
      page: pagination.page,
      page_size: pagination.page_size,
    })
    console.log('规则列表响应:', response)
    
    if (response.success && response.data) {
      // 后端返回 {success: true, data: {items: [...], total: X}}
      if (response.data.items) {
        tableData.value = response.data.items
        pagination.total = response.data.total || response.data.items.length
        console.log('✅ 加载了', response.data.items.length, '个规则')
      } else if (Array.isArray(response.data)) {
        // 兼容直接返回数组
        tableData.value = response.data
        pagination.total = response.data.length
        console.log('✅ 加载了', response.data.length, '个规则（数组格式）')
      }
    }
  } catch (error) {
    console.error('❌ 加载规则列表失败:', error)
    ElMessage.error('加载规则列表失败')
  } finally {
    loading.value = false
  }
}

function handleSizeChange() {
  pagination.page = 1
  loadData()
}

function handleCreate() {
  router.push('/join-rules/create')
}

function handleView(row: JoinRule) {
  router.push(`/join-rules/${row.id}`)
}

function handleEdit(row: JoinRule) {
  router.push(`/join-rules/${row.id}/edit`)
}

async function handleDelete(row: JoinRule) {
  try {
    await ElMessageBox.confirm(`确定要删除规则"${row.name}"吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    await joinRulesAPI.delete(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
    }
  }
}

function getStrategyText(strategy: string): string {
  const map: Record<string, string> = {
    round_robin: '轮询',
    random: '随机',
    load_balance: '负载均衡',
  }
  return map[strategy] || strategy
}
</script>

<style lang="scss" scoped>
.join-rules-page {
  .card-title {
    font-weight: 600;
    font-size: 16px;
  }

  .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>

