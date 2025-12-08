<template>
  <div id="app" :class="{ 'user-select-none': userSelectNone }">
    <Scrollbar v-show="!showLyrics" ref="scrollbar" />
    <Navbar v-show="showNavbar" ref="navbar" />
    <main
      ref="main"
      :style="{ overflow: enableScrolling ? 'auto' : 'hidden' }"
      @scroll="handleScroll"
    >
      <!-- 移动端搜索栏（在首页、发现页和搜索页显示） -->
      <div v-if="showMobileSearchBar" class="mobile-search-bar">
        <!-- 返回按钮（仅在搜索页显示） -->
        <button v-if="showBackButton" class="back-button" @click="goBack">
          <svg-icon icon-class="arrow-left" />
        </button>
        <div class="search-input-container">
          <svg-icon icon-class="search" />
          <input
            ref="mobileSearchInput"
            v-model="searchKeywords"
            type="search"
            :placeholder="$t('nav.search')"
            @keydown.enter="doSearch"
          />
        </div>
      </div>

      <keep-alive>
        <router-view v-if="$route.meta.keepAlive"></router-view>
      </keep-alive>
      <router-view v-if="!$route.meta.keepAlive"></router-view>
    </main>
    <transition name="slide-up">
      <Player v-if="enablePlayer" v-show="showPlayer" ref="player" />
    </transition>
    <Toast />
    <div
      v-if="showApiConnectionFailed"
      class="api-connection-failed-notice"
      @click="goToSettings"
    >
      <div class="notice-content">
        <div class="notice-text">{{ $t('common.apiConnectionFailed') }}</div>
        <button class="notice-button">{{ $t('common.goToSettings') }}</button>
      </div>
    </div>
    <ModalAddTrackToPlaylist v-if="isAccountLoggedIn" />
    <ModalNewPlaylist v-if="isAccountLoggedIn" />
    <transition v-if="enablePlayer" name="slide-up">
      <Lyrics v-show="showLyrics" />
    </transition>
  </div>
</template>

<script>
import ModalAddTrackToPlaylist from './components/ModalAddTrackToPlaylist.vue';
import ModalNewPlaylist from './components/ModalNewPlaylist.vue';
import Scrollbar from './components/Scrollbar.vue';
import Navbar from './components/Navbar.vue';
import Player from './components/Player.vue';
import Toast from './components/Toast.vue';
import SvgIcon from './components/SvgIcon.vue';
import { ipcRenderer } from './electron/ipcRenderer';
import { isAccountLoggedIn, isLooseLoggedIn } from '@/utils/auth';
import Lyrics from './views/lyrics.vue';
import { mapState } from 'vuex';

export default {
  name: 'App',
  components: {
    Navbar,
    Player,
    Toast,
    ModalAddTrackToPlaylist,
    ModalNewPlaylist,
    Lyrics,
    Scrollbar,
    SvgIcon,
  },
  data() {
    return {
      isElectron: process.env.IS_ELECTRON, // true || undefined
      userSelectNone: false,
      showApiConnectionFailed: false,
      searchKeywords: '',
    };
  },
  computed: {
    ...mapState(['showLyrics', 'settings', 'player', 'enableScrolling']),
    isAccountLoggedIn() {
      return isAccountLoggedIn();
    },
    showPlayer() {
      const excludedRoutes = [
        'mv',
        'loginUsername',
        'login',
        'loginAccount',
        'lastfmCallback',
      ];

      // 移动端在设置页面也隐藏播放器
      const isMobile = window.innerWidth <= 767;
      if (isMobile && this.$route.name === 'settings') {
        return false;
      }

      return excludedRoutes.includes(this.$route.name) === false;
    },
    enablePlayer() {
      return this.player.enabled && this.$route.name !== 'lastfmCallback';
    },
    showNavbar() {
      return this.$route.name !== 'lastfmCallback';
    },
    // 移动端搜索栏显示条件：在首页、发现页和搜索页显示
    showMobileSearchBar() {
      return ['home', 'explore', 'search'].includes(this.$route.name);
    },
    // 是否显示返回按钮（仅在搜索页显示）
    showBackButton() {
      return this.$route.name === 'search';
    },
  },
  watch: {
    $route(to) {
      // 如果跳转到设置页面，隐藏提示
      if (to.name === 'settings') {
        this.showApiConnectionFailed = false;
      }
      // 同步搜索关键词
      this.syncSearchKeywords();
    },
  },
  created() {
    if (this.isElectron) ipcRenderer(this);
    window.addEventListener('keydown', this.handleKeydown);
    // 监听 API 连接失败事件
    window.addEventListener(
      'api-connection-failed',
      this.handleApiConnectionFailed
    );
    this.fetchData();
    this.syncSearchKeywords();
  },
  mounted() {
    // 移动端首次打开时，如果当前路由不是底部导航中的页面，跳转到首页
    this.handleMobileFirstVisit();
  },
  beforeDestroy() {
    // 清理事件监听器
    window.removeEventListener('keydown', this.handleKeydown);
    window.removeEventListener(
      'api-connection-failed',
      this.handleApiConnectionFailed
    );
  },
  methods: {
    handleKeydown(e) {
      if (e.code === 'Space') {
        if (e.target.tagName === 'INPUT') return false;
        if (this.$route.name === 'mv') return false;
        e.preventDefault();
        this.player.playOrPause();
      }
    },
    fetchData() {
      if (!isLooseLoggedIn()) return;
      this.$store.dispatch('fetchLikedSongs');
      this.$store.dispatch('fetchLikedSongsWithDetails');
      this.$store.dispatch('fetchLikedPlaylist');
      if (isAccountLoggedIn()) {
        this.$store.dispatch('fetchLikedAlbums');
        this.$store.dispatch('fetchLikedArtists');
        this.$store.dispatch('fetchLikedMVs');
        this.$store.dispatch('fetchCloudDisk');
      }
    },
    handleScroll() {
      this.$refs.scrollbar.handleScroll();
    },
    handleApiConnectionFailed() {
      // 仅在非 Electron 模式下显示提示
      if (process.env.IS_ELECTRON) {
        return;
      }

      // 如果已经在设置页面，不显示提示
      if (this.$route.name === 'settings') {
        return;
      }

      // 显示提示框
      this.showApiConnectionFailed = true;
    },
    goToSettings() {
      this.showApiConnectionFailed = false;
      if (this.$route.name !== 'settings') {
        this.$router.push({ name: 'settings' });
      }
    },
    doSearch() {
      if (!this.searchKeywords) return;
      if (
        this.$route.name === 'search' &&
        this.$route.params.keywords === this.searchKeywords
      ) {
        return;
      }
      this.$router.push({
        name: 'search',
        params: { keywords: this.searchKeywords },
      });
    },
    // 监听路由变化，同步搜索关键词
    syncSearchKeywords() {
      if (this.$route.name === 'search') {
        this.searchKeywords = this.$route.params.keywords ?? '';
      } else if (['home', 'explore'].includes(this.$route.name)) {
        // 在首页和发现页，清空搜索关键词
        this.searchKeywords = '';
      }
    },
    goBack() {
      // 返回上一页，如果没有历史记录则返回首页
      if (window.history.length > 1) {
        this.$router.go(-1);
      } else {
        this.$router.push({ name: 'home' });
      }
    },
    handleMobileFirstVisit() {
      // 仅在移动端执行
      const isMobile = window.innerWidth <= 767;
      if (!isMobile) return;

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

      // 如果当前路由不在允许列表中，跳转到首页
      // 但只在首次加载时执行（避免影响正常导航）
      if (!allowedRoutes.includes(this.$route.name)) {
        // 检查是否是首次访问（通过检查是否有历史记录）
        // 如果历史记录只有1条，说明是首次访问
        if (window.history.length <= 1) {
          this.$router.replace({ name: 'home' });
        }
      }
    },
  },
};
</script>

<style lang="scss">
#app {
  width: 100%;
  transition: all 0.4s;
}

main {
  position: fixed;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  overflow: auto;
  padding: 64px 10vw 96px 10vw;
  box-sizing: border-box;
  scrollbar-width: none; // firefox
  -webkit-overflow-scrolling: touch; // 移动端滚动优化
}

@media (max-width: 1336px) {
  main {
    padding: 64px 5vw 96px 5vw;
  }
}

// 移动端搜索栏样式
.mobile-search-bar {
  display: none;

  @media (max-width: 767px) {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    padding-top: calc(12px + env(safe-area-inset-top, 0));
    margin-bottom: 16px;

    .back-button {
      flex-shrink: 0;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--color-secondary-bg-for-transparent);
      border: none;
      border-radius: 12px;
      cursor: pointer;
      color: var(--color-text);
      transition: all 0.2s;

      &:active {
        opacity: 0.6;
        transform: scale(0.95);
      }

      .svg-icon {
        width: 20px;
        height: 20px;
        color: inherit;
      }
    }

    .search-input-container {
      flex: 1;
      display: flex;
      align-items: center;
      background: var(--color-secondary-bg-for-transparent);
      border-radius: 12px;
      padding: 10px 14px;
      gap: 10px;
      min-height: 1.5rem;

      .svg-icon {
        width: 18px;
        height: 18px;
        color: var(--color-secondary);
        flex-shrink: 0;
      }

      input {
        flex: 1;
        border: none;
        background: transparent;
        font-size: 15px;
        color: var(--color-text);
        font-weight: 500;
        line-height: 1.5;

        &::placeholder {
          color: var(--color-secondary);
        }

        &:focus {
          outline: none;
        }
      }
    }
  }
}

// 移动端布局调整
@media (max-width: 767px) {
  main {
    padding: 0 16px 124px 16px; // 底部为播放器(64px)+底部导航栏(60px)预留空间
    padding-top: env(safe-area-inset-top, 0); // 适配刘海屏
    padding-bottom: calc(
      124px + env(safe-area-inset-bottom, 0)
    ); // 底部安全区域：播放器64px + 导航栏60px = 124px
  }
}

main::-webkit-scrollbar {
  width: 0px;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.4s;
}
.slide-up-enter,
.slide-up-leave-to {
  transform: translateY(100%);
}

.api-connection-failed-notice {
  position: fixed;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1020;
  cursor: pointer;
  animation: slideDown 0.3s ease-out;

  @media (max-width: 767px) {
    top: 16px;
    left: 16px;
    right: 16px;
    transform: none;
    width: auto;
  }
}

.notice-content {
  display: flex;
  align-items: center;
  gap: 16px;
  background: rgba(255, 87, 34, 0.95);
  color: white;
  padding: 12px 20px;
  border-radius: 8px;
  box-shadow: 0 8px 16px -4px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  min-width: 320px;
  max-width: 600px;

  @media (max-width: 767px) {
    min-width: auto;
    max-width: 100%;
    flex-direction: column;
    gap: 12px;
    padding: 16px;
  }
}

.notice-text {
  flex: 1;
  font-size: 14px;
  line-height: 1.5;
}

.notice-button {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  padding: 6px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    border-color: rgba(255, 255, 255, 0.5);
  }

  &:active {
    transform: scale(0.95);
  }
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

[data-theme='dark'] {
  .notice-content {
    background: rgba(244, 67, 54, 0.95);
  }
}
</style>
