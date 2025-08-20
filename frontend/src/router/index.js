import { createRouter, createWebHistory } from 'vue-router';

import Welcome from '../components/Welcome.vue';
import Interview from '../components/Interview.vue';
import Summary from '../components/Summary.vue';

const routes = [
  { path: '/', name: 'Welcome', component: Welcome },
  { path: '/interview', name: 'Interview', component: Interview },
  { path: '/summary', name: 'Summary', component: Summary },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
