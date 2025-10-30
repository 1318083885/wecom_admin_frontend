<template>
  <div class="groups-page">
    <el-card>
      <template #header>
        <div class="card-title">群组管理</div>
      </template>

      <!-- 搜索表单 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="业务线">
          <el-select
            v-model="searchForm.business_line_id"
            placeholder="请选择业务线"
            clearable
            class="responsive-select"
          >
            <el-option
              v-for="item in businessLines"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="searchForm.status"
            placeholder="请选择状态"
            clearable
            class="responsive-select"
          >
            <el-option label="活跃" value="active" />
            <el-option label="已满" value="full" />
            <el-option label="非活跃" value="inactive" />
          </el-select>
        </el-form-item>
        <el-form-item label="搜索">
          <el-input
            v-model="searchForm.search"
            placeholder="群名称"
            clearable
            class="responsive-input"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            <span class="desktop-only">查询</span>
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            <span class="desktop-only">重置</span>
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 批量操作 -->
      <div v-if="selectedGroups.length > 0" class="batch-actions">
        <el-alert type="info" :closable="false" style="margin-bottom: 15px">
          <template #default>
            <span>已选择 <strong>{{ selectedGroups.length }}</strong> 个群聊</span>
            <el-button size="small" type="primary" style="margin-left: 15px" @click="handleBatchEdit">
              批量编辑状态
            </el-button>
            <el-button size="small" @click="handleClearSelection">取消选择</el-button>
          </template>
        </el-alert>
      </div>

      <!-- 数据表格 -->
      <el-table 
        ref="tableRef"
        v-loading="loading" 
        :data="tableData" 
        stripe 
        class="responsive-table"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="name" label="群名称" min-width="200" show-overflow-tooltip />
        <el-table-column prop="chat_id" label="群ID" width="180" show-overflow-tooltip class-name="mobile-hidden" />
        <el-table-column prop="member_count" label="成员数" width="120">
          <template #default="{ row }">
            {{ row.member_count }} / {{ row.max_members }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="business_line_name" label="所属业务线" width="150" class-name="mobile-hidden" />
        <el-table-column prop="created_at" label="创建时间" width="180" class-name="mobile-hidden">
          <template #default="{ row }">
            {{ formatDateTime(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" link @click="handleView(row)">
              查看
            </el-button>
            <el-button size="small" type="warning" link @click="handleEditStatus(row)">
              编辑
            </el-button>
            <el-button size="small" type="success" link @click="handleSync(row)">
              同步
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
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

    <!-- 批量编辑对话框 -->
    <el-dialog
      v-model="batchEditDialogVisible"
      title="批量编辑群聊状态"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-alert type="warning" :closable="false" style="margin-bottom: 15px">
        <template #default>
          将批量更新 <strong>{{ selectedGroups.length }}</strong> 个群聊的状态
        </template>
      </el-alert>
      
      <el-form :model="batchEditForm" label-width="100px">
        <el-form-item label="新状态">
          <el-select v-model="batchEditForm.status" placeholder="请选择状态">
            <el-option label="活跃" value="active" />
            <el-option label="非活跃" value="inactive" />
            <el-option label="已归档" value="archived" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="batchEditForm.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注（可选，将应用到所有选中的群）"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="batchEditDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="batchSubmitting" @click="handleSubmitBatchEdit">
          确定更新
        </el-button>
      </template>
    </el-dialog>

    <!-- 编辑群聊状态对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      title="编辑群聊"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form :model="editForm" label-width="100px">
        <el-form-item label="群名称">
          <el-input :value="currentGroup?.name" disabled />
        </el-form-item>
        <el-form-item label="群ID">
          <el-input :value="currentGroup?.chat_id" disabled />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="editForm.status" placeholder="请选择状态">
            <el-option label="活跃" value="active" />
            <el-option label="非活跃" value="inactive" />
            <el-option label="已归档" value="archived" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="editForm.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注（可选）"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmitEdit">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { groupsAPI } from '@/api/groups'
import { businessLinesAPI } from '@/api/business-lines'
import type { Group, BusinessLine } from '@/types/business'
import { formatDateTime } from '@/utils/format'

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const tableData = ref<Group[]>([])
const businessLines = ref<BusinessLine[]>([])

const searchForm = reactive({
  business_line_id: undefined as number | undefined,
  status: '',
  search: '',
})

const pagination = reactive({
  page: 1,
  page_size: 20,
  total: 0,
})

// 编辑状态相关
const editDialogVisible = ref(false)
const submitting = ref(false)
const currentGroup = ref<Group | null>(null)
const editForm = reactive({
  status: 'active' as 'active' | 'inactive' | 'archived',
  remark: '',
})

// 批量操作相关
const tableRef = ref()
const selectedGroups = ref<Group[]>([])
const batchEditDialogVisible = ref(false)
const batchSubmitting = ref(false)
const batchEditForm = reactive({
  status: 'active' as 'active' | 'inactive' | 'archived',
  remark: '',
})

onMounted(() => {
  // 检查URL参数，如果有business_line_id则预设筛选
  const queryBusinessLineId = route.query.business_line_id
  if (queryBusinessLineId) {
    searchForm.business_line_id = Number(queryBusinessLineId)
  }
  
  loadBusinessLines()
  loadData()
})

async function loadBusinessLines() {
  try {
    const response = await businessLinesAPI.getList()
    if (response.success && response.data) {
      // 从 data.items 或直接从 data 获取
      businessLines.value = response.data.items || response.data
    }
  } catch (error) {
    console.error('加载业务线列表失败:', error)
  }
}

async function loadData() {
  loading.value = true
  try {
    const response = await groupsAPI.getList({
      page: pagination.page,
      page_size: pagination.page_size,
      ...searchForm,
    })
    console.log('👥 群组列表响应:', response)
    
    if (response.success && response.data) {
      // 后端返回 {success: true, data: {items: [...], total: X}}
      if (response.data.items) {
        tableData.value = response.data.items
        pagination.total = response.data.total || response.data.items.length
        console.log('✅ 加载了', response.data.items.length, '个群组')
      } else if (Array.isArray(response.data)) {
        // 兼容直接返回数组
        tableData.value = response.data
        pagination.total = response.data.length
        console.log('✅ 加载了', response.data.length, '个群组（数组格式）')
      }
    }
  } catch (error) {
    console.error('❌ 加载群组列表失败:', error)
    ElMessage.error('加载群组列表失败')
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  pagination.page = 1
  loadData()
}

function handleReset() {
  searchForm.business_line_id = undefined
  searchForm.status = ''
  searchForm.search = ''
  handleSearch()
}

function handleSizeChange() {
  pagination.page = 1
  loadData()
}

function handleView(row: Group) {
  router.push(`/groups/${row.chat_id}`)
}

async function handleSync(row: Group) {
  try {
    await groupsAPI.sync(row.chat_id)
    ElMessage.success('同步成功')
    loadData()
  } catch (error) {
    console.error('同步失败:', error)
  }
}

function handleEditStatus(row: Group) {
  currentGroup.value = row
  editForm.status = (row.status || 'active') as 'active' | 'inactive' | 'archived'
  editForm.remark = ''
  editDialogVisible.value = true
}

async function handleSubmitEdit() {
  if (!currentGroup.value) return

  try {
    submitting.value = true
    console.log('🔄 更新群聊状态:', {
      chatId: currentGroup.value.chat_id,
      status: editForm.status,
      remark: editForm.remark
    })

    const updateData: any = {
      status: editForm.status
    }
    
    if (editForm.remark) {
      updateData.remark = editForm.remark
    }

    const response = await groupsAPI.update(currentGroup.value.chat_id, updateData)

    if (response.success) {
      console.log('✅ 更新成功:', response.data)
      ElMessage.success('更新成功')
      editDialogVisible.value = false
      loadData() // 重新加载列表
    } else {
      console.error('❌ 更新失败:', response)
      ElMessage.error(response.message || '更新失败')
    }
  } catch (error: any) {
    console.error('❌ 更新异常:', error)
    ElMessage.error(error.message || '更新失败')
  } finally {
    submitting.value = false
  }
}

// 批量操作相关函数
function handleSelectionChange(selection: Group[]) {
  selectedGroups.value = selection
}

function handleClearSelection() {
  tableRef.value?.clearSelection()
}

function handleBatchEdit() {
  if (selectedGroups.value.length === 0) {
    ElMessage.warning('请先选择要编辑的群聊')
    return
  }
  
  batchEditForm.status = 'active'
  batchEditForm.remark = ''
  batchEditDialogVisible.value = true
}

async function handleSubmitBatchEdit() {
  if (selectedGroups.value.length === 0) return

  try {
    batchSubmitting.value = true
    console.log('🔄 批量更新群聊状态:', {
      count: selectedGroups.value.length,
      status: batchEditForm.status,
      remark: batchEditForm.remark
    })

    const updateData: any = {
      status: batchEditForm.status
    }
    
    if (batchEditForm.remark) {
      updateData.remark = batchEditForm.remark
    }

    let successCount = 0
    let failCount = 0

    // 批量更新（串行执行，避免并发过高）
    for (const group of selectedGroups.value) {
      try {
        const response = await groupsAPI.update(group.chat_id, updateData)
        if (response.success) {
          successCount++
        } else {
          failCount++
          console.error(`❌ 更新群 ${group.name} 失败:`, response)
        }
      } catch (error) {
        failCount++
        console.error(`❌ 更新群 ${group.name} 异常:`, error)
      }
    }

    console.log(`✅ 批量更新完成: 成功 ${successCount}，失败 ${failCount}`)

    if (successCount > 0) {
      ElMessage.success(`批量更新完成：成功 ${successCount} 个，失败 ${failCount} 个`)
      batchEditDialogVisible.value = false
      handleClearSelection() // 清除选择
      loadData() // 重新加载列表
    } else {
      ElMessage.error('批量更新失败')
    }
  } catch (error: any) {
    console.error('❌ 批量更新异常:', error)
    ElMessage.error(error.message || '批量更新失败')
  } finally {
    batchSubmitting.value = false
  }
}

function getStatusType(status: string): 'success' | 'warning' | 'info' | 'danger' {
  const map: Record<string, 'success' | 'warning' | 'info' | 'danger'> = {
    active: 'success',
    full: 'warning',
    inactive: 'info',
    archived: 'danger',
  }
  return map[status] || 'info'
}

function getStatusText(status: string): string {
  const map: Record<string, string> = {
    active: '活跃',
    full: '已满',
    inactive: '非活跃',
    archived: '已归档',
  }
  return map[status] || status
}
</script>

<style lang="scss" scoped>
.groups-page {
  .card-title {
    font-weight: 600;
    font-size: 16px;
  }

  .batch-actions {
    margin-bottom: 15px;
  }

  .search-form {
    margin-bottom: 20px;
    
    // 移动端表单项堆叠显示
    @media (max-width: 768px) {
      :deep(.el-form-item) {
        margin-right: 0;
        margin-bottom: 10px;
        display: block;
        
        .el-form-item__content {
          margin-left: 0 !important;
        }
      }
    }
    
    .responsive-select,
    .responsive-input {
      width: 200px;
      
      @media (max-width: 768px) {
        width: 100%;
      }
    }
    
    .desktop-only {
      @media (max-width: 480px) {
        display: none;
      }
    }
  }

  .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: center;
    
    @media (min-width: 768px) {
      justify-content: flex-end;
    }
    
    // 移动端简化分页
    :deep(.el-pagination) {
      @media (max-width: 768px) {
        .el-pagination__sizes,
        .el-pagination__jump {
          display: none;
        }
      }
    }
  }
  
  // 响应式表格
  :deep(.responsive-table) {
    @media (max-width: 768px) {
      font-size: 12px;
      
      .mobile-hidden {
        display: none;
      }
      
      .el-button {
        padding: 4px 8px;
        font-size: 12px;
      }
    }
  }
}
</style>

