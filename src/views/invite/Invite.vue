<template>
  <div class="invite-page">
  <div class="invite-logo-top">
    <AppLogo class="enterprise-mode" :clickable="false" />
  </div>
  <div class="invite-card">
      <div class="invite-illustration-top" aria-hidden="true">
        <!-- simple decorative illustration (light, Apple-like) -->
        <svg viewBox="0 0 560 140" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="invite header">
          <defs>
            <linearGradient id="h1" x1="0" x2="1">
              <stop offset="0%" stop-color="#E8F4FF"/>
              <stop offset="100%" stop-color="#D6E9FF"/>
            </linearGradient>
            <linearGradient id="h2" x1="0" x2="1">
              <stop offset="0%" stop-color="#FFF1F8"/>
              <stop offset="100%" stop-color="#FFE4F0"/>
            </linearGradient>
          </defs>
          <rect x="0" y="0" width="560" height="140" rx="8" fill="transparent"/>
          <g transform="translate(40,20)">
            <ellipse cx="60" cy="90" rx="56" ry="12" fill="#EEF8FF" />
            <circle cx="60" cy="46" r="36" fill="url(#h1)" stroke="#fff" stroke-width="6"/>
            <circle cx="260" cy="26" r="48" fill="url(#h1)" stroke="#fff" stroke-width="8"/>
            <ellipse cx="460" cy="90" rx="56" ry="12" fill="#FFF4F8" />
            <circle cx="460" cy="46" r="36" fill="url(#h2)" stroke="#fff" stroke-width="6"/>
          </g>
        </svg>
      </div>

      <div class="invite-body">
        <div class="inviter-avatar">
          <div class="avatar-circle"> </div>
        </div>
        <div class="inviter-name">{{ inviterName }} 邀请你加入团队</div>
        <div class="team-name">{{ teamName }}</div>
      </div>

      <div class="invite-actions">
        <button class="btn-accept" @click="acceptInvite">立刻加入</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import AppLogo from '@/components/AppLogo.vue'
import { useRoute, useRouter } from 'vue-router'
import { MessagePlugin } from 'tdesign-vue-next'
import { getEnterpriseInviteInfo } from '@/api/console/invite.js'
import { eventBus } from '@/utils/eventBus.js'
import { activateEnterprise } from '@/api/enterprise/enterprise.js'
import Cookies from 'js-cookie'

const route = useRoute()
const router = useRouter()

const inviterName = ref('系统邀请人')
const teamName = ref('某某团队')

let mountedId = null

const loadInvite = async (id) => {
  if (!id) return
  try {
    const res = await getEnterpriseInviteInfo(id)
    const payload = res?.data ?? res
    if (payload) {
      if (payload.invitePersonName) inviterName.value = payload.invitePersonName
      if (payload.name) teamName.value = payload.name
      if (payload.id) {
        document.body.dataset.invitedCompanyId = String(payload.id)
      }
      // If user already logged in, auto-activate company and redirect to workspace
      try {
        const token = Cookies.get('dcp_token')
        if (token && payload.companyId) {
          // attempt to activate company (control panel API)
          const res = await activateEnterprise(payload.companyId)
          if (res && (res.success )) {
            await MessagePlugin.success('已切换至邀请企业，正在跳转...')
            await router.push('/workspace')
            return
          }
        }
      } catch (e) {
        console.warn('[Invite] auto-activate failed', e)
      }
    }
  } catch (e) {
    console.warn('[Invite] load invite info failed', e)
  }
}

onMounted(async () => {
  const id = route.params.id
  mountedId = id
  if (route.query.inviter) inviterName.value = String(route.query.inviter)
  if (route.query.team) teamName.value = String(route.query.team)
  await loadInvite(id)
  eventBus.on('company:changed', async (newId) => {
    try {
      if (mountedId && String(newId) !== String(mountedId)) {
        mountedId = String(newId)
        await loadInvite(mountedId)
      }
    } catch (e) {}
  })
})

onUnmounted(() => {
  eventBus.off('company:changed', () => {})
})

const acceptInvite = async () => {
  await MessagePlugin.success('已加入（模拟）')
  // redirect to workspace or login depending on auth; here go to workspace
  setTimeout(() => {
    router.push('/workspace')
  }, 400)
}

// invite page does not need copy button (it's provided in invite modal)
</script>

<style scoped lang="scss">
.invite-page{
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f6f8fa;
  padding: 40px 20px;
  /* move page up to align visually */
  transform: translateY(-50px);
  -webkit-transform: translateY(-50px);
}
.invite-card{
  width: 420px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 12px 30px rgba(16,24,40,0.08);
  overflow: hidden;
  margin-top: 0; /* align vertically with logo like /self/enterprise/create */
}
.invite-illustration-top{
  height: 220px;
  display:flex;
  align-items:center;
  justify-content:center;
  background: transparent;
}
.invite-logo-top{
  display:flex;
  justify-content:center;
  z-index: 5;
  margin-bottom: 18px; /* match spacing used in /self/enterprise/create */
}
.invite-brand{
  text-align: center;
  padding-top: 18px;
  padding-bottom: 8px;
  font-weight: 600;
  color: #6b7280;
  font-size: 32px;
}
.invite-body{
  padding: 40px 28px 24px;
  text-align: center;
}
.inviter-avatar .avatar-circle{
  width:48px;
  height:48px;
  border-radius:50%;
  background: linear-gradient(180deg,#E8F4FF,#D6E9FF);
  margin: 0 auto 12px;
  box-shadow: 0 6px 12px rgba(20,60,120,0.06);
}
.inviter-name{
  font-size:14px;
  color:#6b7280;
  margin-bottom:6px;
}
.team-name{
  font-size:18px;
  color:#111827;
  font-weight:700;
  margin-bottom:18px;
}
.invite-actions{
  padding: 0 28px 36px 28px;
}
.btn-accept{
  width:100%;
  padding:12px 0;
  background: linear-gradient(90deg,#2f78e6,#60a8ff);
  color:#fff;
  border:none;
  border-radius:8px;
  font-weight:600;
  cursor:pointer;
}

/* invite page does not include copy button; the invite modal has the copy control */
</style>


