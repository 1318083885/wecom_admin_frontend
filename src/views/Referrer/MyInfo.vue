<template>
  <div class="my-info-page">
    <!-- 我的信息卡片 -->
    <el-card v-loading="loading">
      <template #header>
        <div class="flex-between">
          <span class="card-title">我的信息</span>
          <div>
            <el-button type="warning" @click="changePasswordVisible = true">
              <el-icon><Lock /></el-icon>
              修改密码
            </el-button>
            <el-button type="primary" @click="loadMyInfo" style="margin-left: 10px">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </div>
        </div>
      </template>

      <el-descriptions :column="2" border>
        <el-descriptions-item label="分销员编号">
          <el-tag type="success" size="large">{{ myInfo?.referrer }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="显示名称">
          <strong>{{ myInfo?.display_name }}</strong>
        </el-descriptions-item>
        <el-descriptions-item label="配置策略">
          {{ myInfo?.config_strategy === 'SHARED' ? '共享配置' : '独立配置' }}
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="myInfo?.is_active ? 'success' : 'danger'">
            {{ myInfo?.is_active ? '启用' : '禁用' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">
          {{ formatDateTime(myInfo?.created_at) }}
        </el-descriptions-item>
        <el-descriptions-item label="最后访问">
          {{ myInfo?.last_scan_at ? formatDateTime(myInfo.last_scan_at) : '暂无数据' }}
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 数据统计卡片 -->
    <el-row :gutter="20" class="mt-20">
      <el-col :span="8">
        <el-card class="stat-card">
          <el-statistic title="总点击数" :value="myInfo?.total_scans || 0">
            <template #prefix>
              <el-icon color="#409EFF"><View /></el-icon>
            </template>
          </el-statistic>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="stat-card">
          <el-statistic title="总转化数" :value="myInfo?.total_conversions || 0">
            <template #prefix>
              <el-icon color="#67C23A"><Check /></el-icon>
            </template>
          </el-statistic>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="stat-card">
          <el-statistic title="转化率" :value="myInfo?.conversion_rate || 0" :precision="2" suffix="%">
            <template #prefix>
              <el-icon color="#E6A23C"><TrendCharts /></el-icon>
            </template>
          </el-statistic>
        </el-card>
      </el-col>
    </el-row>

    <!-- 近期数据分析 -->
    <el-card class="mt-20" v-loading="analyticsLoading">
      <template #header>
        <div class="flex-between">
          <span class="card-title">近期数据分析</span>
          <el-select v-model="analyticsDays" @change="loadAnalytics" style="width: 150px">
            <el-option label="近7天" :value="7" />
            <el-option label="近15天" :value="15" />
            <el-option label="近30天" :value="30" />
            <el-option label="近90天" :value="90" />
          </el-select>
        </div>
      </template>

      <el-row :gutter="20">
        <el-col :span="6">
          <div class="stat-item">
            <div class="label">链接总数</div>
            <div class="value">{{ analytics?.total_links || 0 }}</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-item">
            <div class="label">启用中</div>
            <div class="value" style="color: #67C23A">{{ analytics?.active_links || 0 }}</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-item">
            <div class="label">总点击</div>
            <div class="value" style="color: #409EFF">{{ analytics?.total_scans || 0 }}</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-item">
            <div class="label">总转化</div>
            <div class="value" style="color: #E6A23C">{{ analytics?.total_conversions || 0 }}</div>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 修改密码对话框 -->
    <el-dialog
      v-model="changePasswordVisible"
      title="修改密码"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="passwordFormRef"
        :model="passwordForm"
        :rules="passwordRules"
        label-width="100px"
      >
        <el-form-item label="旧密码" prop="oldPassword">
          <el-input
            v-model="passwordForm.oldPassword"
            type="password"
            placeholder="请输入旧密码"
            show-password
          />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input
            v-model="passwordForm.newPassword"
            type="password"
            placeholder="请输入新密码（至少6位）"
            show-password
          />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="passwordForm.confirmPassword"
            type="password"
            placeholder="请再次输入新密码"
            show-password
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="changePasswordVisible = false">取消</el-button>
        <el-button type="primary" :loading="changingPassword" @click="handleChangePassword">
          确定修改
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { referrerSelfAPI, type ReferrerSelfInfo, type ReferrerAnalytics } from '@/api/referrer-self'
import { adminUsersAPI } from '@/api/admin-users'
import { formatDateTime } from '@/utils/format'

const authStore = useAuthStore()
const router = useRouter()

const loading = ref(false)
const myInfo = ref<ReferrerSelfInfo>()

const analyticsLoading = ref(false)
const analyticsDays = ref(30)
const analytics = ref<ReferrerAnalytics>()

// 修改密码相关
const changePasswordVisible = ref(false)
const changingPassword = ref(false)
const passwordFormRef = ref<FormInstance>()
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const passwordRules: FormRules = {
  oldPassword: [
    { required: true, message: '请输入旧密码', trigger: 'blur' },
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur',
    },
  ],
}

onMounted(() => {
  loadMyInfo()
  loadAnalytics()
})

async function loadMyInfo() {
  loading.value = true
  try {
    const response = await referrerSelfAPI.getMyInfo()
    if (response.success && response.data) {
      myInfo.value = response.data
      console.log('✅ 我的信息:', myInfo.value)
      console.log('📊 来自 /me/referrer 的数据:')
      console.log('  - total_scans:', myInfo.value.total_scans)
      console.log('  - total_conversions:', myInfo.value.total_conversions)
      console.log('  - conversion_rate:', myInfo.value.conversion_rate)
    }
  } catch (error) {
    console.error('加载我的信息失败:', error)
    ElMessage.error('加载我的信息失败')
  } finally {
    loading.value = false
  }
}

async function loadAnalytics() {
  analyticsLoading.value = true
  try {
    const response = await referrerSelfAPI.getMyAnalytics(analyticsDays.value)
    if (response.success && response.data) {
      analytics.value = response.data
      console.log('✅ 数据分析:', analytics.value)
      console.log('📊 来自 /me/referrer/analytics 的数据:')
      console.log('  - total_scans:', analytics.value.total_scans)
      console.log('  - total_conversions:', analytics.value.total_conversions)
      console.log('  - conversion_rate:', analytics.value.conversion_rate)
      console.log('⚠️ 数据差异对比:')
      console.log(`  - myInfo.total_scans (累计): ${myInfo.value?.total_scans || 0}`)
      console.log(`  - analytics.total_scans (近${analyticsDays.value}天): ${analytics.value.total_scans}`)
      
      if ((myInfo.value?.total_scans || 0) < analytics.value.total_scans) {
        console.warn('⚠️ 后端数据异常：累计总数据应该 >= 近期数据，但实际情况相反！')
        console.warn('建议后端检查 /me/referrer 接口的 total_scans 计算逻辑')
      }
    }
  } catch (error) {
    console.error('加载数据分析失败:', error)
    ElMessage.error('加载数据分析失败')
  } finally {
    analyticsLoading.value = false
  }
}

async function handleChangePassword() {
  if (!passwordFormRef.value) return

  await passwordFormRef.value.validate(async (valid) => {
    if (!valid) return

    changingPassword.value = true
    try {
      console.log('🔄 修改密码...')
      
      // ✅ 使用 me/change-password 接口（所有用户可用）
      const response = await adminUsersAPI.changeMyPassword(
        passwordForm.oldPassword,
        passwordForm.newPassword
      )

      if (response.success) {
        console.log('✅ 密码修改成功，即将退出登录')
        
        // 清空表单
        passwordForm.oldPassword = ''
        passwordForm.newPassword = ''
        passwordForm.confirmPassword = ''
        changePasswordVisible.value = false
        
        // 立即退出登录
        authStore.logout()
        
        // 提示并跳转
        ElMessage.success('密码修改成功，请使用新密码重新登录')
        router.push('/login')
      } else {
        console.error('❌ 后端返回失败:', response)
        ElMessage.error(response.message || '密码修改失败')
      }
    } catch (error: any) {
      console.error('❌ 修改密码失败:', error)
      const errorMessage = error.response?.data?.detail
      if (typeof errorMessage === 'string') {
        ElMessage.error(errorMessage)
      } else {
        ElMessage.error('修改密码失败，请检查旧密码是否正确')
      }
    } finally {
      changingPassword.value = false
    }
  })
}
</script>

<style lang="scss" scoped>
.my-info-page {
  .card-title {
    font-weight: 600;
    font-size: 16px;
  }

  .flex-between {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .mt-20 {
    margin-top: 20px;
  }

  .stat-card {
    :deep(.el-statistic__head) {
      font-size: 14px;
      color: #909399;
    }

    :deep(.el-statistic__content) {
      font-size: 28px;
      font-weight: 600;
    }
  }

  .stat-item {
    text-align: center;
    padding: 20px 0;

    .label {
      font-size: 14px;
      color: #909399;
      margin-bottom: 10px;
    }

    .value {
      font-size: 28px;
      font-weight: 600;
      color: #303133;
    }
  }
}
</style>

