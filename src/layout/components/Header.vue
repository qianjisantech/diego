<template>
  <div class="header-container">
    <div class="header-left">
      <AppLogo :clickable="true"/>
      <div>
        <t-select-input
            :value="selectValue"
            :popup-visible="popupVisible"
            :popup-props="{ overlayInnerStyle: { padding: '22px' } }"
            placeholder="请输入任意关键词"
            allow-input
            clearable
            style="width: 300px"
            @input-change="onInputChange"
            @popup-visible-change="onPopupVisibleChange"
        >
          <template #panel>
            <ul >
              <li v-for="item in options" :key="item" @click="() => onOptionClick(item)">
                {{ item }}
              </li>
            </ul>
          </template>
          <template #suffixIcon>
            <search-icon/>
          </template>
        </t-select-input>

      </div>
    </div>
    <div class="header-right">
      <t-button theme="primary" size="medium" @click="handleCreateIssue" class="create-issue-btn">
        <template #icon>
          <t-icon name="add"/>
        </template>
        新建
      </t-button>
    </div>


  </div>
</template>

<script setup>
import {ref} from 'vue'
import {useWorkspaceStore} from '@/store/workspace'
import {SearchIcon} from 'tdesign-icons-vue-next';
import AppLogo from '@/components/AppLogo.vue'
const workspaceStore = useWorkspaceStore()
let selectValue = ref('')
let popupVisible = ref(false)

let options = ref(['Student A', 'Student B', 'Student C', 'Student D', 'Student E', 'Student F'])
const onOptionClick = (item) => {
  selectValue.value = item;
  popupVisible.value = false;
}
const onInputChange = async (keyword) => {
  selectValue.value = keyword;
  options.value = new Array(5).fill(null).map((t, index) => `Student ${index}`);
}
const onPopupVisibleChange = async (val) => {
  popupVisible.value = val;
}
// 处理新建事项
const handleCreateIssue = async () => {
  setTimeout(() => {
    workspaceStore.triggerCreateIssue()
  }, 100)
}


</script>

<style scoped lang="scss">
.header-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  height: 48px;
  min-height: 48px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  padding: 0 var(--spacing-md);
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  .header-left {
    display: flex;
    align-items: center;
    margin-left: 30px;

    :deep(.app-logo) {
      padding-right: var(--spacing-md);
      border-right: 1px solid rgba(0, 0, 0, 0.06);

      .space-switch-select {
        min-width: 160px;
      }
    }

    .left-create-btn {
      margin-left: 12px;
    }

  }

  .header-right {
    margin-right: 40px;
    display: flex;
    align-items: center;

    .create-issue-btn {
      font-size: 13px;
    }

  }
}




</style>




