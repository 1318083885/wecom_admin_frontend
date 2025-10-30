<template>
  <div class="referrers-page">
    <el-card>
      <template #header>
        <div class="flex-between">
          <span class="card-title">分销员管理</span>
          <div>
            <el-button v-if="isSuperAdmin" type="success" @click="handleViewUnbound">
              <el-icon><User /></el-icon>
              账号绑定（未绑定：{{ unboundCount }}）
            </el-button>
            <el-button v-if="canCreate" type="primary" @click="handleCreate" style="margin-left: 10px">
              <el-icon><Plus /></el-icon>
              创建分销员
            </el-button>
          </div>
        </div>
      </template>

      <!-- 搜索表单 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="分销员编号">
          <el-input
            v-model="searchForm.referrer"
            placeholder="输入编号搜索"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="业务线">
          <el-select
            v-model="searchForm.business_line_id"
            placeholder="请选择业务线"
            clearable
            style="width: 200px"
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
            v-model="searchForm.is_active"
            placeholder="全部"
            clearable
            style="width: 120px"
          >
            <el-option label="启用" :value="true" />
            <el-option label="禁用" :value="false" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            查询
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 提示信息 -->
      <el-alert
        type="info"
        :closable="false"
        style="margin-bottom: 15px"
      >
        <template #default>
          💡 <strong>排序提示：</strong>当前为前端排序，仅对当前页面显示的数据进行排序
        </template>
      </el-alert>

      <!-- 数据表格 -->
      <el-table
        v-loading="loading"
        :data="tableData"
        stripe
        :default-sort="{ prop: 'referrer', order: 'ascending' }"
        @sort-change="handleSortChange"
      >
        <el-table-column prop="referrer" label="分销员编号" width="140" sortable="custom">
          <template #default="{ row }">
            <el-tag size="small">{{ row.referrer }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="display_name" label="显示名称" width="150" sortable="custom" />
        <el-table-column prop="business_line_id" label="业务线" width="150">
          <template #default="{ row }">
            {{ getBusinessLineName(row.business_line_id) }}
          </template>
        </el-table-column>
        <el-table-column prop="total_scans" label="总扫码数" width="120" sortable="custom" />
        <el-table-column prop="total_conversions" label="总转化数" width="120" sortable="custom" />
        <el-table-column prop="conversion_rate" label="转化率" width="120" sortable="custom">
          <template #default="{ row }">
            {{ (row.conversion_rate * 100).toFixed(1) }}%
          </template>
        </el-table-column>
        <el-table-column prop="priority" label="优先级" width="100" sortable="custom" />
        <el-table-column prop="is_active" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.is_active ? 'success' : 'info'">
              {{ row.is_active ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180" sortable="custom">
          <template #default="{ row }">
            {{ formatDateTime(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" link @click="handleView(row)">
              <el-icon><View /></el-icon>
              详情
            </el-button>
            <el-button
              v-if="canUpdate"
              size="small"
              type="success"
              link
              @click="handleEdit(row)"
            >
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button
              v-if="canUpdate"
              size="small"
              :type="row.is_active ? 'warning' : 'success'"
              link
              @click="handleToggleStatus(row)"
            >
              <el-icon v-if="row.is_active"><Hide /></el-icon>
              <el-icon v-else><View /></el-icon>
              {{ row.is_active ? '禁用' : '启用' }}
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

    <!-- 创建/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      destroy-on-close
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="显示名称" prop="display_name">
          <el-input
            v-model="formData.display_name"
            placeholder="请输入显示名称，如：张三"
          />
        </el-form-item>
        <el-form-item label="业务线" prop="business_line_id">
          <el-select
            v-model="formData.business_line_id"
            placeholder="请选择业务线"
            style="width: 100%"
          >
            <el-option
              v-for="item in businessLines"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="优先级" prop="priority">
          <el-input-number
            v-model="formData.priority"
            :min="1"
            :max="1000"
            placeholder="数字越小优先级越高"
          />
          <span style="margin-left: 10px; color: #909399; font-size: 12px">
            数字越小优先级越高
          </span>
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="formData.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>
        <el-alert
          v-if="!isEdit"
          title="提示：分销员编号将由系统自动生成（如 R000001），创建后不可修改"
          type="info"
          :closable="false"
          style="margin-top: 10px"
        />
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">
          {{ isEdit ? '更新' : '创建' }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 🆕 未绑定账号列表对话框 -->
    <el-dialog
      v-model="unboundDialogVisible"
      title="未绑定账号的分销员"
      width="900px"
    >
      <el-alert type="info" :closable="false" style="margin-bottom: 15px">
        <template #default>
          共 <strong>{{ unboundCount }}</strong> 个分销员未绑定账号，点击"创建账号"可快速为分销员创建登录账号
        </template>
      </el-alert>

      <el-table v-loading="unboundLoading" :data="unboundReferrers" stripe>
        <el-table-column prop="referrer" label="分销员编号" width="120">
          <template #default="{ row }">
            <el-tag>{{ row.referrer }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="display_name" label="显示名称" width="150" />
        <el-table-column prop="total_scans" label="总点击数" width="100" />
        <el-table-column prop="total_conversions" label="总转化数" width="100" />
        <el-table-column prop="account_status" label="账号状态" width="120">
          <template #default="{ row }">
            <el-tag type="warning">{{ row.account_status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button
              v-if="row.can_create_account"
              size="small"
              type="primary"
              @click="handleCreateAccount(row)"
            >
              创建账号
            </el-button>
            <span v-else class="text-muted">已绑定</span>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import { referrersAPI, type UnboundReferrer } from '@/api/referrers'
import { adminUsersAPI } from '@/api/admin-users'
import { businessLinesAPI } from '@/api/business-lines'
import type { ReferrerConfig, BusinessLine } from '@/types/business'
import { formatDateTime } from '@/utils/format'

const router = useRouter()
const authStore = useAuthStore()

// 🆕 账号绑定相关
const unboundCount = ref(0)
const unboundDialogVisible = ref(false)
const unboundLoading = ref(false)
const unboundReferrers = ref<UnboundReferrer[]>([])
const isSuperAdmin = computed(() => authStore.isSuperAdmin)

const loading = ref(false)
const tableData = ref<ReferrerConfig[]>([])
const businessLines = ref<BusinessLine[]>([])

const searchForm = reactive({
  referrer: '',
  business_line_id: undefined as number | undefined,
  is_active: undefined as boolean | undefined,
})

const pagination = reactive({
  page: 1,
  page_size: 20,
  total: 0,
})

// 排序状态
const sortParams = reactive({
  order_by: 'referrer' as string,
  order_direction: 'asc' as 'asc' | 'desc',
})

const dialogVisible = ref(false)
const submitting = ref(false)
const isEdit = ref(false)
const currentId = ref(0)
const formRef = ref<FormInstance>()
const formData = reactive<{
  display_name: string
  business_line_id: number
  priority: number
  remark: string
}>({
  display_name: '',
  business_line_id: 0,
  priority: 100,
  remark: '',
})

const formRules: FormRules = {
  display_name: [{ required: true, message: '请输入显示名称', trigger: 'blur' }],
  business_line_id: [{ required: true, message: '请选择业务线', trigger: 'change' }],
}

const canCreate = computed(() => authStore.hasPermission('referrers:create'))
const canUpdate = computed(() => authStore.hasPermission('referrers:update'))

const dialogTitle = computed(() => (isEdit.value ? '编辑分销员' : '创建分销员'))

onMounted(() => {
  loadBusinessLines()
  loadData()
  
  // 🆕 如果是超管，加载未绑定数量
  if (authStore.isSuperAdmin) {
    loadUnboundCount()
  }
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

async function loadData() {
  loading.value = true
  try {
    // ⚠️ 后端API不支持排序参数，只传搜索和分页参数
    const response = await referrersAPI.getList({
      page: pagination.page,
      page_size: pagination.page_size,
      ...searchForm,
      // 🚫 不传排序参数（后端不支持）
    })
    console.log('📊 分销员列表API响应:', response)
    if (response.success && response.data) {
      // 前端本地排序
      let items = response.data.items
      if (sortParams.order_by) {
        items = [...items].sort((a: any, b: any) => {
          const field = sortParams.order_by
          let aVal = a[field]
          let bVal = b[field]
          
          // 处理字符串比较
          if (typeof aVal === 'string') aVal = aVal.toLowerCase()
          if (typeof bVal === 'string') bVal = bVal.toLowerCase()
          
          if (aVal < bVal) return sortParams.order_direction === 'asc' ? -1 : 1
          if (aVal > bVal) return sortParams.order_direction === 'asc' ? 1 : -1
          return 0
        })
      }
      
      tableData.value = items
      pagination.total = response.data.total
      console.log('📊 分销员数据（已排序）:', tableData.value)
    }
  } catch (error) {
    console.error('❌ 加载分销员列表失败:', error)
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

function getBusinessLineName(id: number): string {
  const line = businessLines.value.find((item) => item.id === id)
  return line?.name || `业务线${id}`
}

function handleSearch() {
  pagination.page = 1
  loadData()
}

function handleReset() {
  searchForm.referrer = ''
  searchForm.business_line_id = undefined
  searchForm.is_active = undefined
  handleSearch()
}

function handleSizeChange() {
  pagination.page = 1
  loadData()
}

// 排序处理（前端排序）
function handleSortChange({ prop, order }: { prop: string; order: string | null }) {
  console.log('🔄 前端排序变化:', { prop, order })
  if (order === null) {
    // 取消排序，恢复默认
    sortParams.order_by = ''
    sortParams.order_direction = 'asc'
  } else {
    sortParams.order_by = prop
    sortParams.order_direction = order === 'ascending' ? 'asc' : 'desc'
  }
  // ⚠️ 前端排序：只对当前页数据排序，不换页
  loadData()
}

function handleCreate() {
  isEdit.value = false
  formData.display_name = ''
  formData.business_line_id = 0
  formData.priority = 100
  formData.remark = ''
  dialogVisible.value = true
}

function handleView(row: ReferrerConfig) {
  router.push(`/referrers/${row.id}`)
}

function handleEdit(row: ReferrerConfig) {
  isEdit.value = true
  currentId.value = row.id
  formData.display_name = row.display_name
  formData.business_line_id = row.business_line_id
  formData.priority = row.priority
  formData.remark = row.remark || ''
  dialogVisible.value = true
}

async function handleSubmit() {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    submitting.value = true
    try {
      if (isEdit.value) {
        await referrersAPI.update(currentId.value, formData)
        ElMessage.success('更新成功')
      } else {
        const response = await referrersAPI.create(formData)
        ElMessage.success(
          `创建成功！分销员编号：${response.data.referrer}`
        )
      }
      dialogVisible.value = false
      loadData()
    } catch (error) {
      console.error('操作失败:', error)
    } finally {
      submitting.value = false
    }
  })
}

async function handleToggleStatus(row: ReferrerConfig) {
  try {
    await ElMessageBox.confirm(
      `确定要${row.is_active ? '禁用' : '启用'}分销员"${row.display_name}"吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    await referrersAPI.update(row.id, { is_active: !row.is_active })
    ElMessage.success('操作成功')
    loadData()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('操作失败:', error)
    }
  }
}

// 🆕 账号绑定相关函数
async function loadUnboundCount() {
  try {
    const response = await referrersAPI.getUnboundList({ limit: 1 })
    if (response.success && response.data) {
      unboundCount.value = response.data.total_unbound || 0
    }
  } catch (error) {
    console.error('加载未绑定数量失败:', error)
  }
}

async function handleViewUnbound() {
  unboundDialogVisible.value = true
  unboundLoading.value = true
  
  try {
    const response = await referrersAPI.getUnboundList({
      is_active: true,
      limit: 100,
    })
    
    if (response.success && response.data) {
      unboundReferrers.value = response.data.items
      unboundCount.value = response.data.total_unbound
    }
  } catch (error) {
    console.error('加载未绑定列表失败:', error)
    ElMessage.error('加载未绑定列表失败')
  } finally {
    unboundLoading.value = false
  }
}

async function handleCreateAccount(referrer: UnboundReferrer) {
  try {
    const { value: username } = await ElMessageBox.prompt(
      `为分销员 "${referrer.display_name}" 创建账号`,
      '创建账号',
      {
        confirmButtonText: '创建',
        cancelButtonText: '取消',
        inputPlaceholder: '请输入用户名',
        inputValue: `referrer_${referrer.display_name}`,
        inputValidator: (value) => {
          if (!value) return '用户名不能为空'
          if (value.length < 3) return '用户名至少3个字符'
          return true
        },
      }
    )

    const { value: password } = await ElMessageBox.prompt(
      '请设置初始密码',
      '设置密码',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputType: 'password',
        inputPlaceholder: '请输入密码（至少6位）',
        inputValue: 'referrer123',
        inputValidator: (value) => {
          if (!value) return '密码不能为空'
          if (value.length < 6) return '密码至少6个字符'
          return true
        },
      }
    )

    const response = await adminUsersAPI.create({
      username,
      password,
      role: 'referrer',
      referrer_code: referrer.referrer,
      email: `${referrer.referrer}@example.com`,
    })

    if (response.success) {
      ElMessage.success(`账号创建成功！用户名：${username}，初始密码：${password}`)
      
      // 刷新未绑定列表
      await handleViewUnbound()
      loadData()
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('创建账号失败:', error)
      const errorMessage = error.response?.data?.detail
      if (typeof errorMessage === 'string') {
        ElMessage.error(errorMessage)
      } else {
        ElMessage.error('创建账号失败')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.referrers-page {
  .card-title {
    font-weight: 600;
    font-size: 16px;
  }

  .search-form {
    margin-bottom: 20px;
  }

  .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }

  .text-muted {
    color: #909399;
  }
}
</style>

