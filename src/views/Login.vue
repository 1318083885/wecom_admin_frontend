<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <img src="/vite.svg" alt="Logo" class="logo" />
        <h1 class="title">企业微信群管理系统</h1>
        <p class="subtitle">Enterprise WeChat Group Management System</p>
      </div>

      <el-form
        ref="formRef"
        :model="loginForm"
        :rules="rules"
        class="login-form"
        @keyup.enter="handleLogin"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            size="large"
            clearable
          >
            <template #prefix>
              <el-icon><User /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            size="large"
            show-password
            clearable
          >
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            size="large"
            :loading="loading"
            class="login-button"
            @click="handleLogin"
          >
            {{ loading ? '登录中...' : '登 录' }}
          </el-button>
        </el-form-item>
      </el-form>

      <div class="login-footer">
        <p>默认账号：admin / admin123</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const formRef = ref<FormInstance>()
const loading = ref(false)

const loginForm = reactive({
  username: '',
  password: '',
})

const rules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' },
  ],
}

async function handleLogin() {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    loading.value = true
    try {
      console.log('%c开始登录...', 'color: #67C23A; font-weight: bold')
      const success = await authStore.login(loginForm)
      console.log('登录结果:', success)
      console.log('用户信息:', authStore.user)
      console.log('权限:', authStore.permissions)

      if (success) {
        ElMessage.success('登录成功！')
        // 跳转到原来要访问的页面或首页
        const redirect = (route.query.redirect as string) || '/dashboard'
        console.log('准备跳转到:', redirect)
        
        // 使用 nextTick 确保状态更新后再跳转
        await new Promise(resolve => setTimeout(resolve, 100))
        
        console.log('执行跳转...')
        await router.push(redirect)
        console.log('跳转完成')
      } else {
        ElMessage.error('用户名或密码错误')
      }
    } catch (error) {
      console.error('登录失败:', error)
      ElMessage.error('登录失败，请稍后重试')
    } finally {
      loading.value = false
    }
  })
}
</script>

<style lang="scss" scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;

  .login-box {
    width: 100%;
    max-width: 420px;
    padding: 40px;
    background: #fff;
    border-radius: 10px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    
    // 移动端适配
    @media (max-width: 480px) {
      padding: 30px 20px;
    }

    .login-header {
      text-align: center;
      margin-bottom: 30px;

      .logo {
        width: 64px;
        height: 64px;
        margin-bottom: 10px;
        
        @media (max-width: 480px) {
          width: 48px;
          height: 48px;
        }
      }

      .title {
        font-size: 24px;
        font-weight: 600;
        color: #303133;
        margin: 0 0 8px 0;
        
        @media (max-width: 480px) {
          font-size: 20px;
        }
      }

      .subtitle {
        font-size: 14px;
        color: #909399;
        margin: 0;
        
        @media (max-width: 480px) {
          font-size: 12px;
        }
      }
    }

    .login-form {
      .login-button {
        width: 100%;
        margin-top: 10px;
      }
    }

    .login-footer {
      text-align: center;
      margin-top: 20px;
      font-size: 12px;
      color: #909399;
    }
  }
}
</style>

