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
        path: 'consulta',
        component: () => import('../views/Consulta.vue'),
        meta: { title: 'Formulário de Consulta' },
      },
      {
        path: 'caderneta',
        component: () => import('../views/Caderneta.vue'),
        meta: { title: 'Caderneta Digital' },
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
        meta: { title: 'Login' },
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach((to, _from, next: NavigationGuardNext) => {
  document.title = to.meta.title ? `${to.meta.title} — HC Pediatria` : 'HC Pediatria'

  // Pinia store must be used inside a function to ensure it's initialized
  const authStore = useAuthStore();

  if (to.matched.some(r => r.meta.requiresAuth) && !authStore.isAuthenticated) {
    next({ name: 'Login' });
  } else {
    next();
  }
});

export default router;
