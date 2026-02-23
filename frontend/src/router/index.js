import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    component: () => import('../layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/inventario'
      },
      {
        path: 'inventario',
        name: 'Inventario',
        component: () => import('../views/Inventario.vue'),
        meta: { title: 'Inventario' }
      },
      {
        path: 'inventario/:id',
        name: 'InventarioDetalle',
        component: () => import('../views/InventarioDetalle.vue'),
        meta: { title: 'Detalle de Inventario' }
      },
      {
        path: 'licencias',
        name: 'Licencias',
        component: () => import('../views/Licencias.vue'),
        meta: { title: 'Licencias' }
      },
      {
        path: 'usuarios',
        name: 'Usuarios',
        component: () => import('../views/Usuarios.vue'),
        meta: { title: 'Usuarios' }
      },
      {
        path: 'departamentos',
        name: 'Departamentos',
        component: () => import('../views/Departamentos.vue'),
        meta: { title: 'Departamentos' }
      },
      {
        path: 'paises',
        name: 'Paises',
        component: () => import('../views/Paises.vue'),
        meta: { title: 'Países' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (to.path === '/login' && authStore.isAuthenticated) {
    next('/inventario')
  } else {
    next()
  }
})

export default router
