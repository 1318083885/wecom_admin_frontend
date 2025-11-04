<template>
  <div class="business-lines-page">
    <el-card>
      <template #header>
        <div class="flex-between">
          <span class="card-title">业务线管理</span>
          <el-button v-if="canCreate" type="primary" @click="handleCreate">
            <el-icon><Plus /></el-icon>
            创建业务线
          </el-button>
        </div>
      </template>

      <el-table v-loading="loading" :data="tableData" stripe class="responsive-table">
        <el-table-column prop="id" label="ID" width="80" class-name="mobile-hidden" />
        <el-table-column prop="name" label="业务线名称" min-width="150" />
        <el-table-column prop="state" label="标识" min-width="150" class-name="mobile-hidden" />
        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip class-name="mobile-hidden" />
        <el-table-column prop="is_active" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.is_active ? 'success' : 'info'" size="small">
              {{ row.is_active ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180" class-name="mobile-hidden">
          <template #default="{ row }">
            {{ formatDateTime(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" link @click="handleView(row)">
              查看
            </el-button>
            <el-button
              v-if="canUpdate"
              size="small"
              type="primary"
              link
              @click="handleEdit(row)"
            >
              编辑
            </el-button>
            <el-button
              v-if="canDelete"
              size="small"
              type="danger"
              link
              @click="handleDelete(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 创建/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="800px"
      destroy-on-close
      @close="handleDialogClose"
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-form-item label="业务线名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入业务线名称" clearable />
        </el-form-item>
        <el-form-item label="业务线标识" prop="state">
          <el-input 
            v-model="formData.state" 
            placeholder="选填，留空则自动生成，如：support_community" 
            clearable
            :disabled="dialogMode === 'edit'"
          />
          <div style="color: #909399; font-size: 12px; margin-top: 4px;">
            标识用于唯一识别业务线（可选，留空则后端自动生成），只能包含小写字母、数字、下划线和横线，长度3-50字符，创建后不可修改
          </div>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="4"
            placeholder="请输入业务线描述"
          />
        </el-form-item>
        <el-form-item label="状态" prop="is_active">
          <el-switch v-model="formData.is_active" active-text="启用" inactive-text="禁用" />
        </el-form-item>

        <!-- 编辑模式下显示群聊池管理 -->
        <template v-if="dialogMode === 'edit' && formData.id">
          <el-divider content-position="left">
            <span style="font-weight: bold">群聊池管理</span>
          </el-divider>
          
          <el-form-item label="当前群聊">
            <div class="group-pool-container">
              <el-button 
                type="primary" 
                size="small" 
                @click="handleManageGroups"
                style="margin-bottom: 12px"
              >
                <el-icon><Plus /></el-icon>
                添加群聊
              </el-button>
              
              <div v-loading="loadingGroups" style="min-height: 100px">
                <el-empty 
                  v-if="!loadingGroups && businessLineGroups.length === 0"
                  description="暂无群聊，请点击上方按钮添加"
                  :image-size="80"
                />
                <div v-else class="group-list">
                  <el-tag
                    v-for="group in businessLineGroups"
                    :key="group.chat_id"
                    closable
                    @close="handleRemoveGroup(group)"
                    style="margin: 0 8px 8px 0"
                    :type="getGroupStatusType(group.status)"
                  >
                    {{ group.name }} ({{ group.member_count }}/{{ group.max_members }})
                  </el-tag>
                </div>
              </div>
            </div>
          </el-form-item>
        </template>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 群聊选择对话框 -->
    <el-dialog
      v-model="groupSelectVisible"
      title="选择群聊"
      width="700px"
      destroy-on-close
    >
      <div style="margin-bottom: 16px">
        <el-input
          v-model="groupSearchKeyword"
          placeholder="搜索群聊名称"
          clearable
          @input="handleGroupSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>

      <div v-loading="loadingAvailableGroups" style="min-height: 200px">
        <el-checkbox-group v-model="selectedGroupIds">
          <div
            v-for="group in filteredAvailableGroups"
            :key="group.chat_id"
            class="group-select-item"
          >
            <el-checkbox :value="group.chat_id">
              <span style="font-weight: 500">{{ group.name }}</span>
              <el-tag 
                size="small" 
                :type="getGroupStatusType(group.status)"
                style="margin-left: 8px"
              >
                {{ getGroupStatusText(group.status) }}
              </el-tag>
              <span style="margin-left: 8px; color: #909399; font-size: 12px">
                成员：{{ group.member_count }}/{{ group.max_members }}
              </span>
            </el-checkbox>
          </div>
        </el-checkbox-group>
        
        <el-empty 
          v-if="!loadingAvailableGroups && filteredAvailableGroups.length === 0"
          description="没有可用的群聊"
        />
      </div>

      <template #footer>
        <el-button @click="groupSelectVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmAddGroups">
          确定添加 ({{ selectedGroupIds.length }})
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import { businessLinesAPI } from '@/api/business-lines'
import { groupsAPI } from '@/api/groups'
import type { BusinessLine, Group } from '@/types/business'
import { formatDateTime } from '@/utils/format'

const router = useRouter()

const authStore = useAuthStore()

const loading = ref(false)
const tableData = ref<BusinessLine[]>([])

const dialogVisible = ref(false)
const dialogMode = ref<'create' | 'edit'>('create')
const dialogTitle = computed(() => (dialogMode.value === 'create' ? '创建业务线' : '编辑业务线'))
const submitting = ref(false)

const formRef = ref<FormInstance>()
const formData = reactive<Partial<BusinessLine>>({
  name: '',
  state: '',
  description: '',
  is_active: true,
})

const formRules: FormRules = {
  name: [{ required: true, message: '请输入业务线名称', trigger: 'blur' }],
  state: [
    { 
      pattern: /^[a-z0-9_-]{3,50}$/, 
      message: '标识只能包含小写字母、数字、下划线和横线，长度3-50字符', 
      trigger: 'blur' 
    }
  ],
}

// 群聊池管理相关
const loadingGroups = ref(false)
const businessLineGroups = ref<Group[]>([])
const groupSelectVisible = ref(false)
const loadingAvailableGroups = ref(false)
const availableGroups = ref<Group[]>([])
const selectedGroupIds = ref<string[]>([])
const groupSearchKeyword = ref('')

// 过滤后的可用群聊
const filteredAvailableGroups = computed(() => {
  if (!groupSearchKeyword.value) return availableGroups.value
  const keyword = groupSearchKeyword.value.toLowerCase()
  return availableGroups.value.filter((group) =>
    group.name.toLowerCase().includes(keyword)
  )
})

// 权限控制
const canCreate = computed(() => authStore.hasPermission('business_lines:create'))
const canUpdate = computed(() => authStore.hasPermission('business_lines:update'))
const canDelete = computed(() => authStore.hasPermission('business_lines:delete'))

onMounted(() => {
  loadData()
})

async function loadData() {
  loading.value = true
  try {
    const response = await businessLinesAPI.getList()
    console.log('业务线列表响应:', response)
    
    if (response.success && response.data) {
      // 后端返回 {success: true, data: {items: [...], total: X}}
      const data: any = response.data
      if (data.items) {
        tableData.value = data.items
        console.log('✅ 加载了', data.items.length, '个业务线')
      } else if (Array.isArray(data)) {
        // 兼容直接返回数组的情况
        tableData.value = data
        console.log('✅ 加载了', data.length, '个业务线（数组格式）')
      }
    }
  } catch (error) {
    console.error('❌ 加载业务线列表失败:', error)
    ElMessage.error('加载业务线列表失败')
  } finally {
    loading.value = false
  }
}

function handleCreate() {
  dialogMode.value = 'create'
  resetForm()
  dialogVisible.value = true
}

function handleView(row: BusinessLine) {
  // 跳转到业务线下的群组列表
  router.push({
    path: '/groups',
    query: { business_line_id: row.id }
  })
}

function handleEdit(row: BusinessLine) {
  dialogMode.value = 'edit'
  Object.assign(formData, row)
  dialogVisible.value = true
  // 加载该业务线的群聊
  if (row.id) {
    loadBusinessLineGroups(row.id)
  }
}

async function handleDelete(row: BusinessLine) {
  try {
    await ElMessageBox.confirm(`确定要删除业务线"${row.name}"吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    await businessLinesAPI.delete(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
    }
  }
}

async function handleSubmit() {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    submitting.value = true
    try {
      if (dialogMode.value === 'create') {
        // 创建时，如果state为空，就不传这个字段（让后端自动生成）
        const submitData: any = {
          name: formData.name,
          description: formData.description,
          is_active: formData.is_active,
        }
        // 只有当state有值时才传递
        if (formData.state && formData.state.trim()) {
          submitData.state = formData.state.trim()
        }
        await businessLinesAPI.create(submitData)
        ElMessage.success('创建成功')
      } else {
        await businessLinesAPI.update(formData.id!, formData)
        ElMessage.success('更新成功')
      }
      dialogVisible.value = false
      loadData()
    } catch (error) {
      console.error('提交失败:', error)
    } finally {
      submitting.value = false
    }
  })
}

function handleDialogClose() {
  resetForm()
}

function resetForm() {
  formData.id = undefined
  formData.name = ''
  formData.state = ''
  formData.description = ''
  formData.is_active = true
  businessLineGroups.value = []
  formRef.value?.resetFields()
}

// 加载业务线的群聊
async function loadBusinessLineGroups(businessLineId: number) {
  loadingGroups.value = true
  try {
    const response = await groupsAPI.getList({
      business_line_id: businessLineId,
      page: 1,
      page_size: 100,
    })
    if (response.success && response.data) {
      businessLineGroups.value = response.data.items || []
      console.log(`✅ 加载了 ${businessLineGroups.value.length} 个群聊`)
    }
  } catch (error) {
    console.error('加载群聊失败:', error)
    ElMessage.error('加载群聊失败')
  } finally {
    loadingGroups.value = false
  }
}

// 打开群聊选择对话框
async function handleManageGroups() {
  groupSelectVisible.value = true
  selectedGroupIds.value = []
  groupSearchKeyword.value = ''
  await loadAvailableGroups()
}

// 加载可用的群聊（只显示未分配的群聊，排除已在当前业务线的群聊）
async function loadAvailableGroups() {
  loadingAvailableGroups.value = true
  try {
    const response = await groupsAPI.getList({
      page: 1,
      page_size: 200,
    })
    if (response.success && response.data) {
      const allGroups = response.data.items || []
      
      // 获取已在当前业务线的群聊ID列表
      const currentGroupIds = new Set(businessLineGroups.value.map(g => g.chat_id))
      
      // 只显示：1. 未分配的群聊，2. 且不在当前业务线中的
      availableGroups.value = allGroups.filter(
        (group) => !group.business_line_id && !currentGroupIds.has(group.chat_id)
      )
      
      console.log(`✅ 加载了 ${availableGroups.value.length} 个可用群聊（未分配）`)
      console.log(`📊 总群聊: ${allGroups.length}, 当前业务线已有: ${currentGroupIds.size}, 可添加: ${availableGroups.value.length}`)
    }
  } catch (error) {
    console.error('加载可用群聊失败:', error)
    ElMessage.error('加载可用群聊失败')
  } finally {
    loadingAvailableGroups.value = false
  }
}

// 群聊搜索
function handleGroupSearch() {
  // filteredAvailableGroups 计算属性会自动更新
}

// 确认添加群聊
async function handleConfirmAddGroups() {
  if (selectedGroupIds.value.length === 0) {
    ElMessage.warning('请至少选择一个群聊')
    return
  }

  try {
    const businessLineId = formData.id
    if (!businessLineId) return

    // 批量更新群聊的 business_line_id
    const promises = selectedGroupIds.value.map((chatId) =>
      groupsAPI.update(chatId, { business_line_id: businessLineId })
    )

    await Promise.all(promises)
    ElMessage.success(`成功添加 ${selectedGroupIds.value.length} 个群聊`)
    groupSelectVisible.value = false
    await loadBusinessLineGroups(businessLineId)
  } catch (error) {
    console.error('添加群聊失败:', error)
    ElMessage.error('添加群聊失败')
  }
}

// 移除群聊
async function handleRemoveGroup(group: Group) {
  try {
    await ElMessageBox.confirm(
      `确定要将群聊"${group.name}"从当前业务线移除吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    console.log('🗑️ 移除群聊:', group.chat_id, '从业务线:', formData.id)
    
    // 调用更新群聊API，将 business_line_id 设置为 null
    await groupsAPI.update(group.chat_id, { business_line_id: null })
    ElMessage.success('移除成功')
    
    // 重新加载群聊列表
    if (formData.id) {
      await loadBusinessLineGroups(formData.id)
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('❌ 移除群聊失败:', error)
      const errorMsg = error.response?.data?.detail || error.response?.data?.message || '移除群聊失败'
      ElMessage.error(errorMsg)
    }
  }
}

// 群聊状态类型
function getGroupStatusType(status: string): 'success' | 'warning' | 'danger' | 'info' {
  const statusMap: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
    active: 'success',
    full: 'warning',
    inactive: 'info',
  }
  return statusMap[status] || 'info'
}

// 群聊状态文本
function getGroupStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    active: '正常',
    full: '已满',
    inactive: '不可用',
  }
  return statusMap[status] || status
}
</script>

<style lang="scss" scoped>
.business-lines-page {
  .card-title {
    font-weight: 600;
    font-size: 16px;
  }

  .group-pool-container {
    width: 100%;
  }

  .group-list {
    display: flex;
    flex-wrap: wrap;
  }

  .group-select-item {
    padding: 12px;
    border-bottom: 1px solid #ebeef5;
    
    &:last-child {
      border-bottom: none;
    }

    :deep(.el-checkbox) {
      width: 100%;
      
      .el-checkbox__label {
        width: 100%;
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

