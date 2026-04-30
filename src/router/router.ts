import { createRouter, createWebHistory } from 'vue-router';
import { routes, handleHotUpdate } from 'vue-router/auto-routes';
import { useAccountStore } from '@stores/account.store';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    }

    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth',
        top: 100,
      };
    }

    return { top: 0 };
  },
  routes,
});

// Navigation guard to check authentication
router.beforeEach(async (to, from, next) => {
  const accountStore = useAccountStore();
  accountStore.initializeAuthState();

  // Handle email parameter
  if (to.query.email) {
    const email = decodeURIComponent((to.query.email as string)?.replace(/\s|[%]20/g, '%2B'));
    accountStore.guestEmail = email || '';
    const { email: _, ...queryWithoutEmail } = to.query;
    next({ ...to, query: queryWithoutEmail });
    return; // NOTE return, so we don't intercept interrupted path
  }

  if (to.meta.requiresAuth && !accountStore.isAuthenticated) {
    try {
      localStorage.setItem('interruptedPath', to.fullPath);
    } catch (error) {
      console.warn('Failed to store interrupted path:', error);
    }
    next({ name: 'Login' });
    return;
  }

  if (!to.meta.requiresAuth && !to.meta.public && accountStore.isAuthenticated) {
    // make sure to remove the token from the url
    const { token: _, ...queryWithoutToken } = to.query;
    next({ name: from?.name || 'Home', query: queryWithoutToken });
    return;
  }

  next();
});

if (import.meta.hot) {
  handleHotUpdate(router);
}

export default router;
