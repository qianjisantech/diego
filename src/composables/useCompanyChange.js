import { ref, onMounted, onUnmounted } from 'vue'
import { useUserStore } from '@/store/user'
import { eventBus } from '@/utils/eventBus.js'

export function useCompanyChange() {
  const userStore = useUserStore()
  const current = ref(userStore.selectedCompanyId || '')

  const updateFromStore = () => {
    try {
      current.value = userStore.selectedCompanyId || ''
    } catch (e) {}
  }

  const onCompanyChanged = (id) => {
    current.value = String(id)
  }

  onMounted(() => {
    updateFromStore()
    eventBus.on('company:changed', onCompanyChanged)
  })

  onUnmounted(() => {
    eventBus.off('company:changed', onCompanyChanged)
  })

  return {
    currentCompanyId: current,
    updateFromStore
  }
}


