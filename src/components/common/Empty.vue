<template>
  <div class="empty-container">
    <el-empty :description="description" :image-size="imageSize">
      <template v-if="$slots.default">
        <slot />
      </template>
      <template v-else-if="showAction">
        <el-button type="primary" @click="handleAction">{{ actionText }}</el-button>
      </template>
    </el-empty>
  </div>
</template>

<script setup lang="ts">
interface Props {
  description?: string
  imageSize?: number
  showAction?: boolean
  actionText?: string
}

withDefaults(defineProps<Props>(), {
  description: '暂无数据',
  imageSize: 200,
  showAction: false,
  actionText: '刷新',
})

const emit = defineEmits<{
  action: []
}>()

function handleAction() {
  emit('action')
}
</script>

<style lang="scss" scoped>
.empty-container {
  padding: 40px 0;
}
</style>

