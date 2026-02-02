<template>
  <teleport to="body">
    <div v-if="visible" class="invite-modal-overlay" @click.self="close">
      <div class="invite-modal">
        <div class="invite-header">
          <div class="invite-title">邀请您的团队成员加入企业</div>
          <button class="invite-close" @click="close">×</button>
        </div>
        <div class="invite-body">
          <div class="invite-illustration" aria-hidden="true">
            <!-- Orbit-style minimalist avatars referencing the screenshot -->
            <svg viewBox="0 0 720 200" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="orbit avatars invite illustration">
              <defs>
                <linearGradient id="bgSoft" x1="0" x2="1">
                  <stop offset="0%" stop-color="#F6FAFC"/>
                  <stop offset="100%" stop-color="#F2F7FB"/>
                </linearGradient>
                <linearGradient id="avatarBlue" x1="0" x2="1">
                  <stop offset="0%" stop-color="#60A8FF"/>
                  <stop offset="100%" stop-color="#2F78E6"/>
                </linearGradient>
                <linearGradient id="avatarPink" x1="0" x2="1">
                  <stop offset="0%" stop-color="#FFB3D9"/>
                  <stop offset="100%" stop-color="#FF8AB8"/>
                </linearGradient>
                <linearGradient id="avatarTeal" x1="0" x2="1">
                  <stop offset="0%" stop-color="#4CD6C7"/>
                  <stop offset="100%" stop-color="#1FB3A3"/>
                </linearGradient>
                <filter id="softBlur" x="-40%" y="-40%" width="180%" height="180%">
                  <feGaussianBlur stdDeviation="6" result="b"/>
                  <feOffset dy="4" result="o"/>
                  <feBlend in="SourceGraphic" in2="o"/>
                </filter>
              </defs>

              <!-- Subtle rounded panel background -->
              <rect x="56" y="18" rx="16" width="608" height="164" fill="url(#bgSoft)"/>

              <!-- Thin orbit line -->
              <ellipse cx="360" cy="86" rx="220" ry="36" fill="none" stroke="#D6E6F7" stroke-width="2" stroke-linecap="round"/>

              <!-- Left avatar -->
              <g transform="translate(225,86)">
                <circle cx="0" cy="0" r="34" fill="url(#avatarTeal)" stroke="#ffffff" stroke-width="6" />
                <circle cx="0" cy="-6" r="6" fill="#fff"/>
                <circle cx="8" cy="-6" r="6" fill="#fff"/>
                <path d="M -8 6 Q 0 14 8 6" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"/>
                <ellipse cx="0" cy="34" rx="36" ry="10" fill="#DFF6F3" opacity="0.6"/>
              </g>

              <!-- Center avatar -->
              <g transform="translate(360,66)">
                <circle cx="0" cy="0" r="44" fill="url(#avatarBlue)" stroke="#ffffff" stroke-width="8" />
                <circle cx="-12" cy="-8" r="7" fill="#fff"/>
                <circle cx="12" cy="-8" r="7" fill="#fff"/>
                <path d="M -12 8 Q 0 20 12 8" stroke="#fff" stroke-width="2.5" fill="none" stroke-linecap="round"/>
                <ellipse cx="0" cy="48" rx="46" ry="12" fill="#E8F3FF" opacity="0.7"/>
              </g>

              <!-- Right avatar -->
              <g transform="translate(495,86)">
                <circle cx="0" cy="0" r="34" fill="url(#avatarPink)" stroke="#ffffff" stroke-width="6" />
                <circle cx="-6" cy="-6" r="5" fill="#fff"/>
                <circle cx="6" cy="-6" r="5" fill="#fff"/>
                <path d="M -6 6 Q 0 12 6 6" stroke="#fff" stroke-width="1.8" fill="none" stroke-linecap="round"/>
                <ellipse cx="0" cy="34" rx="36" ry="10" fill="#FFEFF7" opacity="0.6"/>
              </g>

              <!-- small decorative plus/dot marks -->
              <circle cx="300" cy="46" r="3" fill="#FFD28A" opacity="0.85"/>
              <circle cx="420" cy="36" r="2.5" fill="#8ED1FF" opacity="0.9"/>
            </svg>
          </div>

          <div class="invite-tabs">
            <div :class="['tab', { active: activeTab === 'link' }]" @click="setTab('link')">邀请链接</div>
            <div :class="['tab', { active: activeTab === 'email' }]" @click="setTab('email')">邮箱邀请</div>
          </div>

          <div v-if="activeTab === 'link'">
            <div class="invite-link-row">
              <t-input
                class="invite-input"
                :value="inviteLink"
                disabled
                ref="tInputRef"
                @click="selectLink"
              />
              <button class="copy-btn" @click="copyInvite">复制邀请信息</button>
            </div>

            <div class="invite-expire">链接有效期至：{{ inviteExpire }}</div>
          </div>

          <div v-else class="invite-email">
            <div style="display:flex; gap:12px; align-items:center;">
              <input v-model="emailValue" class="invite-input" placeholder="输入邮箱，用逗号分隔多个" />
              <button class="copy-btn" @click="sendInviteByEmail">发送邀请</button>
            </div>
            <div style="margin-top:10px;color:#9aa0a6;font-size:13px;">
              支持多个邮箱，用逗号分隔
            </div>
          </div>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { computed, watch, ref, onMounted, onUnmounted } from 'vue'
import { MessagePlugin } from 'tdesign-vue-next'
import { useUserStore } from '@/store/user'
import { eventBus } from '@/utils/eventBus.js'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  companyId: {
    type: [String, Number],
    default: ''
  }
})

const emit = defineEmits(['update:visible', 'opened', 'copied'])

const tInputRef = ref(null)
const activeTab = ref('link')
const emailValue = ref('')
const userStore = useUserStore()
const selectedCompanyId = ref(props.companyId || '')

// listen for global company change events to update link immediately
const onCompanyChanged = (id) => {
  try {
    selectedCompanyId.value = String(id)
  } catch (e) {}
}

onMounted(() => {
  eventBus.on('company:changed', onCompanyChanged)
})

onUnmounted(() => {
  eventBus.off('company:changed', onCompanyChanged)
})

const setTab = (tab) => {
  activeTab.value = tab
}

const sendInviteByEmail = async () => {
  if (!emailValue.value || emailValue.value.trim().length === 0) {
    await MessagePlugin.warning('请输入邮箱地址')
    return
  }
  const emails = emailValue.value.split(',').map(s => s.trim()).filter(Boolean)
  const invalid = emails.find(e => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e))
  if (invalid) {
    await MessagePlugin.warning(`无效的邮箱：${invalid}`)
    return
  }
  // 模拟发送邀请（可替换为真实接口）
  console.log('[InviteModal] sendInviteByEmail to:', emails)
  await MessagePlugin.success('邀请邮件已发送（模拟）')
  emailValue.value = ''
}

const inviteLink = computed(() => {
  let id = ''
  try {
    id = userStore.selectedCompanyId || ''
  } catch (e) {
    id = ''
  }
  if (!id) id = props.companyId || selectedCompanyId.value || ''
  if (!id) {
    try {
      const stored = localStorage.getItem('activeEnterpriseId')
      if (stored) id = stored
    } catch (e) {}
    // eslint-disable-next-line no-console
    console.log('当前邀请链接', `${window.location.origin}/enterprise/invite/${id}`)
  }
  return `${window.location.origin}/enterprise/invite/${id}`
})

const selectLink = () => {
  try {
    // t-input exposes DOM under $el
    const native = tInputRef.value?.$el?.querySelector('input') || tInputRef.value?.$el
    if (native) {
      native.focus()
      if (native.select) native.select()
    }
  } catch (e) {
    // ignore
  }
}

const inviteExpire = computed(() => {
  return new Date(Date.now() + 7 * 24 * 3600 * 1000).toLocaleString()
})

const close = () => {
  emit('update:visible', false)
}

const copyInvite = async () => {
  try {
    await navigator.clipboard.writeText(inviteLink.value)
    console.log('[InviteModal] copied invite link:', inviteLink.value)
    emit('copied', inviteLink.value)
    await MessagePlugin.success('已复制邀请链接')
  } catch (e) {
    console.error('[InviteModal] 复制失败', e)
    await MessagePlugin.error('复制失败，请手动复制')
  }
}

watch(() => props.visible, (v) => {
  if (v) {
    console.log('[InviteModal] opened for companyId:', props.companyId)
    emit('opened', props.companyId)
    // focus input after open
    setTimeout(() => {
      try { selectLink() } catch (e) {}
    }, 80)
  }
})
</script>

<style scoped lang="scss">
.invite-modal-overlay {
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.55);
  z-index: 20050;
  display: flex;
  align-items: center;
  justify-content: center;
}
.invite-modal {
  width: 720px;
  max-width: calc(100% - 48px);
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.2);
  overflow: hidden;
}
.invite-header {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 22px 28px;
  position: relative;
  border-bottom: 1px solid #f2f4f7;
}
.invite-title {
  font-size: 18px;
  font-weight: 600;
  color: #222;
}
.invite-close {
  position: absolute;
  right: 16px;
  top: 12px;
  background: transparent;
  border: none;
  font-size: 22px;
  cursor: pointer;
  color: #8e8e93;
}
.invite-body {
  padding: 22px 28px 28px 28px;
}
.invite-illustration {
  display: flex;
  justify-content: center;
  margin-bottom: 12px;
  padding-top: 6px;
  /* Enlarge the SVG slightly to make the illustration more prominent */
  overflow: visible;

  & > svg {
    transform: scale(1.18);
    transform-origin: center;
    transition: transform 0.18s ease;
    max-width: 880px;
    width: 880px;
    height: auto;
    display: block;
  }
}
.pals {
  display: flex;
  gap: 18px;
}
.pal {
  width: 68px;
  height: 68px;
  border-radius: 50%;
  box-shadow: 0 6px 18px rgba(14,30,37,0.06);
}
.pal-a { background: #23b0a7; }
.pal-b { background: #2f9cf3; transform: scale(1.08); }
.pal-c { background: #ffb04b; }
.invite-tabs {
  display: flex;
  gap: 18px;
  margin-top: 12px;
  margin-bottom: 14px;
}
.invite-tabs .tab {
  padding: 10px 14px;
  border-radius: 6px;
  color: #7a7f86;
}
.invite-tabs .tab.active {
  color: var(--brand-primary);
  border-bottom: 2px solid var(--brand-primary);
}
.invite-link-row {
  display: flex;
  gap: 12px;
  align-items: center;
}
.invite-input {
  flex: 1;
  padding: 10px 12px;
  border: 1px solid #e6eef8;
  border-radius: 6px;
  font-size: 14px;
  color: #222;
  background: #fafcff;
  cursor: text;
  user-select: text;
}
.copy-btn {
  /* explicit primary gradient to avoid missing CSS variable causing white button */
  background: linear-gradient(90deg, #0099ff, #048bff);
  border: none;
  color: #fff;
  padding: 10px 14px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  box-shadow: 0 6px 18px rgba(4,71,143,0.12);
  transition: transform 0.12s ease, box-shadow 0.12s ease, opacity 0.12s ease;
}
.copy-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 26px rgba(4,71,143,0.14);
  opacity: 0.98;
}
.invite-expire {
  margin-top: 12px;
  color: #9aa0a6;
  font-size: 13px;
}
</style>


