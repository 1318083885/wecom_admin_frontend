<template>
  <div class="short-urls-page">
    <el-card>
      <template #header>
        <div class="flex-between">
          <span class="card-title">短链接管理</span>
          <el-button v-if="canCreate" type="primary" @click="handleCreate">
            <el-icon><Plus /></el-icon>
            创建短链接
          </el-button>
        </div>
      </template>

      <!-- 搜索表单 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="分销员">
          <el-input
            v-model="searchForm.referrer"
            placeholder="分销员标识"
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

      <!-- 数据表格 -->
      <el-table v-loading="loading" :data="tableData" stripe>
        <el-table-column prop="short_code" label="短链码" width="120" />
        <el-table-column prop="short_url" label="短链接" min-width="250">
          <template #default="{ row }">
            <el-link :href="row.short_url" target="_blank" type="primary">
              {{ row.short_url }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column prop="referrer" label="分销员" width="120" />
        <el-table-column prop="description" label="备注" min-width="150" show-overflow-tooltip>
          <template #default="{ row }">
            <span style="color: #606266">{{ row.description || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="click_count" label="点击次数" width="100" sortable>
          <template #default="{ row }">
            {{ row.click_count || 0 }}
          </template>
        </el-table-column>
        <el-table-column prop="is_active" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.is_active ? 'success' : 'info'">
              {{ row.is_active ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="260" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" link @click="handleCopy(row)">
              <el-icon><CopyDocument /></el-icon>
              复制
            </el-button>
            <el-button size="small" type="success" link @click="handleViewStats(row)">
              <el-icon><DataAnalysis /></el-icon>
              统计
            </el-button>
            <el-button
              v-if="canUpdate"
              size="small"
              type="warning"
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

    <!-- 创建短链接对话框 -->
    <el-dialog v-model="createVisible" title="创建短链接" width="600px">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-form-item label="分销员" prop="referrer">
          <el-select
            v-model="formData.referrer"
            filterable
            placeholder="请选择分销员"
            style="width: 100%"
            @change="handleReferrerChange"
          >
            <el-option
              v-for="item in referrers"
              :key="item.referrer"
              :label="`${item.display_name}（${item.referrer}）`"
              :value="item.referrer"
            >
              <span style="float: left">{{ item.display_name }}</span>
              <span style="float: right; color: #8492a6; font-size: 13px">
                {{ item.referrer }}
              </span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="业务线" prop="business_line_id">
          <el-select
            v-model="formData.business_line_id"
            placeholder="请选择业务线"
            style="width: 100%"
            @change="handleBusinessLineChange"
          >
            <el-option
              v-for="item in businessLines"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="加群规则" prop="join_rule_id">
          <el-select v-model="formData.join_rule_id" placeholder="请选择加群规则" style="width: 100%">
            <el-option
              v-for="item in filteredJoinRules"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="有效期">
          <el-radio-group v-model="expiresType" @change="handleExpiresTypeChange">
            <el-radio value="permanent">长期有效</el-radio>
            <el-radio value="days">
              指定天数
              <el-input-number
                v-if="expiresType === 'days'"
                v-model="formData.expires_days"
                :min="1"
                :max="365"
                size="small"
                style="margin-left: 10px; width: 120px"
              />
              <span v-if="expiresType === 'days'" style="margin-left: 5px">天</span>
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="请输入描述信息"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">
          创建
        </el-button>
      </template>
    </el-dialog>

    <!-- 编辑短链接对话框 -->
    <el-dialog v-model="editVisible" title="编辑短链接" width="600px" destroy-on-close>
      <el-form ref="editFormRef" :model="editFormData" :rules="editFormRules" label-width="100px">
        <el-form-item label="短链码">
          <el-input v-model="editFormData.short_code" disabled />
        </el-form-item>
        <el-form-item label="短链接">
          <el-input v-model="editFormData.short_url" disabled>
            <template #append>
              <el-button @click="handleCopyEditUrl">复制</el-button>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="分销员" prop="referrer">
          <el-select
            v-model="editFormData.referrer"
            filterable
            placeholder="请选择分销员"
            style="width: 100%"
            @change="handleEditReferrerChange"
          >
            <el-option
              v-for="item in referrers"
              :key="item.referrer"
              :label="`${item.display_name}（${item.referrer}）`"
              :value="item.referrer"
            >
              <span style="float: left">{{ item.display_name }}</span>
              <span style="float: right; color: #8492a6; font-size: 13px">
                {{ item.referrer }}
              </span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="业务线" prop="business_line_id">
          <el-select
            v-model="editFormData.business_line_id"
            placeholder="请选择业务线"
            style="width: 100%"
            @change="handleEditBusinessLineChange"
          >
            <el-option
              v-for="item in businessLines"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="加群规则" prop="join_rule_id">
          <el-select
            v-model="editFormData.join_rule_id"
            placeholder="请选择加群规则"
            style="width: 100%"
          >
            <el-option
              v-for="item in editFilteredJoinRules"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="editFormData.description"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch
            v-model="editFormData.is_active"
            active-text="启用"
            inactive-text="禁用"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editVisible = false">取消</el-button>
        <el-button type="primary" :loading="editSubmitting" @click="handleEditSubmit">
          保存
        </el-button>
      </template>
    </el-dialog>

    <!-- 统计详情抽屉 -->
    <el-drawer
      v-model="statsVisible"
      :title="`短链统计 - ${currentShortCode}`"
      size="720px"
      destroy-on-close
    >
      <div v-loading="statsLoading" class="stats-container">
        <template v-if="statsData">
          <!-- 统计卡片 -->
          <el-row :gutter="16" style="margin-bottom: 24px">
            <el-col :span="8">
              <el-card shadow="hover">
                <div class="stat-item">
                  <div class="stat-label">总点击次数</div>
                  <div class="stat-value">{{ statsData.total_clicks }}</div>
                </div>
              </el-card>
            </el-col>
            <el-col :span="8">
              <el-card shadow="hover">
                <div class="stat-item">
                  <div class="stat-label">独立访客</div>
                  <div class="stat-value">{{ statsData.unique_visitors }}</div>
                </div>
              </el-card>
            </el-col>
            <el-col :span="8">
              <el-card shadow="hover">
                <div class="stat-item">
                  <div class="stat-label">点击率</div>
                  <div class="stat-value">
                    {{ statsData.total_clicks > 0 
                      ? ((statsData.unique_visitors / statsData.total_clicks) * 100).toFixed(1) 
                      : '0.0' }}%
                  </div>
                </div>
              </el-card>
            </el-col>
          </el-row>

          <!-- 按日期统计图表 -->
          <el-card shadow="never" style="margin-bottom: 16px">
            <template #header>
              <span>点击趋势（按日期）</span>
            </template>
            <div 
              v-if="statsData.click_by_date && Object.keys(statsData.click_by_date).length > 0"
              ref="dateChartRef" 
              style="height: 300px"
            ></div>
            <el-empty 
              v-else 
              description="暂无日期统计数据" 
              :image-size="100"
            />
          </el-card>

          <!-- 按小时统计图表 -->
          <el-card shadow="never" style="margin-bottom: 16px">
            <template #header>
              <div class="flex-between">
                <span>点击分布（按小时）</span>
                <el-tag 
                  v-if="!statsData.click_by_hour || Object.keys(statsData.click_by_hour).length === 0" 
                  size="small" 
                  type="info"
                >
                  后端暂未提供
                </el-tag>
              </div>
            </template>
            <div 
              v-if="statsData.click_by_hour && Object.keys(statsData.click_by_hour).length > 0"
              ref="hourChartRef" 
              style="height: 250px"
            ></div>
            <el-empty 
              v-else 
              description="后端暂未提供按小时统计数据，建议联系后端添加 hourly_stats 字段" 
              :image-size="100"
            >
              <el-button type="primary" size="small" disabled>
                等待后端支持
              </el-button>
            </el-empty>
          </el-card>

          <!-- Top分销员 -->
          <el-card v-if="statsData.top_referrers && statsData.top_referrers.length > 0" shadow="never">
            <template #header>
              <span>Top 分销员</span>
            </template>
            <el-tag
              v-for="(ref, index) in statsData.top_referrers"
              :key="index"
              style="margin-right: 8px; margin-bottom: 8px"
              type="success"
            >
              {{ ref }}
            </el-tag>
          </el-card>
        </template>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import { shortUrlsAPI } from '@/api/short-urls'
import { businessLinesAPI } from '@/api/business-lines'
import { joinRulesAPI } from '@/api/join-rules'
import { referrersAPI } from '@/api/referrers'
import type { ShortUrl, BusinessLine, JoinRule } from '@/types/business'
import { formatDateTime } from '@/utils/format'
import * as echarts from 'echarts'

const authStore = useAuthStore()

const loading = ref(false)
const tableData = ref<ShortUrl[]>([])
const businessLines = ref<BusinessLine[]>([])
const joinRules = ref<JoinRule[]>([])
const referrers = ref<any[]>([]) // 分销员列表
const filteredJoinRules = ref<JoinRule[]>([]) // 过滤后的加群规则

const searchForm = reactive({
  referrer: '',
  business_line_id: undefined as number | undefined,
})

const pagination = reactive({
  page: 1,
  page_size: 20,
  total: 0,
})

const createVisible = ref(false)
const submitting = ref(false)
const formRef = ref<FormInstance>()
const expiresType = ref<'days' | 'permanent'>('permanent') // 有效期类型，默认长期有效
const formData = reactive({
  referrer: '',
  business_line_id: undefined as number | undefined,
  join_rule_id: undefined as number | undefined,
  expires_days: 30 as number | undefined,
  description: '',
})

const formRules: FormRules = {
  referrer: [{ required: true, message: '请输入分销员标识', trigger: 'blur' }],
  business_line_id: [{ required: true, message: '请选择业务线', trigger: 'change' }],
  join_rule_id: [{ required: true, message: '请选择加群规则', trigger: 'change' }],
}

// 编辑相关
const editVisible = ref(false)
const editSubmitting = ref(false)
const editFormRef = ref<FormInstance>()
const editFormData = reactive({
  short_code: '',
  short_url: '',
  referrer: '',
  business_line_id: undefined as number | undefined,
  join_rule_id: undefined as number | undefined,
  description: '',
  is_active: true,
})

const editFormRules: FormRules = {
  referrer: [{ required: true, message: '请选择分销员', trigger: 'change' }],
  business_line_id: [{ required: true, message: '请选择业务线', trigger: 'change' }],
  join_rule_id: [{ required: true, message: '请选择加群规则', trigger: 'change' }],
}

// 编辑时的过滤规则
const editFilteredJoinRules = computed(() => {
  if (!editFormData.business_line_id) return []
  return joinRules.value.filter((rule) => rule.business_line_id === editFormData.business_line_id)
})

const canCreate = computed(() => authStore.hasPermission('short_urls:create'))
const canUpdate = computed(() => authStore.hasPermission('short_urls:update'))

// 统计相关
const statsVisible = ref(false)
const statsLoading = ref(false)
const currentShortCode = ref('')
const statsData = ref<any>(null)
const dateChartRef = ref<HTMLElement>()
const hourChartRef = ref<HTMLElement>()
let dateChart: echarts.ECharts | null = null
let hourChart: echarts.ECharts | null = null

onMounted(() => {
  loadBusinessLines()
  loadJoinRules()
  loadReferrers()
  loadData()
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

async function loadJoinRules() {
  try {
    const response = await joinRulesAPI.getList({ page: 1, page_size: 100 })
    if (response.success && response.data) {
      joinRules.value = response.data.items
      filteredJoinRules.value = response.data.items
    }
  } catch (error) {
    console.error('加载规则失败:', error)
  }
}

async function loadReferrers() {
  try {
    const response = await referrersAPI.getList({ page: 1, page_size: 100 })
    if (response.success && response.data) {
      referrers.value = response.data.items
      console.log('✅ 加载了', referrers.value.length, '个分销员')
    }
  } catch (error) {
    console.error('加载分销员失败:', error)
  }
}

async function loadData() {
  loading.value = true
  try {
    const response = await shortUrlsAPI.getList({
      page: pagination.page,
      page_size: pagination.page_size,
      ...searchForm,
    })
    if (response.success && response.data) {
      tableData.value = response.data.items
      pagination.total = response.data.total
    }
  } catch (error) {
    console.error('加载短链接列表失败:', error)
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  pagination.page = 1
  loadData()
}

function handleReset() {
  searchForm.referrer = ''
  searchForm.business_line_id = undefined
  handleSearch()
}

function handleSizeChange() {
  pagination.page = 1
  loadData()
}

function handleCreate() {
  // 重置表单
  formData.referrer = ''
  formData.business_line_id = undefined
  formData.join_rule_id = undefined
  formData.expires_days = 30
  formData.description = ''
  expiresType.value = 'permanent' // 默认长期有效
  filteredJoinRules.value = joinRules.value
  createVisible.value = true
}

function handleReferrerChange() {
  // 当选择分销员时，可以根据分销员自动填充业务线（可选）
  const selectedReferrer = referrers.value.find(r => r.referrer === formData.referrer)
  if (selectedReferrer && selectedReferrer.business_line_id) {
    formData.business_line_id = selectedReferrer.business_line_id
    handleBusinessLineChange()
  }
}

function handleBusinessLineChange() {
  // 根据业务线筛选加群规则
  if (formData.business_line_id) {
    filteredJoinRules.value = joinRules.value.filter(
      rule => rule.business_line_id === formData.business_line_id
    )
  } else {
    filteredJoinRules.value = joinRules.value
  }
  // 如果当前选择的规则不在筛选后的列表中，清空选择
  if (formData.join_rule_id) {
    const exists = filteredJoinRules.value.some(rule => rule.id === formData.join_rule_id)
    if (!exists) {
      formData.join_rule_id = undefined
    }
  }
}

function handleExpiresTypeChange() {
  if (expiresType.value === 'permanent') {
    formData.expires_days = undefined
  } else {
    formData.expires_days = 30
  }
}

async function handleSubmit() {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    submitting.value = true
    try {
      // 生成 original_url（统一处理接口）
      const originalUrl = `/api/v1/unified/process?referrer=${formData.referrer}&business_line_id=${formData.business_line_id}&rule_id=${formData.join_rule_id}`
      
      // 准备提交数据
      const submitData: any = {
        original_url: originalUrl, // ✅ 必填字段
        referrer: formData.referrer,
        business_line_id: formData.business_line_id,
        join_rule_id: formData.join_rule_id,
        description: formData.description,
      }
      
      // 只有在指定天数时才传 expires_days
      if (expiresType.value === 'days') {
        submitData.expires_days = formData.expires_days
      }
      // 长期有效时不传 expires_days 或传 null
      
      console.log('📊 提交数据:', submitData)
      const response = await shortUrlsAPI.create(submitData)
      
      if (response.success && response.data) {
        ElMessage.success(`创建成功！短链接：${response.data.short_url}`)
      } else {
        ElMessage.success('创建成功')
      }
      
      createVisible.value = false
      loadData()
    } catch (error) {
      console.error('创建失败:', error)
    } finally {
      submitting.value = false
    }
  })
}

// 编辑短链接
function handleEdit(row: ShortUrl) {
  editFormData.short_code = row.short_code
  editFormData.short_url = row.short_url || ''
  editFormData.referrer = row.referrer || ''
  editFormData.business_line_id = row.business_line_id
  editFormData.join_rule_id = row.join_rule_id
  editFormData.description = row.description || ''
  editFormData.is_active = row.is_active
  editVisible.value = true
}

// 编辑表单-分销员变化
function handleEditReferrerChange(referrer: string) {
  const selected = referrers.value.find((r) => r.referrer === referrer)
  if (selected && selected.business_line_id) {
    editFormData.business_line_id = selected.business_line_id
    handleEditBusinessLineChange()
  }
}

// 编辑表单-业务线变化
function handleEditBusinessLineChange() {
  // 重置加群规则
  editFormData.join_rule_id = undefined
}

// 复制编辑对话框中的短链接
async function handleCopyEditUrl() {
  try {
    await navigator.clipboard.writeText(editFormData.short_url)
    ElMessage.success('链接已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败，请手动复制')
  }
}

// 提交编辑
async function handleEditSubmit() {
  if (!editFormRef.value) return

  await editFormRef.value.validate(async (valid) => {
    if (!valid) return

    editSubmitting.value = true
    try {
      // 生成新的 original_url
      const originalUrl = `/api/v1/unified/process?referrer=${editFormData.referrer}&business_line_id=${editFormData.business_line_id}&rule_id=${editFormData.join_rule_id}`
      
      const updateData = {
        referrer: editFormData.referrer,
        business_line_id: editFormData.business_line_id,
        join_rule_id: editFormData.join_rule_id,
        description: editFormData.description,
        is_active: editFormData.is_active,
        original_url: originalUrl, // 更新 original_url
      }

      console.log('📝 更新短链接:', editFormData.short_code, updateData)
      const response = await shortUrlsAPI.update(editFormData.short_code, updateData)

      if (response.success) {
        ElMessage.success('更新成功')
        editVisible.value = false
        loadData()
      } else {
        ElMessage.error('更新失败')
      }
    } catch (error: any) {
      console.error('更新失败:', error)
      ElMessage.error(error.response?.data?.message || '更新失败')
    } finally {
      editSubmitting.value = false
    }
  })
}

async function handleCopy(row: ShortUrl) {
  try {
    await navigator.clipboard.writeText(row.short_url)
    ElMessage.success('链接已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败，请手动复制')
  }
}

async function handleViewStats(row: ShortUrl) {
  currentShortCode.value = row.short_code
  statsVisible.value = true
  statsLoading.value = true
  
  try {
    const response = await shortUrlsAPI.getStats(row.short_code, { days: 30 })
    console.log('📊 短链统计数据（原始）:', response)
    
    if (response.success && response.data) {
      // 适配后端真实格式，转换为前端需要的格式
      const rawData: any = response.data
      statsData.value = {
        total_clicks: rawData.total_clicks || 0,
        unique_visitors: rawData.unique_visitors || 0,
        // 从 daily_stats 转换为 click_by_date
        click_by_date: rawData.daily_stats 
          ? Object.fromEntries(
              rawData.daily_stats.map((item: any) => [item.date, item.clicks])
            )
          : {},
        // 从 daily_stats 提取独立访客数据（额外的）
        visitors_by_date: rawData.daily_stats
          ? Object.fromEntries(
              rawData.daily_stats.map((item: any) => [item.date, item.unique_visitors])
            )
          : {},
        // 如果后端有 hourly_stats，转换；如果没有，设为空对象
        click_by_hour: rawData.hourly_stats
          ? Object.fromEntries(
              rawData.hourly_stats.map((item: any) => [item.hour, item.clicks])
            )
          : {},
        // Top分销员
        top_referrers: rawData.top_referrers || [],
      }
      
      console.log('📊 转换后的统计数据:', statsData.value)
      console.log('📅 日期数据:', Object.keys(statsData.value.click_by_date).length, '条')
      console.log('⏰ 小时数据:', Object.keys(statsData.value.click_by_hour).length, '条')
      
      // 等待DOM更新后渲染图表
      await nextTick()
      renderCharts()
    }
  } catch (error) {
    console.error('❌ 获取统计数据失败:', error)
    ElMessage.error('获取统计数据失败')
  } finally {
    statsLoading.value = false
  }
}

function renderCharts() {
  if (!statsData.value) return
  
  // 渲染日期趋势图
  if (dateChartRef.value) {
    const dates = Object.keys(statsData.value.click_by_date || {}).sort()
    const clickValues = dates.map(date => statsData.value.click_by_date[date])
    const visitorValues = dates.map(date => statsData.value.visitors_by_date?.[date] || 0)
    
    console.log('📈 渲染日期趋势图:', dates.length, '个日期')
    
    if (dates.length === 0) {
      console.warn('⚠️ 没有日期数据，跳过渲染')
      return
    }
    
    dateChart = echarts.init(dateChartRef.value)
    
    dateChart.setOption({
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          const date = params[0].axisValue
          const clicks = params[0].value
          const visitors = params[1] ? params[1].value : 0
          return `${date}<br/>点击次数: ${clicks}<br/>独立访客: ${visitors}`
        },
      },
      legend: {
        data: ['点击次数', '独立访客'],
      },
      xAxis: {
        type: 'category',
        data: dates,
        axisLabel: {
          rotate: 45,
          formatter: (value: string) => value.split('T')[0],
        },
      },
      yAxis: {
        type: 'value',
        name: '数量',
      },
      series: [
        {
          name: '点击次数',
          type: 'line',
          smooth: true,
          data: clickValues,
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
              { offset: 1, color: 'rgba(64, 158, 255, 0.05)' },
            ]),
          },
          itemStyle: {
            color: '#409EFF',
          },
        },
        {
          name: '独立访客',
          type: 'line',
          smooth: true,
          data: visitorValues,
          itemStyle: {
            color: '#67C23A',
          },
        },
      ],
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        containLabel: true,
      },
    })
  }
  
  // 渲染小时分布图
  if (hourChartRef.value) {
    const hours = Object.keys(statsData.value.click_by_hour || {}).sort()
    const values = hours.map(hour => statsData.value.click_by_hour[hour])
    
    console.log('📊 渲染小时分布图:', hours.length, '个小时')
    
    if (hours.length === 0) {
      console.warn('⚠️ 后端暂未提供按小时统计数据')
      // 不渲染，让模板显示"暂无数据"
      return
    }
    
    hourChart = echarts.init(hourChartRef.value)
    
    hourChart.setOption({
      tooltip: {
        trigger: 'axis',
        formatter: '{b}<br/>点击次数: {c}',
      },
      xAxis: {
        type: 'category',
        data: hours.map(h => `${h.padStart(2, '0')}:00`),
      },
      yAxis: {
        type: 'value',
        name: '点击次数',
      },
      series: [
        {
          name: '点击次数',
          type: 'bar',
          data: values,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#67C23A' },
              { offset: 1, color: '#85CE61' },
            ]),
          },
          barWidth: '60%',
        },
      ],
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
    })
  }
}

async function handleToggleStatus(row: ShortUrl) {
  try {
    await ElMessageBox.confirm(
      `确定要${row.is_active ? '禁用' : '启用'}该短链接吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    await shortUrlsAPI.update(row.short_code, { is_active: !row.is_active })
    ElMessage.success('操作成功')
    loadData()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('操作失败:', error)
    }
  }
}
</script>

<style lang="scss" scoped>
.short-urls-page {
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
}

.stats-container {
  .stat-item {
    text-align: center;
    
    .stat-label {
      font-size: 14px;
      color: #909399;
      margin-bottom: 8px;
    }
    
    .stat-value {
      font-size: 28px;
      font-weight: bold;
      color: #303133;
    }
  }
}
</style>

