<template>
  <div class="template-design-page">
    <t-card :bordered="false" class="design-card">
      <!-- 页面标题 -->
      <div class="page-header">
        <div class="page-actions">
          <t-button theme="default" @click="goBack">返回</t-button>
          <t-button theme="primary" :loading="saving" @click="saveLayout">保存布局</t-button>
        </div>
      </div>

      <div class="select-filters">
        <div class="filter-item">
          <span class="filter-label">部门：</span>
          <t-select
            v-model="selectedDepartment"
            placeholder="请选择部门"
            :options="departmentOptions"
            clearable
            style="width: 200px"
          />
        </div>
        <div class="filter-item">
          <span class="filter-label">事项类型：</span>
          <t-select
            v-model="selectedItemType"
            placeholder="请选择事项类型"
            :options="itemTypeOptions"
            clearable
            style="width: 200px"
          />
        </div>
      </div>

      <!-- 使用折叠面板组织内容 -->
      <t-collapse default-expand-all>
        <t-collapse-panel header="团队管理自定义">

        </t-collapse-panel>

        <t-collapse-panel header="时间信息">

        </t-collapse-panel>

        <t-collapse-panel header="人员信息">

        </t-collapse-panel>

        <t-collapse-panel header="附件">

        </t-collapse-panel>
      </t-collapse>
    </t-card>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { MessagePlugin } from 'tdesign-vue-next'
import { getTemplateFields, saveTemplateFields, getTemplateOptions } from '@/api/template'

const route = useRoute()
const router = useRouter()

const templateIdFromQuery = route.query.templateId
const loading = ref(false)
const saving = ref(false)

const paletteFields = ref([]) // 所有字段（来自后端）
const canvasFields = ref([]) // 画布中的字段（可排序）
const templateOptions = ref([])
const selectedTemplateId = ref(templateIdFromQuery || '')

const departmentOptions = ref([])
const selectedDepartment = ref('')

const itemTypeOptions = ref([])
const selectedItemType = ref('')

const formTitle = ref('')
const formDescription = ref('')
const showRequiredMark = ref(true)
const enableValidation = ref(true)

let dragIndex = null
let dragFromPalette = null
const canvasDropRef = ref(null)

import interact from 'interactjs'
import QInput from '@/components/QInput/index.vue'

// (removed groupedFields - using paletteFields flat list)

const loadFields = async (tid) => {
  const useId = tid || selectedTemplateId.value
  if (!useId) return
  loading.value = true
  try {
    const res = await getTemplateFields(useId)
    const data = res.data || []
    // palette 和 canvas 初始都用后端字段（canvas 初始为已有顺序）
    paletteFields.value = data
    canvasFields.value = data.map((d, i) => ({ ...d, _uid: d.id ? String(d.id) : `c-${Date.now()}-${i}`, x: 20, y: i * 60 }))
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const loadTemplateOptions = async () => {
  // companyId is from route.params.id
  const companyId = route.params.id
  try {
    const res = await getTemplateOptions(companyId)
    const data = res.data || []
    templateOptions.value = data
    if (!selectedTemplateId.value && data.length > 0) {
      selectedTemplateId.value = data[0].id
    }
  } catch (error) {
    console.error('获取模板选项失败', error)
  }
}

const onPaletteDragStart = (e, idx) => {
  dragFromPalette = { idx }
  e.dataTransfer.setData('text/plain', 'palette')
}

const onCanvasDragStart = (e, idx) => {
  dragIndex = idx
  e.dataTransfer.setData('text/plain', 'canvas')
}

const onCanvasDrop = (e) => {
  // drop from palette -> append
  if (e.dataTransfer.getData('text/plain') === 'palette' && dragFromPalette != null) {
    const { idx } = dragFromPalette
    const f = paletteFields.value[idx]
    if (f && canvasDropRef.value) {
      const rect = canvasDropRef.value.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const uid = f.id ? String(f.id) : `c-${Date.now()}-${Math.random().toString(36).slice(2,6)}`
      canvasFields.value.push({ ...f, x, y, _uid: uid })
      // remove from palette so it no longer shows in the field panel
      paletteFields.value.splice(idx, 1)
    }
  }
  dragFromPalette = null
  dragIndex = null
}

const onCanvasDropAt = (e, targetIdx) => {
  const kind = e.dataTransfer.getData('text/plain')
  if (kind === 'canvas' && dragIndex != null) {
    const arr = canvasFields.value
    const item = arr.splice(dragIndex, 1)[0]
    arr.splice(targetIdx, 0, item)
    canvasFields.value = [...arr]
  } else if (kind === 'palette' && dragFromPaletteIndex != null) {
    const f = paletteFields.value[dragFromPaletteIndex]
    if (f) {
      canvasFields.value.splice(targetIdx, 0, { ...f })
    }
  }
  dragIndex = null
}

const moveUp = (item) => {
  const idx = canvasFields.value.findIndex(f => f.id === item.id)
  if (idx > 0) {
    const arr = canvasFields.value
    const tmp = arr[idx - 1]
    arr[idx - 1] = arr[idx]
    arr[idx] = tmp
    canvasFields.value = [...arr]
  }
}

const moveDown = (item) => {
  const idx = canvasFields.value.findIndex(f => f.id === item.id)
  if (idx !== -1 && idx < canvasFields.value.length - 1) {
    const arr = canvasFields.value
    const tmp = arr[idx + 1]
    arr[idx + 1] = arr[idx]
    arr[idx] = tmp
    canvasFields.value = [...arr]
  }
}

const removeFromCanvas = (item) => {
  canvasFields.value = canvasFields.value.filter(f => f !== item)
}

// 双击画布项，返回字段面板
const returnToPalette = (item, idx) => {
  if (!item) return
  const uid = item._uid || item.id || idx
  const cidx = canvasFields.value.findIndex(f => String(f._uid || f.id) === String(uid))
  if (cidx === -1) return
  const removed = canvasFields.value.splice(cidx, 1)[0]
  // normalize removed item before returning to palette
  const paletteEntry = { ...removed }
  delete paletteEntry.x
  delete paletteEntry.y
  delete paletteEntry._uid
  // avoid duplicates by id or field_code
  const exists = paletteFields.value.find(f => (paletteEntry.id && f.id === paletteEntry.id) || ((f.field_code || f.fieldCode) && (paletteEntry.field_code || paletteEntry.fieldCode) && (f.field_code || f.fieldCode) === (paletteEntry.field_code || paletteEntry.fieldCode)))
  if (!exists) {
    paletteFields.value.unshift(paletteEntry)
  }
}

// init interact draggable for absolute positioned items
const initInteract = () => {
  try {
    interact('.draggable').draggable({
      modifiers: [
        interact.modifiers.restrictRect({
          restriction: () => {
            return canvasDropRef.value ? canvasDropRef.value.getBoundingClientRect() : null
          },
          endOnly: true
        })
      ],
      listeners: {
        move (event) {
          const uid = event.target.getAttribute('data-uid')
          const dx = event.dx
          const dy = event.dy
          const idx = canvasFields.value.findIndex(f => String(f._uid || f.id) === String(uid))
          if (idx !== -1) {
            const item = canvasFields.value[idx]
            item.x = (item.x || 0) + dx
            item.y = (item.y || 0) + dy
            canvasFields.value.splice(idx, 1, { ...item })
          }
        }
      }
    })
  } catch (e) {
    console.warn('interact init failed', e)
  }
}

onMounted(() => {
  loadTemplateOptions().then(() => {
    if (selectedTemplateId.value) {
      loadFields(selectedTemplateId.value)
    }
  })
  initInteract()
})

onBeforeUnmount(() => {
  try { interact('.draggable').unset() } catch (e) {}
})

// 返回到自定义模板页面
const goBack = () => {
  const enterpriseId = route.params.id
  router.push(`/enterprise-admin/${enterpriseId}/custom-templates`)
}

const saveLayout = async () => {
  const useTemplateId = selectedTemplateId.value || templateIdFromQuery
  if (!useTemplateId) {
    await MessagePlugin.error('请选择模板')
    return
  }

  if (canvasFields.value.length === 0) {
    await MessagePlugin.warning('请至少添加一个字段到表单中')
    return
  }

  saving.value = true
  try {
    const fieldsPayload = canvasFields.value.map((f, i) => ({
      id: f.id,
      field_code: f.field_code || f.fieldCode,
      field_name: f.field_name || f.fieldName,
      field_type: f.field_type || f.fieldType,
      field_default_value: f.field_default_value || f.fieldDefaultValue || null,
      is_edit: f.is_edit ?? (f.isEdit ? 1 : 0),
      is_required: f.is_required ?? (f.isRequired ? 1 : 0),
      prompt_content: f.prompt_content || f.promptContent || '',
      sort: i + 1,
      position: f.position,
      x: f.x || 0,
      y: f.y || 0
    }))

    // 包含表单设置
    const layoutData = {
      template_id: String(useTemplateId),
      fields: fieldsPayload,
      form_title: formTitle.value,
      form_description: formDescription.value,
      show_required_mark: showRequiredMark.value,
      enable_validation: enableValidation.value
    }

    await saveTemplateFields(layoutData)
    goBack()
  } catch (error) {
    console.error(error)
    await MessagePlugin.error('保存失败，请重试')
  } finally {
    saving.value = false
  }
}

// 字段类型文本映射（本地帮助函数）
const getFieldTypeText = (type) => {
  const typeMap = {
    text: '文本',
    textarea: '多行文本',
    select: '下拉选择',
    radio: '单选',
    checkbox: '多选',
    date: '日期',
    number: '数字'
  }
  return typeMap[type] || type || '未知'
}

const isInputType = (type) => {
  const t = String(type || '').toLowerCase()
  return t === 'input' || t === 'text'
}

// 判断字段是否必填（支持 snake_case 和 camelCase，支持 1/0 和 true/false）
const isFieldRequired = (f) => {
  if (!f) return false
  const v = f.is_required ?? f.isRequired
  return v === true || Number(v) === 1
}
</script>

<style scoped>
.design-card {
  max-width: 100%;
  height: calc(100vh - 120px);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e7e7e7;
}

.page-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1f2329;
}

.page-actions {
  display: flex;
  gap: 12px;
}

.select-filters {
  display: flex;
  gap: 24px;
  margin-bottom: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e7e7e7;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-label {
  font-weight: 500;
  color: #1f2329;
  white-space: nowrap;
}

.collapse-content {
  padding: 16px 0;
}

/* 字段面板样式 */
.palette-list {
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #e7e7e7;
  border-radius: 6px;
  padding: 16px;
  background: #fafafa;
}

.field-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 12px;
}

.palette-item {
  user-select: none;
  cursor: grab;
  border: 1px solid #d4d4d4;
  border-radius: 8px;
  background: #ffffff;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  transition: all 0.2s ease;
  padding: 12px;
}

.palette-item:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  transform: translateY(-2px);
}

.palette-item:active {
  cursor: grabbing;
}

.field-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.field-name {
  font-weight: 600;
  color: #1f2329;
  font-size: 14px;
}

.field-type {
  font-size: 12px;
  color: #8e8e93;
  background: #f5f5f5;
  padding: 2px 6px;
  border-radius: 4px;
}

.field-preview {
  min-height: 32px;
}

.field-placeholder {
  color: #999;
  font-size: 12px;
  text-align: center;
  padding: 8px;
  background: #f9f9f9;
  border-radius: 4px;
}

/* 画布样式 */
.canvas-container {
  position: relative;
}

.canvas-drop {
  border: 1px solid #d4d4d4 !important;
  background: linear-gradient(180deg, rgba(255,255,255,0.98), rgba(250,250,250,0.98));
  min-height: 500px;
  border-radius: 8px;
  padding: 20px;
  position: relative;
  /* subtle grid background */
  --grid-size: 20px;
  background-image:
    linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px),
    linear-gradient(180deg, rgba(255,255,255,0.98), rgba(250,250,250,0.98));
  background-size: var(--grid-size) var(--grid-size), var(--grid-size) var(--grid-size), auto;
}

.empty-canvas {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: #999;
}

.empty-canvas p {
  margin: 0;
  font-size: 14px;
}

.canvas-item {
  position: absolute;
  border: 1px solid #d4d4d4;
  border-radius: 8px;
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: all 0.2s ease;
  cursor: move;
  min-width: 200px;
  max-width: 300px;
}

.canvas-item:hover {
  box-shadow: 0 6px 18px rgba(0,0,0,0.12);
  transform: translateY(-2px);
}

.canvas-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 1px solid #f0f0f0;
  background: #fafafa;
  border-radius: 8px 8px 0 0;
}

.field-label {
  font-weight: 600;
  color: #1f2329;
  font-size: 13px;
}

.field-type-badge {
  font-size: 11px;
  color: #666;
  background: #f0f0f0;
  padding: 2px 6px;
  border-radius: 10px;
}

.canvas-item-content {
  padding: 12px;
}

.canvas-tips {
  margin-top: 16px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e7e7e7;
}

.canvas-tips p {
  margin: 4px 0;
  font-size: 13px;
  color: #666;
  display: flex;
  align-items: center;
  gap: 6px;
}

/* 设置样式 */
.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
  max-width: 800px;
}

.setting-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.setting-item label {
  min-width: 80px;
  font-weight: 500;
  color: #1f2329;
}

/* 预览样式 */
.preview-container {
  max-width: 800px;
}

.preview-form {
  border: 1px solid #e7e7e7;
  border-radius: 8px;
  padding: 24px;
  background: #ffffff;
}

.preview-form h4 {
  margin: 0 0 8px 0;
  color: #1f2329;
  font-size: 18px;
}

.form-description {
  color: #666;
  margin: 0 0 20px 0;
  font-size: 14px;
}

.preview-field-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.preview-field-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.preview-field-item .field-label {
  font-weight: 500;
  color: #1f2329;
  font-size: 14px;
}

.required-mark {
  color: #e34d59;
  margin-left: 4px;
}

.field-input {
  min-height: 32px;
}

.no-preview {
  text-align: center;
  color: #999;
  padding: 40px;
  font-size: 14px;
}

.field-type-text {
  color: #999;
  font-size: 12px;
  padding: 8px;
  background: #f9f9f9;
  border-radius: 4px;
  text-align: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .field-grid {
    grid-template-columns: 1fr;
  }

  .settings-grid {
    grid-template-columns: 1fr;
  }

  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
}
</style>


