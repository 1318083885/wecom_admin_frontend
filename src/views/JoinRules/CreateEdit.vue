<template>
  <div class="create-edit-page">
    <el-page-header @back="goBack">
      <template #content>
        <span class="page-title">{{ isEdit ? '编辑规则' : '创建规则' }}</span>
      </template>
    </el-page-header>

    <el-card class="mt-20">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="120px">
        <el-form-item label="规则名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入规则名称" style="width: 400px" />
        </el-form-item>

        <el-form-item label="所属业务线" prop="business_line_id">
          <el-select
            v-model="formData.business_line_id"
            placeholder="请选择业务线"
            style="width: 400px"
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

        <el-form-item label="目标群组" prop="target_group_ids">
          <div style="width: 600px">
            <el-alert
              v-if="!formData.business_line_id"
              title="请先选择业务线"
              type="warning"
              :closable="false"
              style="margin-bottom: 12px"
            />
            <el-checkbox-group v-else v-model="formData.target_group_ids">
              <el-checkbox
                v-for="group in availableGroups"
                :key="group.chat_id"
                :label="group.chat_id"
                style="width: 100%; margin: 8px 0"
              >
                <div class="group-option">
                  <span class="group-name">{{ group.name }}</span>
                  <el-tag :type="getGroupStatusType(group)" size="small" style="margin-left: 8px">
                    {{ group.member_count }} / {{ group.max_members }}
                  </el-tag>
                  <el-tag
                    v-if="group.status"
                    :type="getStatusType(group.status)"
                    size="small"
                    style="margin-left: 4px"
                  >
                    {{ getStatusText(group.status) }}
                  </el-tag>
                </div>
              </el-checkbox>
            </el-checkbox-group>
            <div v-if="availableGroups.length === 0 && formData.business_line_id" class="empty-tip">
              <el-empty description="该业务线下暂无可用群组" :image-size="100" />
            </div>
            <div v-if="formData.target_group_ids && formData.target_group_ids.length > 0" class="selected-tip">
              <el-tag type="success">已选择 {{ formData.target_group_ids.length }} 个群组</el-tag>
            </div>
          </div>
        </el-form-item>

        <el-form-item label="选择策略" prop="selection_strategy">
          <el-radio-group v-model="formData.selection_strategy">
            <el-radio label="round_robin">轮询</el-radio>
            <el-radio label="random">随机</el-radio>
            <el-radio label="load_balance">负载均衡</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="每次分配群数" prop="groups_per_assignment">
          <el-input-number v-model="formData.groups_per_assignment" :min="1" :max="10" />
        </el-form-item>

        <el-form-item label="状态" prop="is_active">
          <el-switch v-model="formData.is_active" active-text="启用" inactive-text="禁用" />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :loading="submitting" @click="handleSubmit">
            {{ isEdit ? '更新' : '创建' }}
          </el-button>
          <el-button @click="goBack">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { joinRulesAPI } from '@/api/join-rules'
import { businessLinesAPI } from '@/api/business-lines'
import { groupsAPI } from '@/api/groups'
import type { JoinRule, BusinessLine, Group } from '@/types/business'

const route = useRoute()
const router = useRouter()

const isEdit = computed(() => !!route.params.id)
const ruleId = computed(() => (route.params.id ? Number(route.params.id) : null))

const formRef = ref<FormInstance>()
const submitting = ref(false)
const businessLines = ref<BusinessLine[]>([])
const availableGroups = ref<Group[]>([])
const loadingGroups = ref(false)

const formData = reactive<Partial<JoinRule> & { target_group_ids?: string[] }>({
  name: '',
  business_line_id: undefined,
  target_group_ids: [],
  selection_strategy: 'round_robin',
  groups_per_assignment: 3,
  is_active: true,
})

const formRules: FormRules = {
  name: [{ required: true, message: '请输入规则名称', trigger: 'blur' }],
  business_line_id: [{ required: true, message: '请选择业务线', trigger: 'change' }],
  target_group_ids: [
    {
      required: true,
      message: '请至少选择一个目标群组',
      trigger: 'change',
      validator: (rule, value, callback) => {
        if (!value || value.length === 0) {
          callback(new Error('请至少选择一个目标群组'))
        } else {
          callback()
        }
      },
    },
  ],
  selection_strategy: [{ required: true, message: '请选择选择策略', trigger: 'change' }],
  groups_per_assignment: [{ required: true, message: '请输入每次分配群数', trigger: 'blur' }],
}

onMounted(async () => {
  await loadBusinessLines()
  if (isEdit.value && ruleId.value) {
    await loadDetail()
  }
})

async function loadBusinessLines() {
  try {
    const response = await businessLinesAPI.getList()
    if (response.success && response.data) {
      // 从 data.items 或直接从 data 获取
      businessLines.value = response.data.items || response.data
    }
  } catch (error) {
    console.error('加载业务线列表失败:', error)
  }
}

async function loadDetail() {
  try {
    const response: any = await joinRulesAPI.getDetail(ruleId.value!)
    console.log('📝 加载规则详情响应:', response)
    
    let ruleData = null
    
    // 后端直接返回对象（不包装）
    if (response.id) {
      ruleData = response
      console.log('✅ 使用直接返回的对象')
    } else if (response.success && response.data) {
      // 包装格式
      ruleData = response.data
      console.log('✅ 使用包装格式的data')
    }
    
    if (ruleData) {
      // 填充表单数据
      formData.name = ruleData.name
      formData.business_line_id = ruleData.business_line_id
      formData.target_group_ids = ruleData.target_group_ids || []
      formData.selection_strategy = ruleData.selection_strategy
      formData.groups_per_assignment = ruleData.groups_per_assignment
      formData.is_active = ruleData.is_active
      
      console.log('📋 表单数据已填充:', formData)
      
      // 加载该业务线的群组
      if (formData.business_line_id) {
        await loadGroupsByBusinessLine(formData.business_line_id)
      }
    } else {
      console.error('❌ 无法提取规则数据:', response)
      ElMessage.error('数据格式错误')
    }
  } catch (error) {
    console.error('❌ 加载规则详情失败:', error)
    ElMessage.error('加载规则详情失败')
  }
}

async function handleBusinessLineChange(businessLineId: number) {
  console.log('业务线变更:', businessLineId)
  formData.target_group_ids = []
  await loadGroupsByBusinessLine(businessLineId)
}

async function loadGroupsByBusinessLine(businessLineId: number) {
  loadingGroups.value = true
  try {
    const response = await groupsAPI.getList({
      business_line_id: businessLineId,
      page: 1,
      page_size: 100,
    })
    console.log('群组列表响应:', response)
    
    if (response.success && response.data) {
      availableGroups.value = response.data.items || response.data || []
      console.log('✅ 加载了', availableGroups.value.length, '个可用群组')
    }
  } catch (error) {
    console.error('加载群组列表失败:', error)
    ElMessage.error('加载群组列表失败')
  } finally {
    loadingGroups.value = false
  }
}

function getGroupStatusType(group: Group): 'success' | 'warning' | 'danger' {
  const ratio = group.member_count / (group.max_members || 200)
  if (ratio >= 0.9) return 'danger'
  if (ratio >= 0.7) return 'warning'
  return 'success'
}

function getStatusType(status: string): 'success' | 'warning' | 'info' {
  const map: Record<string, 'success' | 'warning' | 'info'> = {
    active: 'success',
    full: 'warning',
    inactive: 'info',
  }
  return map[status] || 'info'
}

function getStatusText(status: string): string {
  const map: Record<string, string> = {
    active: '活跃',
    full: '已满',
    inactive: '非活跃',
  }
  return map[status] || status
}

async function handleSubmit() {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    submitting.value = true
    try {
      if (isEdit.value && ruleId.value) {
        await joinRulesAPI.update(ruleId.value, formData)
        ElMessage.success('更新成功')
      } else {
        await joinRulesAPI.create(formData)
        ElMessage.success('创建成功')
      }
      router.push('/join-rules')
    } catch (error) {
      console.error('提交失败:', error)
    } finally {
      submitting.value = false
    }
  })
}

function goBack() {
  router.back()
}
</script>

<style lang="scss" scoped>
.create-edit-page {
  .page-title {
    font-weight: 600;
    font-size: 16px;
  }

  .group-option {
    display: flex;
    align-items: center;
    width: 100%;

    .group-name {
      flex: 1;
      font-size: 14px;
    }
  }

  .empty-tip {
    padding: 20px 0;
  }

  .selected-tip {
    margin-top: 12px;
  }

  :deep(.el-checkbox) {
    height: auto;
    
    .el-checkbox__label {
      width: 100%;
    }
  }
}
</style>

