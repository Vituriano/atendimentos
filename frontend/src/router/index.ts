import { createRouter, createWebHistory, NavigationGuardNext } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import AppLayout from '../layouts/AppLayout.vue';
import LoginLayout from '../layouts/LoginLayout.vue';

const routes = [
  { path: '/', redirect: '/fila' },
  {
    path: '/',
    component: AppLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: 'fila',
        component: () => import('../views/Fila.vue'),
        meta: { title: 'Fila de Atendimento' },
      },
      {
        path: 'briefing',
        component: () => import('../views/Briefing.vue'),
        meta: { title: 'Briefing Clínico' },
      },
      {
        path: 'pacientes',
        component: () => import('../views/Pacientes.vue'),
        meta: { title: 'Base de Pacientes' },
      },
      {
        path: 'admin',
        component: () => import('../views/Admin.vue'),
        meta: { title: 'Admin' },
      },
    ],
  },
  {
    path: '/login',
    component: LoginLayout,
    children: [
      {
        path: '',
        name: 'Login',
        component: () => import('../views/Login.vue'),
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, _from, next: NavigationGuardNext) => {
  // Pinia store must be used inside a function to ensure it's initialized
  const authStore = useAuthStore();

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'Login' });
  } else {
    next();
  }
});

export default router;
