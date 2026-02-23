<template>
  <n-layout has-sider style="height: 100vh">
    <!-- Mobile drawer -->
    <n-drawer
      v-model:show="showMobileMenu"
      :width="240"
      placement="left"
      class="mobile-drawer"
    >
      <n-drawer-content closable>
        <template #header>
          <img src="../assets/lactolac-logo.png" alt="Lactolac" class="drawer-logo" />
        </template>
        <n-menu
          :options="menuOptions"
          :value="activeKey"
          @update:value="handleMobileMenuUpdate"
        />
        <template #footer>
          <n-button block @click="handleLogout">
            <template #icon>
              <n-icon><LogOutOutline /></n-icon>
            </template>
            Cerrar Sesión
          </n-button>
        </template>
      </n-drawer-content>
    </n-drawer>

    <!-- Desktop sidebar -->
    <n-layout-sider
      bordered
      collapse-mode="width"
      :collapsed-width="64"
      :width="240"
      :collapsed="collapsed"
      show-trigger
      @collapse="collapsed = true"
      @expand="collapsed = false"
      class="desktop-sider"
    >
      <div class="logo">
        <img v-if="!collapsed" src="../assets/lactolac-logo.png" alt="Lactolac" class="sidebar-logo" />
        <img v-else src="../assets/lactolac-logo.png" alt="Lactolac" class="sidebar-logo-collapsed" />
      </div>
      
      <n-menu
        :collapsed="collapsed"
        :collapsed-width="64"
        :collapsed-icon-size="22"
        :options="menuOptions"
        :value="activeKey"
        @update:value="handleMenuUpdate"
      />
    </n-layout-sider>

    <n-layout>
      <n-layout-header bordered style="height: 60px; padding: 0 16px; display: flex; align-items: center; justify-content: space-between;">
        <!-- Mobile menu button -->
        <n-button quaternary circle class="mobile-menu-btn" @click="showMobileMenu = true">
          <template #icon>
            <n-icon size="24"><MenuOutline /></n-icon>
          </template>
        </n-button>
        
        <!-- Desktop breadcrumb -->
        <n-breadcrumb class="desktop-breadcrumb">
          <n-breadcrumb-item>Inicio</n-breadcrumb-item>
          <n-breadcrumb-item>{{ currentRoute?.meta?.title || 'Dashboard' }}</n-breadcrumb-item>
        </n-breadcrumb>
        
        <!-- Page title for mobile -->
        <span class="mobile-page-title">{{ currentRoute?.meta?.title || 'Dashboard' }}</span>
        
        <n-dropdown :options="userOptions" @select="handleUserSelect">
          <n-button text>
            <template #icon>
              <n-icon><PersonOutline /></n-icon>
            </template>
            <span class="user-name">{{ authStore.userName }}</span>
          </n-button>
        </n-dropdown>
      </n-layout-header>

      <n-layout-content content-style="padding: 16px;" class="main-content">
        <router-view />
      </n-layout-content>
    </n-layout>
  </n-layout>
</template>

<script setup>
import { ref, computed, h, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { NIcon } from 'naive-ui'
import { useAuthStore } from '../stores/auth'
import { 
  LaptopOutline,
  KeyOutline,
  PeopleOutline,
  BusinessOutline,
  BriefcaseOutline,
  PersonOutline,
  LogOutOutline,
  GlobeOutline,
  MenuOutline
} from '@vicons/ionicons5'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const collapsed = ref(false)
const showMobileMenu = ref(false)
const isMobile = ref(false)
const currentRoute = computed(() => route)
const activeKey = computed(() => route.name)

const checkMobile = () => {
  isMobile.value = window.innerWidth < 768
  if (!isMobile.value) {
    showMobileMenu.value = false
  }
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})

function renderIcon(icon) {
  return () => h(NIcon, null, { default: () => h(icon) })
}

const menuOptions = [
  {
    label: 'Inventario',
    key: 'Inventario',
    icon: renderIcon(LaptopOutline)
  },
  {
    label: 'Licencias',
    key: 'Licencias',
    icon: renderIcon(KeyOutline)
  },
  {
    label: 'Usuarios',
    key: 'Usuarios',
    icon: renderIcon(PeopleOutline)
  },
  {
    label: 'Departamentos',
    key: 'Departamentos',
    icon: renderIcon(BusinessOutline)
  },
  {
    label: 'Países',
    key: 'Paises',
    icon: renderIcon(GlobeOutline)
  }
]

const userOptions = [
  {
    label: 'Cerrar Sesión',
    key: 'logout',
    icon: renderIcon(LogOutOutline)
  }
]

function handleMenuUpdate(key) {
  router.push({ name: key })
}

function handleMobileMenuUpdate(key) {
  router.push({ name: key })
  showMobileMenu.value = false
}

function handleUserSelect(key) {
  if (key === 'logout') {
    handleLogout()
  }
}

function handleLogout() {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border-bottom: 1px solid #e0e0e6;
}

.sidebar-logo {
  height: 36px;
  width: auto;
  max-width: 100%;
  object-fit: contain;
}

.sidebar-logo-collapsed {
  height: 30px;
  width: auto;
  max-width: 48px;
  object-fit: contain;
}

.drawer-logo {
  height: 32px;
  width: auto;
  object-fit: contain;
}

.mobile-menu-btn {
  display: none;
}

.mobile-page-title {
  display: none;
  font-weight: 600;
  font-size: 16px;
}

.user-name {
  display: inline;
}

.desktop-breadcrumb {
  display: flex;
}

.desktop-sider {
  display: block;
}

/* Mobile styles */
@media (max-width: 767px) {
  .mobile-menu-btn {
    display: flex;
  }
  
  .mobile-page-title {
    display: block;
  }
  
  .desktop-breadcrumb {
    display: none;
  }
  
  .desktop-sider {
    display: none;
  }
  
  .user-name {
    display: none;
  }
  
  .main-content {
    padding: 12px !important;
  }
}
</style>
