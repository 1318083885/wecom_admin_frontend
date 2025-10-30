<template>
  <div class="error-page">
    <div class="error-content">
      <h1 class="error-code">403</h1>
      <h2 class="error-title">权限不足</h2>
      <p class="error-message">抱歉，您没有权限访问该页面</p>
      <el-button type="primary" @click="goBack">返回上一页</el-button>
      <el-button @click="goHome">返回首页</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function goBack() {
  router.go(-1)
}

function goHome() {
  router.push('/dashboard')
}
</script>

<style lang="scss" scoped>
.error-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: #f5f7fa;

  .error-content {
    text-align: center;

    .error-code {
      font-size: 120px;
      font-weight: 700;
      color: #409eff;
      margin: 0;
      line-height: 1;
    }

    .error-title {
      font-size: 32px;
      color: #303133;
      margin: 20px 0;
    }

    .error-message {
      font-size: 16px;
      color: #606266;
      margin-bottom: 30px;
    }
  }
}
</style>

