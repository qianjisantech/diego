import { ref, onMounted, onUnmounted } from 'vue'
import { useUserStore } from '@/store/user'
import { eventBus } from '@/utils/eventBus.js'

export function useEnterpriseChange() {
  const userStore = useUserStore()
  const current = ref(userStore.selectedCompanyId || '')

  const updateFromStore = () => {
    try {
      current.value = userStore.selectedCompanyId || ''
    } catch (e) {}
  }

  const onEnterpriseChanged = (id) => {
    current.value = String(id)
  }

  onMounted(() => {
    updateFromStore()
    eventBus.on('company:changed', onEnterpriseChanged)
  })

  onUnmounted(() => {
    eventBus.off('company:changed', onEnterpriseChanged)
  })

  return {
    currentEnterpriseId: current,
    updateFromStore
  }
}


