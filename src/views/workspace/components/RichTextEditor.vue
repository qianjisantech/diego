<template>
  <div class="rich-text-editor">
    <Toolbar
      class="editor-toolbar"
      :editor="editorRef"
      :defaultConfig="toolbarConfig"
      :mode="mode"
    />
    <Editor
      class="editor-content"
      v-model="valueHtml"
      :defaultConfig="editorConfig"
      :mode="mode"
      @onCreated="handleCreated"
    />
  </div>
</template>

<script setup>
import '@wangeditor/editor/dist/css/style.css'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import { ref, shallowRef, watch, onBeforeUnmount } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: '请输入内容...'
  }
})

const emit = defineEmits(['update:modelValue', 'blur'])

// 编辑器实例，必须用 shallowRef
const editorRef = shallowRef()

const valueHtml = ref(props.modelValue)
const mode = 'default' // 或 'simple'

// 工具栏配置
const toolbarConfig = {
  toolbarKeys: [
    'headerSelect',
    'bold',
    'italic',
    'underline',
    'through',
    '|',
    'bulletedList',
    'numberedList',
    'todo',
    '|',
    'blockquote',
    'codeBlock',
    '|',
    'insertLink',
    'insertImage',
    'insertTable',
    '|',
    'undo',
    'redo'
  ]
}

// 编辑器配置
const editorConfig = {
  placeholder: props.placeholder,
  height: 300, // 设置编辑器最小高度，避免初始化时的警告
  MENU_CONF: {
    // 配置插入图片
    insertImage: {
      // 支持插入网络图片
      onInsertedImage(imageNode) {
        if (imageNode == null) return
        const { src, alt, url, href } = imageNode
      },
      // 检查图片插入
      checkImage: (src, alt, url) => {
        // 返回 true 表示检查通过
        // 返回字符串表示检查失败，字符串为失败原因
        if (!src) {
          return '图片地址不能为空'
        }
        return true
      },
      // 自定义上传图片
      customUpload: async (file, insertFn) => {
      }
    }
  }
}

// 组件销毁时，也及时销毁编辑器
onBeforeUnmount(() => {
  const editor = editorRef.value
  if (editor == null) return
  editor.destroy()
})

const handleCreated = (editor) => {
  editorRef.value = editor

  // 监听编辑器失焦事件
  editor.on('blur', () => {
    emit('blur')
  })
}

// 监听内容变化
watch(valueHtml, (newVal) => {
  emit('update:modelValue', newVal)
})

// 监听外部值变化
watch(() => props.modelValue, (newVal) => {
  if (newVal !== valueHtml.value) {
    valueHtml.value = newVal
  }
})
</script>

<style scoped lang="scss">
.rich-text-editor {
  border: 1px solid #e7e7e7;
  border-radius: 4px;
  overflow: hidden;

  .editor-toolbar {
    border-bottom: 1px solid #e7e7e7;
    background-color: #fff;
  }

  .editor-content {
    min-height: 300px;
    height: auto;
    overflow-y: auto;
    background-color: #fff;

    :deep(.w-e-text-container) {
      background-color: #fff;
    }

    :deep(.w-e-text-placeholder) {
      color: #bbb;
      font-style: normal;
    }
  }
}
</style>
