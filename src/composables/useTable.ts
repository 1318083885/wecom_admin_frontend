import { ref, reactive } from 'vue'

export interface PaginationConfig {
  page: number
  pageSize: number
  total: number
}

export interface UseTableOptions {
  initialPageSize?: number
  onLoad?: (params: any) => Promise<any>
}

export function useTable(options: UseTableOptions = {}) {
  const loading = ref(false)
  const tableData = ref<any[]>([])

  const pagination = reactive<PaginationConfig>({
    page: 1,
    pageSize: options.initialPageSize || 20,
    total: 0,
  })

  async function loadData(params: any = {}) {
    if (!options.onLoad) return

    loading.value = true
    try {
      const response = await options.onLoad({
        page: pagination.page,
        page_size: pagination.pageSize,
        ...params,
      })

      if (response.success && response.data) {
        if (Array.isArray(response.data)) {
          tableData.value = response.data
        } else if (response.data.items) {
          tableData.value = response.data.items
          pagination.total = response.data.total || 0
        }
      }
    } catch (error) {
      console.error('加载数据失败:', error)
    } finally {
      loading.value = false
    }
  }

  function handlePageChange() {
    loadData()
  }

  function handleSizeChange() {
    pagination.page = 1
    loadData()
  }

  function refresh() {
    loadData()
  }

  function reset() {
    pagination.page = 1
    loadData()
  }

  return {
    loading,
    tableData,
    pagination,
    loadData,
    handlePageChange,
    handleSizeChange,
    refresh,
    reset,
  }
}

