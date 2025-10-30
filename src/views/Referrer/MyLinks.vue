<template>
  <div class="my-links-page">
    <el-card>
      <template #header>
        <div class="card-title">我的推广链接</div>
      </template>

      <!-- 筛选 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="状态">
          <el-select v-model="searchForm.is_active" placeholder="全部" clearable style="width: 120px">
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

      <!-- 数据表格 -->
      <el-table v-loading="loading" :data="tableData" stripe>
        <el-table-column prop="short_code" label="短码" width="120">
          <template #default="{ row }">
            <el-tag>{{ row.short_code }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="short_url" label="短链接" min-width="250" show-overflow-tooltip>
          <template #default="{ row }">
            <el-link :href="row.short_url" target="_blank" type="primary">
              {{ row.short_url }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="备注" min-width="150" show-overflow-tooltip />
        <el-table-column prop="access_count" label="点击数" width="100" sortable />
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
        <el-table-column prop="expires_at" label="过期时间" width="180">
          <template #default="{ row }">
            {{ row.expires_at ? formatDateTime(row.expires_at) : '永久有效' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" link @click="handleCopy(row.short_url)">
              复制链接
            </el-button>
            <el-button size="small" type="success" link @click="handleViewStats(row)">
              查看统计
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
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          @current-change="loadData"
          @size-change="handleSizeChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { referrerSelfAPI, type ReferrerShortUrl } from '@/api/referrer-self'
import { formatDateTime } from '@/utils/format'

const router = useRouter()
const loading = ref(false)
const tableData = ref<ReferrerShortUrl[]>([])

const searchForm = reactive({
  is_active: undefined as boolean | undefined,
})

const pagination = reactive({
  page: 1,
  page_size: 20,
  total: 0,
})

onMounted(() => {
  loadData()
})

async function loadData() {
  loading.value = true
  try {
    const skip = (pagination.page - 1) * pagination.page_size
    const response = await referrerSelfAPI.getMyShortUrls({
      is_active: searchForm.is_active,
      skip,
      limit: pagination.page_size,
    })

    if (response.success && response.data) {
      tableData.value = response.data.items
      pagination.total = response.data.total
      console.log('✅ 我的短链接:', tableData.value)
    }
  } catch (error) {
    console.error('加载短链接失败:', error)
    ElMessage.error('加载短链接失败')
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  pagination.page = 1
  loadData()
}

function handleReset() {
  searchForm.is_active = undefined
  handleSearch()
}

function handleSizeChange() {
  pagination.page = 1
  loadData()
}

async function handleCopy(url: string) {
  try {
    await navigator.clipboard.writeText(url)
    ElMessage.success('链接已复制到剪贴板')
  } catch (error) {
    console.error('复制失败:', error)
    ElMessage.error('复制失败，请手动复制')
  }
}

function handleViewStats(row: ReferrerShortUrl) {
  // 跳转到短链接统计页面（可以复用管理员的统计页面）
  router.push(`/short-urls/${row.short_code}/stats`)
}
</script>

<style lang="scss" scoped>
.my-links-page {
  .card-title {
    font-weight: 600;
    font-size: 16px;
  }

  .flex-between {
    display: flex;
    justify-content: space-between;
    align-items: center;
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
</style>

