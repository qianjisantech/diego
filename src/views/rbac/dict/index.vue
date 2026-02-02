<template>
  <div class="dict-container">
    <div class="dict-layout">
      <!-- 左侧：字典类型列表 -->
      <t-card class="dict-type-card">
        <div class="card-header">
          <h4>字典类型</h4>
          <t-button
            v-permission="'rbac:dict:add'"
            theme="primary"
            size="small"
            @click="handleCreateType"
          >
            <template #icon>
              <t-icon name="add" />
            </template>
            新增
          </t-button>
        </div>

        <t-list :split="true" class="dict-type-list">
          <t-list-item
            v-for="item in dictTypeList"
            :key="item.id"
            :class="{ 'active-item': currentDictType?.id === item.id }"
            @click="handleSelectType(item)"
          >
            <t-list-item-meta :title="item.dictName" :description="item.dictCode" />
            <template #action>
              <t-space>
                <t-button
                  v-permission="'rbac:dict:edit'"
                  theme="primary"
                  variant="text"
                  size="small"
                  @click.stop="handleEditType(item)"
                >
                  编辑
                </t-button>
                <t-button
                  v-permission="'rbac:dict:delete'"
                  theme="danger"
                  variant="text"
                  size="small"
                  @click.stop="handleDeleteType(item)"
                >
                  删除
                </t-button>
              </t-space>
            </template>
          </t-list-item>
        </t-list>

        <!-- 分页 -->
        <div class="pagination-container" v-if="typePagination.total > 0">
          <t-pagination
            v-model="typePagination.current"
            v-model:page-size="typePagination.pageSize"
            :total="typePagination.total"
            :page-size-options="[10, 20, 50]"
            size="small"
            @change="loadDictTypeList"
          />
        </div>
      </t-card>

      <!-- 右侧：字典数据列表 -->
      <t-card class="dict-data-card">
        <div class="card-header">
          <h4>字典数据</h4>
          <t-button
            v-permission="'rbac:dict:add'"
            theme="primary"
            size="small"
            :disabled="!currentDictType"
            @click="handleCreateData"
          >
            <template #icon>
              <t-icon name="add" />
            </template>
            新增
          </t-button>
        </div>

        <t-alert theme="info" v-if="!currentDictType" style="margin-bottom: 16px">
          请先在左侧选择一个字典类型
        </t-alert>

        <t-table
          v-else
          :data="dictDataList"
          :columns="dataColumns"
          :loading="dataLoading"
          row-key="id"
          stripe
          hover
        >
          <template #isDefault="{ row }">
            <t-tag
              :theme="row.isDefault === 1 ? 'warning' : 'default'"
              size="small"
            >
              {{ row.isDefault === 1 ? '是' : '否' }}
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
            <t-button
              v-permission="'rbac:dict:edit'"
              theme="primary"
              variant="text"
              @click="handleEditData(row)"
            >
              编辑
            </t-button>
            <t-button
              v-permission="'rbac:dict:delete'"
              theme="danger"
              variant="text"
              @click="handleDeleteData(row)"
            >
              删除
            </t-button>
          </template>
        </t-table>
      </t-card>
    </div>

    <!-- 字典类型表单弹窗 -->
    <t-dialog
      v-model:visible="showTypeDialog"
      :header="typeFormTitle"
      width="500px"
      :confirm-btn="{ content: '确定', loading: typeFormLoading }"
      @confirm="handleConfirmType"
    >
      <t-form ref="typeFormRef" :data="typeFormData" :rules="typeFormRules" label-width="100px">
        <t-form-item label="字典编码" name="dictCode">
          <t-input v-model="typeFormData.dictCode" placeholder="请输入字典编码" />
        </t-form-item>
        <t-form-item label="字典名称" name="dictName">
          <t-input v-model="typeFormData.dictName" placeholder="请输入字典名称" />
        </t-form-item>
        <t-form-item label="描述" name="description">
          <t-textarea v-model="typeFormData.description" placeholder="请输入描述" :autosize="{ minRows: 2, maxRows: 4 }" />
        </t-form-item>
        <t-form-item label="状态" name="status">
          <t-radio-group v-model="typeFormData.status">
            <t-radio :value="1">启用</t-radio>
            <t-radio :value="0">禁用</t-radio>
          </t-radio-group>
        </t-form-item>
      </t-form>
    </t-dialog>

    <!-- 字典数据表单弹窗 -->
    <t-dialog
      v-model:visible="showDataDialog"
      :header="dataFormTitle"
      width="500px"
      :confirm-btn="{ content: '确定', loading: dataFormLoading }"
      @confirm="handleConfirmData"
    >
      <t-form ref="dataFormRef" :data="dataFormData" :rules="dataFormRules" label-width="100px">
        <t-form-item label="字典标签" name="dictLabel">
          <t-input v-model="dataFormData.dictLabel" placeholder="请输入字典标签" />
        </t-form-item>
        <t-form-item label="字典值" name="dictValue">
          <t-input v-model="dataFormData.dictValue" placeholder="请输入字典值" />
        </t-form-item>
        <t-form-item label="排序" name="sortOrder">
          <t-input-number v-model="dataFormData.sortOrder" :min="0" />
        </t-form-item>
        <t-form-item label="是否默认" name="isDefault">
          <t-radio-group v-model="dataFormData.isDefault">
            <t-radio :value="1">是</t-radio>
            <t-radio :value="0">否</t-radio>
          </t-radio-group>
        </t-form-item>
        <t-form-item label="状态" name="status">
          <t-radio-group v-model="dataFormData.status">
            <t-radio :value="1">启用</t-radio>
            <t-radio :value="0">禁用</t-radio>
          </t-radio-group>
        </t-form-item>
        <t-form-item label="备注" name="remark">
          <t-textarea v-model="dataFormData.remark" placeholder="请输入备注" :autosize="{ minRows: 2, maxRows: 4 }" />
        </t-form-item>
      </t-form>
    </t-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { MessagePlugin, DialogPlugin } from 'tdesign-vue-next'
import {
  getDictTypePage,
  addDictType,
  updateDictType,
  deleteDictType,
  getDictDataList,
  addDictData,
  updateDictData,
  deleteDictData
} from '@/api/admin/rbac.js'

const typeLoading = ref(false)
const dataLoading = ref(false)
const typeFormLoading = ref(false)
const dataFormLoading = ref(false)
const showTypeDialog = ref(false)
const showDataDialog = ref(false)
const typeFormRef = ref(null)
const dataFormRef = ref(null)
const currentDictType = ref(null)
const currentTypeEdit = ref(null)
const currentDataEdit = ref(null)

// 字典类型列表
const dictTypeList = ref([])
const typePagination = ref({
  current: 1,
  pageSize: 10,
  total: 0
})

// 字典数据列表
const dictDataList = ref([])

// 字典数据表格列
const dataColumns = [
  {
    colKey: 'dictLabel',
    title: '字典标签',
    width: 150,
    align: 'center'
  },
  {
    colKey: 'dictValue',
    title: '字典值',
    width: 150,
    align: 'center'
  },
  {
    colKey: 'sortOrder',
    title: '排序',
    width: 100,
    align: 'center'
  },
  {
    colKey: 'isDefault',
    title: '默认',
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
    colKey: 'remark',
    title: '备注',
    ellipsis: true,
    align: 'left'
  },
  {
    colKey: 'operation',
    title: '操作',
    width: 150,
    align: 'center',
    fixed: 'right'
  }
]

// 字典类型表单
const typeFormData = ref({
  dictCode: '',
  dictName: '',
  description: '',
  status: 1
})

const typeFormRules = {
  dictCode: [{ required: true, message: '请输入字典编码', trigger: 'blur' }],
  dictName: [{ required: true, message: '请输入字典名称', trigger: 'blur' }]
}

const typeFormTitle = computed(() => currentTypeEdit.value ? '编辑字典类型' : '新增字典类型')

// 字典数据表单
const dataFormData = ref({
  dictTypeId: null,
  dictLabel: '',
  dictValue: '',
  sortOrder: 0,
  isDefault: 0,
  status: 1,
  remark: ''
})

const dataFormRules = {
  dictLabel: [{ required: true, message: '请输入字典标签', trigger: 'blur' }],
  dictValue: [{ required: true, message: '请输入字典值', trigger: 'blur' }]
}

const dataFormTitle = computed(() => currentDataEdit.value ? '编辑字典数据' : '新增字典数据')

// 加载字典类型列表
const loadDictTypeList = async () => {
  typeLoading.value = true
  try {
    const params = {
      current: typePagination.value.current,
      pageSize: typePagination.value.pageSize
    }
    const res = await getDictTypePage(params)
    dictTypeList.value = res.data.records
    typePagination.value.total = res.data.total
  } catch (error) {
    await MessagePlugin.error('加载字典类型失败')
  } finally {
    typeLoading.value = false
  }
}

// 加载字典数据列表
const loadDictDataList = async () => {
  if (!currentDictType.value) return

  dataLoading.value = true
  try {
    const res = await getDictDataList(currentDictType.value.id)
    dictDataList.value = res.data
  } catch (error) {
    await MessagePlugin.error('加载字典数据失败')
  } finally {
    dataLoading.value = false
  }
}

// 选择字典类型
const handleSelectType = (item) => {
  currentDictType.value = item
  loadDictDataList()
}

// 新增字典类型
const handleCreateType = () => {
  currentTypeEdit.value = null
  typeFormData.value = {
    dictCode: '',
    dictName: '',
    description: '',
    status: 1
  }
  showTypeDialog.value = true
}

// 编辑字典类型
const handleEditType = (item) => {
  currentTypeEdit.value = item
  typeFormData.value = {
    id: item.id,
    dictCode: item.dictCode,
    dictName: item.dictName,
    description: item.description,
    status: item.status
  }
  showTypeDialog.value = true
}

// 删除字典类型
const handleDeleteType = (item) => {
  const dialog = DialogPlugin.confirm({
    header: '确认删除',
    body: `确定要删除字典类型 "${item.dictName}" 吗？`,
    confirmBtn: '删除',
    cancelBtn: '取消',
    onConfirm: async () => {
      try {
        await deleteDictType(item.id)
        await MessagePlugin.success('删除成功')
        if (currentDictType.value?.id === item.id) {
          currentDictType.value = null
          dictDataList.value = []
        }
        loadDictTypeList()
        dialog.hide()
      } catch (error) {
        await MessagePlugin.error('删除失败')
      }
    }
  })
}

// 确认字典类型表单
const handleConfirmType = async () => {
  const valid = await typeFormRef.value?.validate()
  if (!valid) return

  typeFormLoading.value = true
  try {
    if (currentTypeEdit.value) {
      await updateDictType(currentTypeEdit.value.id, typeFormData.value)
      await MessagePlugin.success('更新成功')
    } else {
      await addDictType(typeFormData.value)
      await MessagePlugin.success('创建成功')
    }
    showTypeDialog.value = false
    loadDictTypeList()
  } catch (error) {
    await MessagePlugin.error(currentTypeEdit.value ? '更新失败' : '创建失败')
  } finally {
    typeFormLoading.value = false
  }
}

// 新增字典数据
const handleCreateData = () => {
  currentDataEdit.value = null
  dataFormData.value = {
    dictTypeId: currentDictType.value.id,
    dictLabel: '',
    dictValue: '',
    sortOrder: 0,
    isDefault: 0,
    status: 1,
    remark: ''
  }
  showDataDialog.value = true
}

// 编辑字典数据
const handleEditData = (item) => {
  currentDataEdit.value = item
  dataFormData.value = {
    id: item.id,
    dictTypeId: item.dictTypeId,
    dictLabel: item.dictLabel,
    dictValue: item.dictValue,
    sortOrder: item.sortOrder,
    isDefault: item.isDefault,
    status: item.status,
    remark: item.remark
  }
  showDataDialog.value = true
}

// 删除字典数据
const handleDeleteData = (item) => {
  const dialog = DialogPlugin.confirm({
    header: '确认删除',
    body: `确定要删除字典数据 "${item.dictLabel}" 吗？`,
    confirmBtn: '删除',
    cancelBtn: '取消',
    onConfirm: async () => {
      try {
        await deleteDictData(item.id)
        await MessagePlugin.success('删除成功')
        loadDictDataList()
        dialog.hide()
      } catch (error) {
        await MessagePlugin.error('删除失败')
      }
    }
  })
}

// 确认字典数据表单
const handleConfirmData = async () => {
  const valid = await dataFormRef.value?.validate()
  if (!valid) return

  dataFormLoading.value = true
  try {
    if (currentDataEdit.value) {
      await updateDictData(currentDataEdit.value.id, dataFormData.value)
      await MessagePlugin.success('更新成功')
    } else {
      await addDictData(dataFormData.value)
      await MessagePlugin.success('创建成功')
    }
    showDataDialog.value = false
    loadDictDataList()
  } catch (error) {
    await MessagePlugin.error(currentDataEdit.value ? '更新失败' : '创建失败')
  } finally {
    dataFormLoading.value = false
  }
}

onMounted(() => {
  loadDictTypeList()
})
</script>

<style scoped lang="less">
.dict-container {
  padding: 2px;
}

.dict-layout {
  display: flex;
  gap: 24px;
  height: calc(100vh - 180px);
}

.dict-type-card {
  flex: 0 0 350px;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
}

.dict-data-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e7e7e7;

  h4 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: #1f2329;
  }
}

.dict-type-list {
  flex: 1;
  overflow-y: auto;

  .active-item {
    background: #f0f4ff;
    border-left: 3px solid #0052d9;
  }

  :deep(.t-list-item) {
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background: #f5f7fa;
    }
  }
}

.pagination-container {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e7e7e7;
  display: flex;
  justify-content: center;
}
</style>
