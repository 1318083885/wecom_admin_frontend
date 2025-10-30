<template>
  <div class="header">
    <div class="left">
      <el-icon class="hamburger" @click="toggleSidebar">
        <Expand v-if="collapsed" />
        <Fold v-else />
      </el-icon>
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item v-if="currentRoute.meta?.title">
          {{ currentRoute.meta.title }}
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <div class="right">
      <el-dropdown @command="handleCommand">
        <span class="user-info">
          <el-icon class="user-icon">
            <User />
          </el-icon>
          <span class="username">{{ username }}</span>
          <el-icon class="arrow-icon">
            <ArrowDown />
          </el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="profile">
              <el-icon><User /></el-icon>
              个人中心
            </el-dropdown-item>
            <el-dropdown-item command="changePassword">
              <el-icon><Lock /></el-icon>
              修改密码
            </el-dropdown-item>
            <el-dropdown-item divided command="logout">
              <el-icon><SwitchButton /></el-icon>
              退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

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
import { ref, reactive, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { useAppStore } from '@/stores/app'
import { useAuthStore } from '@/stores/auth'
import { adminUsersAPI } from '@/api/admin-users'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const authStore = useAuthStore()

const collapsed = computed(() => appStore.sidebarCollapsed)
const username = computed(() => authStore.username || '管理员')
const currentRoute = computed(() => route)

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

function toggleSidebar() {
  appStore.toggleSidebar()
}

async function handleCommand(command: string) {
  if (command === 'logout') {
    try {
      await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
      authStore.logout()
      router.push('/login')
    } catch {
      // 用户取消
    }
  } else if (command === 'changePassword') {
    changePasswordVisible.value = true
  } else if (command === 'profile') {
    // 根据角色跳转
    if (authStore.isReferrer) {
      router.push('/my-info')
    } else {
      console.log('跳转到个人中心')
    }
  }
}

async function handleChangePassword() {
  if (!passwordFormRef.value) return

  await passwordFormRef.value.validate(async (valid) => {
    if (!valid) return

    changingPassword.value = true
    try {
      console.log('🔄 修改自己的密码...')
      console.log('📡 调用接口: POST /admin/users/me/change-password')
      
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
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 0 20px;

  // 移动端适配
  @media (max-width: 768px) {
    padding: 0 10px;
  }

  .left {
    display: flex;
    align-items: center;

    .hamburger {
      font-size: 20px;
      cursor: pointer;
      margin-right: 20px;
      transition: all 0.3s;

      &:hover {
        color: #409eff;
      }
      
      // 移动端
      @media (max-width: 768px) {
        margin-right: 10px;
      }
    }
    
    // 移动端隐藏面包屑
    :deep(.el-breadcrumb) {
      @media (max-width: 768px) {
        display: none;
      }
    }
  }

  .right {
    display: flex;
    align-items: center;

    .user-info {
      display: flex;
      align-items: center;
      cursor: pointer;
      padding: 0 12px;
      height: 40px;
      border-radius: 4px;
      transition: background-color 0.3s;

      &:hover {
        background-color: #f5f7fa;
      }

      .user-icon {
        font-size: 18px;
        margin-right: 8px;
      }

      .username {
        font-size: 14px;
        margin-right: 8px;
        
        // 移动端隐藏用户名文字
        @media (max-width: 480px) {
          display: none;
        }
      }

      .arrow-icon {
        font-size: 12px;
        
        @media (max-width: 480px) {
          display: none;
        }
      }
    }
  }
}
</style>

