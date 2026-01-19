<template>
  <div class="template-design-page">
    <t-card :bordered="false" class="design-card">
      <div class="design-body" style="display:flex;gap:16px;padding:2px;">
        <!-- 左侧：字段面板 -->
        <div class="palette" style="width:300px;border-right:1px solid #eee;padding-right:12px;display:flex;flex-direction:column;">

          <div style="margin-bottom:8px;">
            <t-select v-model="selectedTemplateId" style="width:100%" @change="loadFields">
              <t-option
                v-for="opt in templateOptions"
                :key="opt.id"
                :value="opt.id"
                :label="opt.name"
              />
            </t-select>
          </div>
          <h4>字段面板</h4>
          <div class="palette-list" style="flex:1;overflow:auto;padding-right:4px;">
            <div v-if="loading" style="padding:12px">加载中...</div>
            <div v-else>
              <div
                v-for="(f, idx) in paletteFields"
                :key="f.id || `p-${idx}`"
                class="palette-item"
                draggable="true"
                @dragstart="onPaletteDragStart($event, idx)"
                style="padding:8px;border:1px solid #f0f0f0;margin-bottom:2px;cursor:grab;display:flex;align-items:center;justify-content:flex-start;"
              >
                <div style="width:60px;flex-shrink:0;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:flex;align-items:center;gap:6px;">
                  <span>{{ f.fieldName }}</span>
                </div>
                <div style="flex:1;min-width:0;">
                  <QInput
                    v-if="isInputType(f.fieldType)"
                    :model-value="''"
                    :placeholder="f.fieldDefaultValue || ''"
                    disabled
                    required
                  />
                  <t-select v-else-if="(f.fieldType || f.field_type) === 'select'" style="width:100%" disabled>
                    <t-option label="选项" />
                  </t-select>
                  <div v-else style="color:#999;font-size:12px;text-align:left;">{{ getFieldTypeText(f.fieldType || f.field_type) }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧：画布 -->
        <div class="canvas" style="flex:1;min-height:300px;">
          <h4>表单布局</h4>
          <div
            class="canvas-drop"
            ref="canvasDropRef"
            style="min-height:600px;border:1px dashed #e6e6e6;padding:12px;overflow:auto;position:relative;"
            @dragover.prevent
            @drop="onCanvasDrop"
          >
            <div v-if="canvasFields.length === 0" style="color:#999;padding:24px;text-align:center">
              拖拽字段到这里开始设计表单
            </div>

            <div
              v-for="(item, idx) in canvasFields"
              :key="item._uid || item.id || `c-${idx}`"
              class="canvas-item draggable"
              :data-uid="item._uid || item.id || idx"
              @dragstart="onCanvasDragStart($event, idx)"
              @dblclick="returnToPalette(item, idx)"
              style="position:absolute;display:flex;align-items:center;justify-content:flex-start;padding:8px;border:1px solid #f3f3f3;margin-bottom:1px;background:#fff;min-width:220px;gap:8px;"
              :style="{ left: (item.x || 0) + 'px', top: (item.y || 0) + 'px' }"
            >
              <div style="width:50px;flex-shrink:0;font-weight:550;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:flex;align-items:center;gap:6px;">
              </div>
              <div style="flex:1;min-width:0;">
                <QInput
                 :label=" item.fieldName || item.field_name"
                  v-if="isInputType(item.fieldType)"
                  :model-value="item.fieldDefaultValue  || ''"
                  :placeholder="item.fieldDefaultValue || ''"
                  disabled
                  required
                />
                <t-select v-else-if="(item.fieldType || item.field_type) === 'select'" style="width:100%" disabled>
                  <t-option label="选项" />
                </t-select>
                <div v-else style="color:#999;font-size:12px;">{{ getFieldTypeText(item.fieldType || item.field_type) }}</div>
              </div>
              <!-- 操作按钮已移除：上移/下移/移除 -->
            </div>
          </div>

          <div style="margin-top:12px;text-align:right;">
            <t-button theme="default" @click="$router.back()">返回</t-button>
            <t-button theme="primary" style="margin-left:8px" :loading="saving" @click="saveLayout">保存布局</t-button>
          </div>
        </div>
      </div>
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

const saveLayout = async () => {
  const useTemplateId = selectedTemplateId.value || templateIdFromQuery
  if (!useTemplateId) {
    MessagePlugin.error('缺少 templateId')
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

    await saveTemplateFields({ template_id: String(useTemplateId), fields: fieldsPayload })
    MessagePlugin.success('布局保存成功')
    // refresh from server
    await loadFields(useTemplateId)
  } catch (error) {
    console.error(error)
    MessagePlugin.error('保存失败')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadTemplateOptions().then(() => {
    if (selectedTemplateId.value) {
      loadFields(selectedTemplateId.value)
    }
  })
})

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
.design-card { max-width: 100%; }
.design-card { height: calc(100vh - 120px); } /* make the design area fill available viewport height */
.design-body { height: 100%; } /* let inner body stretch to card height */
.page-title { font-size: 18px; font-weight: 600; }
.palette-item { user-select: none; }
.palette-list {
  /* ensure the field list scrolls while the select stays fixed */
  max-height: calc(80vh - 140px);
  overflow-y: auto;
}

/* 增强边框与阴影，提升可见性 */
.palette-item {
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 6px;
  background: #ffffff;
  box-shadow: 0 1px 2px rgba(0,0,0,0.04);
}

.canvas-drop {
  border: 1px solid rgba(0,0,0,0.10) !important;
  background: linear-gradient(180deg, rgba(255,255,255,0.98), rgba(250,250,250,0.98));
  /* allow the canvas to grow to fill the column and increase visible area (doubled) */
  flex: 1;
  min-height: 960px;
  border-radius: 8px;
  padding: 8px;
  display: flex;
  flex-direction: column;
  /* subtle grid background */
  --grid-size: 20px;
  background-image:
    linear-gradient(rgba(0,0,0,0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0,0,0,0.02) 1px, transparent 1px),
    linear-gradient(180deg, rgba(255,255,255,0.98), rgba(250,250,250,0.98));
  background-size: var(--grid-size) var(--grid-size), var(--grid-size) var(--grid-size), auto;
}

.canvas {
  flex: 1;
  min-height: 0; /* allow children to control height via flex */
  display: flex;
  flex-direction: column;
}

.canvas > h4 { margin: 0 0 8px; }
.canvas > div:last-child { margin-top: auto; }

.canvas-item {
  border: 1px solid rgba(0,0,0,0.12);
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  transition: box-shadow .15s ease, transform .12s ease;
  cursor: move;
  padding: 12px 14px;
  min-width: 180px;
}
.canvas-item:hover {
  box-shadow: 0 6px 18px rgba(0,0,0,0.12);
  transform: translateY(-2px);
}

/* draggable handle (optional) */
.canvas-item .handle {
  width: 18px;
  height: 18px;
  display:inline-block;
  margin-left:8px;
  background: transparent;
  border-radius: 3px;
}

</style>


