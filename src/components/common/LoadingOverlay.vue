<template>
  <div v-if="visible" class="loading-overlay">
    <el-loading
      :text="text"
      :spinner="spinner"
      :svg="svg"
      :svg-view-box="svgViewBox"
      :background="background"
      fullscreen
    />
  </div>
</template>

<script setup lang="ts">
interface Props {
  visible: boolean
  text?: string
  spinner?: string
  svg?: string
  svgViewBox?: string
  background?: string
}

withDefaults(defineProps<Props>(), {
  text: '加载中...',
  background: 'rgba(0, 0, 0, 0.7)',
})
</script>

<style lang="scss" scoped>
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2000;
}
</style>

