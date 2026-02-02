<template>
  <div class="config-container">
    <t-tabs v-model="activeTab" theme="card">
      <!-- 系统配置 -->
      <t-tab-panel value="system" label="系统配置">
        <t-card>
          <div class="config-header">
            <t-button theme="primary" size="medium" @click="handleCreateConfig">
              <template #icon>
                <t-icon name="add" />
              </template>
              新增配置
            </t-button>
          </div>

          <!-- 搜索栏 -->
          <div class="search-bar">
            <t-form :data="searchForm" layout="inline" @submit="handleSearch" @reset="handleReset">
              <t-form-item label="配置键" name="configKey">
                <t-input v-model="searchForm.configKey" placeholder="请输入配置键" clearable />
              </t-form-item>
              <t-form-item label="配置名称" name="configName">
                <t-input v-model="searchForm.configName" placeholder="请输入配置名称" clearable />
              </t-form-item>
              <t-form-item label="配置分组" name="configGroup">
                <t-input v-model="searchForm.configGroup" placeholder="请输入配置分组" clearable />
              </t-form-item>
              <t-form-item>
                <t-button theme="primary" type="submit">查询</t-button>
                <t-button theme="default" type="reset" style="margin-left: 8px">重置</t-button>
              </t-form-item>
            </t-form>
          </div>

          <t-table
            :data="configList"
            :columns="configColumns"
            :loading="configLoading"
            row-key="id"
            stripe
            hover
          >
            <template #isSystem="{ row }">
              <t-tag
                :theme="row.isSystem === 1 ? 'warning' : 'default'"
                size="small"
              >
                {{ row.isSystem === 1 ? '是' : '否' }}
              </t-tag>
            </template>

            <template #status="{ row }">
              <t-tag
                :theme="row.status === 1 ? 'success' : 'default'"
                size="small"
              >
                {{ row.status === 1 ? '启用' : '禁用' }}
              </t-tag>
            </template>

            <template #operation="{ row }">
              <t-button theme="primary" variant="text" @click="handleEditConfig(row)">
                编辑
              </t-button>
              <t-button
                theme="danger"
                variant="text"
                :disabled="row.isSystem === 1"
                @click="handleDeleteConfig(row)"
              >
                删除
              </t-button>
            </template>
          </t-table>

          <!-- 分页 -->
          <div class="pagination-container">
            <t-pagination
              v-model="pagination.current"
              v-model:page-size="pagination.pageSize"
              :total="pagination.total"
              :page-size-options="[10, 20, 50, 100]"
              show-page-size
              show-page-number
              show-jumper
              @change="handlePageChange"
              @page-size-change="handlePageSizeChange"
            />
          </div>
        </t-card>
      </t-tab-panel>

      <!-- 字段配置 -->
      <t-tab-panel value="field" label="字段配置">
        <t-card>
          <div class="field-config-header">
            <t-select
              v-model="selectedModule"
              placeholder="请选择模块"
              style="width: 200px"
              @change="loadFieldConfigList"
            >
              <t-option value="issue" label="工作项" />
              <t-option value="task" label="任务" />
            </t-select>
            <t-button
              theme="primary"
              :disabled="!selectedModule || !hasFieldChanges"
              @click="handleBatchSave"
            >
              批量保存
            </t-button>
          </div>

          <t-alert theme="info" v-if="!selectedModule" style="margin: 16px 0">
            请先选择一个模块
          </t-alert>

          <t-table
            v-else
            :data="fieldConfigList"
            :columns="fieldColumns"
            :loading="fieldLoading"
            row-key="id"
            stripe
            hover
          >
            <template #isVisible="{ row }">
              <t-switch v-model="row.isVisible" :custom-value="[1, 0]" @change="markFieldChanged(row)" />
            </template>

            <template #isRequired="{ row }">
              <t-switch v-model="row.isRequired" :custom-value="[1, 0]" @change="markFieldChanged(row)" />
            </template>

            <template #isEditable="{ row }">
              <t-switch v-model="row.isEditable" :custom-value="[1, 0]" @change="markFieldChanged(row)" />
            </template>

            <template #status="{ row }">
              <t-tag
                :theme="row.status === 1 ? 'success' : 'default'"
                size="small"
              >
                {{ row.status === 1 ? '启用' : '禁用' }}
              </t-tag>
            </template>
          </t-table>
        </t-card>
      </t-tab-panel>
    </t-tabs>

    <!-- 配置表单弹窗 -->
    <t-dialog
      v-model:visible="showConfigDialog"
      :header="configFormTitle"
      width="600px"
      :confirm-btn="{ content: '确定', loading: configFormLoading }"
      @confirm="handleConfirmConfig"
    >
      <t-form ref="configFormRef" :data="configFormData" :rules="configFormRules" label-width="120px">
        <t-form-item label="配置键" name="configKey">
          <t-input v-model="configFormData.configKey" placeholder="请输入配置键" />
        </t-form-item>
        <t-form-item label="配置名称" name="configName">
          <t-input v-model="configFormData.configName" placeholder="请输入配置名称" />
        </t-form-item>
        <t-form-item label="配置值" name="configValue">
          <t-textarea v-model="configFormData.configValue" placeholder="请输入配置值" :autosize="{ minRows: 3, maxRows: 6 }" />
        </t-form-item>
        <t-form-item label="配置类型" name="configType">
          <t-select v-model="configFormData.configType" placeholder="请选择配置类型">
            <t-option value="string" label="字符串" />
            <t-option value="number" label="数字" />
            <t-option value="boolean" label="布尔" />
            <t-option value="json" label="JSON" />
          </t-select>
        </t-form-item>
        <t-form-item label="配置分组" name="configGroup">
          <t-input v-model="configFormData.configGroup" placeholder="请输入配置分组" />
        </t-form-item>
        <t-form-item label="描述" name="description">
          <t-textarea v-model="configFormData.description" placeholder="请输入描述" :autosize="{ minRows: 2, maxRows: 4 }" />
        </t-form-item>
        <t-form-item label="是否系统内置" name="isSystem">
          <t-radio-group v-model="configFormData.isSystem">
            <t-radio :value="1">是</t-radio>
            <t-radio :value="0">否</t-radio>
          </t-radio-group>
        </t-form-item>
        <t-form-item label="状态" name="status">
          <t-radio-group v-model="configFormData.status">
            <t-radio :value="1">启用</t-radio>
            <t-radio :value="0">禁用</t-radio>
          </t-radio-group>
        </t-form-item>
      </t-form>
    </t-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { MessagePlugin, DialogPlugin } from 'tdesign-vue-next'
import {
  getConfigPage,
  addConfig,
  updateConfig,
  deleteConfig,
  getFieldConfigList,
  batchUpdateFieldConfig
} from '@/api/admin/rbac.js'

const activeTab = ref('system')
const configLoading = ref(false)
const fieldLoading = ref(false)
const configFormLoading = ref(false)
const showConfigDialog = ref(false)
const configFormRef = ref(null)
const currentConfigEdit = ref(null)
const selectedModule = ref('')
const changedFields = ref(new Set())

// 搜索表单
const searchForm = ref({
  configKey: '',
  configName: '',
  configGroup: ''
})

// 分页
const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0
})

// 配置列表
const configList = ref([])

// 配置表格列
const configColumns = [
  {
    colKey: 'configKey',
    title: '配置键',
    width: 200,
    align: 'left'
  },
  {
    colKey: 'configName',
    title: '配置名称',
    width: 150,
    align: 'center'
  },
  {
    colKey: 'configValue',
    title: '配置值',
    ellipsis: true,
    align: 'left'
  },
  {
    colKey: 'configType',
    title: '类型',
    width: 100,
    align: 'center'
  },
  {
    colKey: 'configGroup',
    title: '分组',
    width: 120,
    align: 'center'
  },
  {
    colKey: 'isSystem',
    title: '系统内置',
    width: 100,
    align: 'center'
  },
  {
    colKey: 'status',
    title: '状态',
    width: 100,
    align: 'center'
  },
  {
    colKey: 'operation',
    title: '操作',
    width: 150,
    align: 'center',
    fixed: 'right'
  }
]

// 字段配置列表
const fieldConfigList = ref([])

// 字段配置表格列
const fieldColumns = [
  {
    colKey: 'fieldName',
    title: '字段名称',
    width: 150,
    align: 'center'
  },
  {
    colKey: 'fieldCode',
    title: '字段编码',
    width: 150,
    align: 'center'
  },
  {
    colKey: 'fieldType',
    title: '字段类型',
    width: 120,
    align: 'center'
  },
  {
    colKey: 'isVisible',
    title: '可见',
    width: 100,
    align: 'center'
  },
  {
    colKey: 'isRequired',
    title: '必填',
    width: 100,
    align: 'center'
  },
  {
    colKey: 'isEditable',
    title: '可编辑',
    width: 100,
    align: 'center'
  },
  {
    colKey: 'sortOrder',
    title: '排序',
    width: 80,
    align: 'center'
  },
  {
    colKey: 'status',
    title: '状态',
    width: 100,
    align: 'center'
  }
]

// 配置表单
const configFormData = ref({
  configKey: '',
  configName: '',
  configValue: '',
  configType: 'string',
  configGroup: 'system',
  description: '',
  isSystem: 0,
  status: 1
})

const configFormRules = {
  configKey: [{ required: true, message: '请输入配置键', trigger: 'blur' }],
  configName: [{ required: true, message: '请输入配置名称', trigger: 'blur' }]
}

const configFormTitle = computed(() => currentConfigEdit.value ? '编辑配置' : '新增配置')

const hasFieldChanges = computed(() => changedFields.value.size > 0)

// 加载配置列表
const loadConfigList = async () => {
  configLoading.value = true
  try {
    const params = {
      current: pagination.value.current,
      pageSize: pagination.value.pageSize,
      ...searchForm.value
    }
    const res = await getConfigPage(params)
    configList.value = res.data.records
    pagination.value.total = res.data.total
  } catch (error) {
    await MessagePlugin.error('加载配置列表失败')
  } finally {
    configLoading.value = false
  }
}

// 加载字段配置列表
const loadFieldConfigList = async () => {
  if (!selectedModule.value) return

  fieldLoading.value = true
  changedFields.value.clear()
  try {
    const res = await getFieldConfigList(selectedModule.value)
    fieldConfigList.value = res.data
  } catch (error) {
    await MessagePlugin.error('加载字段配置失败')
  } finally {
    fieldLoading.value = false
  }
}

// 标记字段已修改
const markFieldChanged = (row) => {
  changedFields.value.add(row.id)
}

// 搜索
const handleSearch = () => {
  pagination.value.current = 1
  loadConfigList()
}

// 重置
const handleReset = () => {
  searchForm.value = {
    configKey: '',
    configName: '',
    configGroup: ''
  }
  pagination.value.current = 1
  loadConfigList()
}

// 分页改变
const handlePageChange = (pageInfo) => {
  pagination.value.current = pageInfo.current
  loadConfigList()
}

const handlePageSizeChange = (pageSize) => {
  pagination.value.pageSize = pageSize
  pagination.value.current = 1
  loadConfigList()
}

// 新增配置
const handleCreateConfig = () => {
  currentConfigEdit.value = null
  configFormData.value = {
    configKey: '',
    configName: '',
    configValue: '',
    configType: 'string',
    configGroup: 'system',
    description: '',
    isSystem: 0,
    status: 1
  }
  showConfigDialog.value = true
}

// 编辑配置
const handleEditConfig = (row) => {
  currentConfigEdit.value = row
  configFormData.value = {
    id: row.id,
    configKey: row.configKey,
    configName: row.configName,
    configValue: row.configValue,
    configType: row.configType,
    configGroup: row.configGroup,
    description: row.description,
    isSystem: row.isSystem,
    status: row.status
  }
  showConfigDialog.value = true
}

// 删除配置
const handleDeleteConfig = (row) => {
  const dialog = DialogPlugin.confirm({
    header: '确认删除',
    body: `确定要删除配置 "${row.configName}" 吗？`,
    confirmBtn: '删除',
    cancelBtn: '取消',
    onConfirm: async () => {
      try {
        await deleteConfig(row.id)
        await MessagePlugin.success('删除成功')
        loadConfigList()
        dialog.hide()
      } catch (error) {
        await MessagePlugin.error('删除失败')
      }
    }
  })
}

// 确认配置表单
const handleConfirmConfig = async () => {
  const valid = await configFormRef.value?.validate()
  if (!valid) return

  configFormLoading.value = true
  try {
    if (currentConfigEdit.value) {
      await updateConfig(currentConfigEdit.value.id, configFormData.value)
      await MessagePlugin.success('更新成功')
    } else {
      await addConfig(configFormData.value)
      await MessagePlugin.success('创建成功')
    }
    showConfigDialog.value = false
    loadConfigList()
  } catch (error) {
    await MessagePlugin.error(currentConfigEdit.value ? '更新失败' : '创建失败')
  } finally {
    configFormLoading.value = false
  }
}

// 批量保存字段配置
const handleBatchSave = async () => {
  const configs = fieldConfigList.value
    .filter(item => changedFields.value.has(item.id))
    .map(item => ({
      id: item.id,
      isVisible: item.isVisible,
      isRequired: item.isRequired,
      isEditable: item.isEditable
    }))

  try {
    await batchUpdateFieldConfig({ configs })
    await MessagePlugin.success('保存成功')
    changedFields.value.clear()
    loadFieldConfigList()
  } catch (error) {
    await MessagePlugin.error('保存失败')
  }
}

onMounted(() => {
  loadConfigList()
})
</script>

<style scoped lang="less">
.config-container {
  padding: 2px;
}

.config-header,
.field-config-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.search-bar {
  margin-bottom: 16px;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 4px;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
