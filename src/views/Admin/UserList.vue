<template>
  <div class="admin-users-page">
    <el-card>
      <template #header>
        <div class="flex-between">
          <span class="card-title">管理员管理</span>
          <el-button type="primary" @click="handleCreate">
            <el-icon><Plus /></el-icon>
            创建账号
          </el-button>
        </div>
      </template>

      <!-- 搜索表单 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="角色">
          <el-select v-model="searchForm.role" placeholder="全部角色" clearable>
            <el-option label="超级管理员" value="super_admin" />
            <el-option label="业务管理员" value="business_admin" />
            <el-option label="数据分析师" value="analyst" />
            <el-option label="运营人员" value="operator" />
            <el-option label="分销员" value="referrer" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.is_active" placeholder="全部状态" clearable>
            <el-option label="启用" :value="true" />
            <el-option label="禁用" :value="false" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 数据表格 -->
      <el-table v-loading="loading" :data="tableData" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" min-width="150" />
        <el-table-column prop="role" label="角色" width="120">
          <template #default="{ row }">
            <el-tag :type="getRoleTagType(row.role)">
              {{ getRoleText(row.role) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="referrer_code" label="分销员编号" width="120">
          <template #default="{ row }">
            <span v-if="row.referrer_code" class="referrer-code">{{ row.referrer_code }}</span>
            <span v-else class="text-muted">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="email" label="邮箱" min-width="180" show-overflow-tooltip />
        <el-table-column prop="is_active" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.is_active ? 'success' : 'danger'">
              {{ row.is_active ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="last_login_at" label="最后登录" width="180">
          <template #default="{ row }">
            {{ row.last_login_at ? formatDateTime(row.last_login_at) : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" link @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button size="small" type="warning" link @click="handleResetPassword(row)">
              重置密码
            </el-button>
            <el-button 
              size="small" 
              :type="row.is_active ? 'danger' : 'success'" 
              link 
              @click="handleToggleStatus(row)"
            >
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
      :title="dialogMode === 'create' ? '创建账号' : '编辑账号'"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="120px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="formData.username" placeholder="请输入用户名" />
        </el-form-item>

        <el-form-item v-if="dialogMode === 'create'" label="密码" prop="password">
          <el-input v-model="formData.password" type="password" placeholder="请输入密码" show-password />
        </el-form-item>

        <el-form-item label="角色" prop="role">
          <el-select 
            v-model="formData.role" 
            placeholder="请选择角色"
            @change="handleRoleChange"
          >
            <el-option label="超级管理员" value="super_admin" />
            <el-option label="业务管理员" value="business_admin" />
            <el-option label="数据分析师" value="analyst" />
            <el-option label="运营人员" value="operator" />
            <el-option label="分销员" value="referrer" />
          </el-select>
        </el-form-item>

        <!-- 角色互斥提示 -->
        <el-alert
          v-if="formData.role === 'referrer'"
          type="warning"
          :closable="false"
          style="margin-bottom: 15px"
        >
          <template #default>
            ⚠️ 分销员角色必须绑定分销员编号
          </template>
        </el-alert>

        <el-alert
          v-else-if="formData.role && formData.role !== 'referrer'"
          type="info"
          :closable="false"
          style="margin-bottom: 15px"
        >
          <template #default>
            ℹ️ 内部管理员不能设置分销员编号
          </template>
        </el-alert>

        <el-form-item 
          v-if="formData.role === 'referrer'" 
          label="分销员编号" 
          prop="referrer_code"
        >
          <el-input 
            v-model="formData.referrer_code" 
            placeholder="请输入分销员编号（如 R000001）"
          >
            <template #append>
              <el-button @click="showUnboundReferrers">从列表选择</el-button>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input v-model="formData.email" placeholder="请输入邮箱" />
        </el-form-item>

        <el-form-item label="手机" prop="phone">
          <el-input v-model="formData.phone" placeholder="请输入手机号" />
        </el-form-item>

        <el-form-item v-if="dialogMode === 'edit'" label="状态">
          <el-switch v-model="formData.is_active" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 未绑定分销员选择对话框 -->
    <el-dialog
      v-model="unboundDialogVisible"
      title="选择未绑定的分销员"
      width="700px"
    >
      <el-table
        v-loading="unboundLoading"
        :data="unboundReferrers"
        stripe
        @row-click="handleSelectReferrer"
        style="cursor: pointer"
      >
        <el-table-column prop="referrer" label="分销员编号" width="120" />
        <el-table-column prop="display_name" label="显示名称" width="150" />
        <el-table-column prop="total_scans" label="总点击数" width="100" />
        <el-table-column prop="total_conversions" label="总转化数" width="100" />
        <el-table-column prop="account_status" label="账号状态" width="120">
          <template #default="{ row }">
            <el-tag type="warning">{{ row.account_status }}</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { adminUsersAPI, type AdminUser, type CreateAdminUserRequest, type UpdateAdminUserRequest } from '@/api/admin-users'
import { referrersAPI, type UnboundReferrer } from '@/api/referrers'
import { formatDateTime } from '@/utils/format'

const loading = ref(false)
const tableData = ref<AdminUser[]>([])

const searchForm = reactive({
  role: '',
  is_active: undefined as boolean | undefined,
})

const pagination = reactive({
  page: 1,
  page_size: 20,
  total: 0,
})

// 对话框相关
const dialogVisible = ref(false)
const dialogMode = ref<'create' | 'edit'>('create')
const submitting = ref(false)
const formRef = ref<FormInstance>()
const currentUser = ref<AdminUser | null>(null)

const formData = reactive<any>({
  username: '',
  password: '',
  role: '',
  referrer_code: null,
  email: '',
  phone: '',
  is_active: true,
})

const formRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' },
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' },
  ],
  referrer_code: [
    { 
      required: true, 
      message: '分销员角色必须绑定分销员编号', 
      trigger: 'blur',
      validator: (rule: any, value: any, callback: any) => {
        if (formData.role === 'referrer' && !value) {
          callback(new Error('分销员角色必须绑定分销员编号'))
        } else {
          callback()
        }
      }
    },
  ],
}

// 未绑定分销员相关
const unboundDialogVisible = ref(false)
const unboundLoading = ref(false)
const unboundReferrers = ref<UnboundReferrer[]>([])

onMounted(() => {
  loadData()
})

async function loadData() {
  loading.value = true
  try {
    const skip = (pagination.page - 1) * pagination.page_size
    const response = await adminUsersAPI.getList({
      role: searchForm.role || undefined,
      is_active: searchForm.is_active,
      skip,
      limit: pagination.page_size,
    })

    if (response.success && response.data) {
      tableData.value = response.data.items
      pagination.total = response.data.total
    }
  } catch (error) {
    console.error('加载用户列表失败:', error)
    ElMessage.error('加载用户列表失败')
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  pagination.page = 1
  loadData()
}

function handleReset() {
  searchForm.role = ''
  searchForm.is_active = undefined
  handleSearch()
}

function handleSizeChange() {
  pagination.page = 1
  loadData()
}

function handleCreate() {
  dialogMode.value = 'create'
  resetForm()
  dialogVisible.value = true
}

function handleEdit(row: AdminUser) {
  dialogMode.value = 'edit'
  currentUser.value = row
  Object.assign(formData, {
    username: row.username,
    role: row.role,
    referrer_code: row.referrer_code,
    email: row.email,
    phone: row.phone,
    is_active: row.is_active,
  })
  dialogVisible.value = true
}

function handleRoleChange(role: string) {
  // 角色改变时，清空分销员编号
  if (role !== 'referrer') {
    formData.referrer_code = null
  }
}

async function showUnboundReferrers() {
  unboundDialogVisible.value = true
  unboundLoading.value = true
  
  try {
    const response = await referrersAPI.getUnboundList({
      is_active: true,
      limit: 50,
    })
    
    if (response.success && response.data) {
      unboundReferrers.value = response.data.items
    }
  } catch (error) {
    console.error('加载未绑定分销员失败:', error)
    ElMessage.error('加载未绑定分销员失败')
  } finally {
    unboundLoading.value = false
  }
}

function handleSelectReferrer(row: UnboundReferrer) {
  formData.referrer_code = row.referrer
  formData.username = formData.username || `referrer_${row.display_name}`
  unboundDialogVisible.value = false
  ElMessage.success(`已选择分销员：${row.display_name} (${row.referrer})`)
}

async function handleSubmit() {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    submitting.value = true
    
    try {
      if (dialogMode.value === 'create') {
        // 创建账号
        const createData: CreateAdminUserRequest = {
          username: formData.username,
          password: formData.password,
          role: formData.role,
          referrer_code: formData.referrer_code,
          email: formData.email,
          phone: formData.phone,
        }
        
        const response = await adminUsersAPI.create(createData)
        
        if (response.success) {
          ElMessage.success('账号创建成功')
          dialogVisible.value = false
          loadData()
        }
      } else {
        // 更新用户
        if (!currentUser.value) return
        
        const updateData: UpdateAdminUserRequest = {
          username: formData.username,
          role: formData.role,
          referrer_code: formData.referrer_code,
          email: formData.email,
          phone: formData.phone,
          is_active: formData.is_active,
        }
        
        const response = await adminUsersAPI.update(currentUser.value.id, updateData)
        
        if (response.success) {
          ElMessage.success('用户信息更新成功')
          dialogVisible.value = false
          loadData()
        }
      }
    } catch (error: any) {
      console.error('操作失败:', error)
      const errorMessage = error.response?.data?.detail
      if (typeof errorMessage === 'string') {
        ElMessage.error(errorMessage)
      } else if (Array.isArray(errorMessage)) {
        ElMessage.error(errorMessage[0]?.msg || '操作失败')
      } else {
        ElMessage.error('操作失败')
      }
    } finally {
      submitting.value = false
    }
  })
}

async function handleResetPassword(row: AdminUser) {
  try {
    const { value } = await ElMessageBox.prompt('请输入新密码（至少6位）', '重置密码', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputPattern: /.{6,}/,
      inputErrorMessage: '密码长度不能少于6位',
    })

    const response = await adminUsersAPI.resetPassword(row.id, value)
    
    if (response.success) {
      ElMessage.success('密码重置成功')
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('重置密码失败:', error)
      ElMessage.error('重置密码失败')
    }
  }
}

async function handleToggleStatus(row: AdminUser) {
  const action = row.is_active ? '禁用' : '启用'
  
  try {
    await ElMessageBox.confirm(
      `确定要${action}用户 "${row.username}" 吗？`,
      '确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    const response = await adminUsersAPI.update(row.id, {
      is_active: !row.is_active,
    })
    
    if (response.success) {
      ElMessage.success(`${action}成功`)
      loadData()
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error(`${action}失败:`, error)
      ElMessage.error(`${action}失败`)
    }
  }
}

function resetForm() {
  Object.assign(formData, {
    username: '',
    password: '',
    role: '',
    referrer_code: null,
    email: '',
    phone: '',
    is_active: true,
  })
  formRef.value?.clearValidate()
}

function getRoleTagType(role: string): string {
  const map: Record<string, string> = {
    super_admin: 'danger',
    business_admin: 'warning',
    analyst: 'info',
    operator: 'primary',
    referrer: 'success',
  }
  return map[role] || ''
}

function getRoleText(role: string): string {
  const map: Record<string, string> = {
    super_admin: '超级管理员',
    business_admin: '业务管理员',
    analyst: '数据分析师',
    operator: '运营人员',
    referrer: '分销员',
  }
  return map[role] || role
}
</script>

<style lang="scss" scoped>
.admin-users-page {
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

  .referrer-code {
    color: #67C23A;
    font-weight: 600;
  }

  .text-muted {
    color: #909399;
  }

  .flex-between {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>

