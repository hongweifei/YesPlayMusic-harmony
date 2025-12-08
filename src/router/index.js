import Vue from 'vue';
import VueRouter from 'vue-router';
import { isLooseLoggedIn, isAccountLoggedIn } from '@/utils/auth';

Vue.use(VueRouter);
const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/home.vue'),
    meta: {
      keepAlive: true,
      savePosition: true,
    },
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/login.vue'),
  },
  {
    path: '/login/username',
    name: 'loginUsername',
    component: () => import('@/views/loginUsername.vue'),
  },
  {
    path: '/login/account',
    name: 'loginAccount',
    component: () => import('@/views/loginAccount.vue'),
  },
  {
    path: '/playlist/:id',
    name: 'playlist',
    component: () => import('@/views/playlist.vue'),
  },
  {
    path: '/album/:id',
    name: 'album',
    component: () => import('@/views/album.vue'),
  },
  {
    path: '/artist/:id',
    name: 'artist',
    component: () => import('@/views/artist.vue'),
    meta: {
      keepAlive: true,
      savePosition: true,
    },
  },
  {
    path: '/artist/:id/mv',
    name: 'artistMV',
    component: () => import('@/views/artistMV.vue'),
    meta: {
      keepAlive: true,
    },
  },
  {
    path: '/mv/:id',
    name: 'mv',
    component: () => import('@/views/mv.vue'),
  },
  {
    path: '/next',
    name: 'next',
    component: () => import('@/views/next.vue'),
    meta: {
      keepAlive: true,
      savePosition: true,
    },
  },
  {
    path: '/search/:keywords?',
    name: 'search',
    component: () => import('@/views/search.vue'),
    meta: {
      keepAlive: true,
    },
  },
  {
    path: '/search/:keywords/:type',
    name: 'searchType',
    component: () => import('@/views/searchType.vue'),
  },
  {
    path: '/new-album',
    name: 'newAlbum',
    component: () => import('@/views/newAlbum.vue'),
  },
  {
    path: '/explore',
    name: 'explore',
    component: () => import('@/views/explore.vue'),
    meta: {
      keepAlive: true,
      savePosition: true,
    },
  },
  {
    path: '/library',
    name: 'library',
    component: () => import('@/views/library.vue'),
    meta: {
      requireLogin: true,
      keepAlive: true,
      savePosition: true,
    },
  },
  {
    path: '/library/liked-songs',
    name: 'likedSongs',
    component: () => import('@/views/playlist.vue'),
    meta: {
      requireLogin: true,
    },
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('@/views/settings.vue'),
  },
  {
    path: '/daily/songs',
    name: 'dailySongs',
    component: () => import('@/views/dailyTracks.vue'),
    meta: {
      requireAccountLogin: true,
    },
  },
  {
    path: '/lastfm/callback',
    name: 'lastfmCallback',
    component: () => import('@/views/lastfmCallback.vue'),
  },
];

const router = new VueRouter({
  mode: process.env.IS_ELECTRON ? 'hash' : 'history',
  routes,
});

const originalPush = VueRouter.prototype.push;
VueRouter.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err);
};

router.beforeEach((to, from, next) => {
  // 移动端首次访问时自动跳转到首页（考虑底部导航）
  const isMobile = window.innerWidth <= 767;
  if (isMobile) {
    // 检测是否是首次访问（没有来源路由或来源路由是 undefined）
    const isFirstVisit = from.name === null || from.name === undefined;

    // 底部导航栏中的路由（允许直接访问）
    const bottomNavRoutes = ['home', 'explore', 'library', 'settings'];

    // 其他允许的路由（登录相关、回调等）
    const otherAllowedRoutes = [
      'login',
      'loginUsername',
      'loginAccount',
      'lastfmCallback',
    ];

    const allowedRoutes = [...bottomNavRoutes, ...otherAllowedRoutes];

    // 如果是首次访问，且当前路由不在允许列表中，跳转到首页
    if (isFirstVisit && !allowedRoutes.includes(to.name)) {
      next({ name: 'home', replace: true });
      return;
    }
  }

  // 需要登录的逻辑
  if (to.meta.requireAccountLogin) {
    if (isAccountLoggedIn()) {
      next();
    } else {
      next({ path: '/login/account' });
    }
  }
  if (to.meta.requireLogin) {
    if (isLooseLoggedIn()) {
      next();
    } else {
      if (process.env.IS_ELECTRON === true) {
        next({ path: '/login/account' });
      } else {
        next({ path: '/login' });
      }
    }
  } else {
    next();
  }
});

export default router;
