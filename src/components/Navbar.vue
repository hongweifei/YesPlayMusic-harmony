<template>
  <div>
    <!-- 桌面端顶部导航 -->
    <nav
      class="desktop-nav"
      :class="{ 'has-custom-titlebar': hasCustomTitlebar }"
    >
      <Win32Titlebar v-if="enableWin32Titlebar" />
      <LinuxTitlebar v-if="enableLinuxTitlebar" />
      <div class="navigation-buttons">
        <button-icon @click.native="go('back')"
          ><svg-icon icon-class="arrow-left"
        /></button-icon>
        <button-icon @click.native="go('forward')"
          ><svg-icon icon-class="arrow-right"
        /></button-icon>
      </div>
      <div class="navigation-links">
        <router-link to="/" :class="{ active: $route.name === 'home' }">{{
          $t('nav.home')
        }}</router-link>
        <router-link
          to="/explore"
          :class="{ active: $route.name === 'explore' }"
          >{{ $t('nav.explore') }}</router-link
        >
        <router-link
          to="/library"
          :class="{ active: $route.name === 'library' }"
          >{{ $t('nav.library') }}</router-link
        >
      </div>
      <div class="right-part">
        <div class="search-box">
          <div class="container" :class="{ active: inputFocus }">
            <svg-icon icon-class="search" />
            <div class="input">
              <input
                ref="searchInput"
                v-model="keywords"
                type="search"
                :placeholder="inputFocus ? '' : $t('nav.search')"
                @keydown.enter="doSearch"
                @focus="inputFocus = true"
                @blur="inputFocus = false"
              />
            </div>
          </div>
        </div>
        <img
          class="avatar"
          :src="avatarUrl"
          loading="lazy"
          @click="showUserProfileMenu"
        />
      </div>
    </nav>

    <!-- 移动端底部导航 -->
    <nav class="mobile-nav">
      <router-link
        to="/"
        class="nav-item"
        :class="{ active: $route.name === 'home' }"
      >
        <div class="nav-icon-wrapper">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10 20V14H14V20H19V12H22L12 3L2 12H5V20H10Z"
              fill="currentColor"
            />
          </svg>
        </div>
        <span class="nav-label">{{ $t('nav.home') }}</span>
      </router-link>
      <router-link
        to="/explore"
        class="nav-item"
        :class="{ active: $route.name === 'explore' }"
      >
        <div class="nav-icon-wrapper">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z"
              fill="currentColor"
            />
          </svg>
        </div>
        <span class="nav-label">{{ $t('nav.explore') }}</span>
      </router-link>
      <router-link
        to="/library"
        class="nav-item"
        :class="{ active: $route.name === 'library' }"
      >
        <div class="nav-icon-wrapper">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4 6H2V20C2 21.1 2.9 22 4 22H18V20H4V6ZM20 2H8C6.9 2 6 2.9 6 4V16C6 17.1 6.9 18 8 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H8V4H20V16Z"
              fill="currentColor"
            />
          </svg>
        </div>
        <span class="nav-label">{{ $t('nav.library') }}</span>
      </router-link>
      <router-link
        to="/settings"
        class="nav-item user-nav-item"
        :class="{ active: $route.name === 'settings' }"
      >
        <div class="nav-icon-wrapper">
          <img
            v-if="isLooseLoggedIn"
            class="nav-avatar"
            :src="avatarUrl"
            alt="User"
          />
          <svg-icon v-else icon-class="settings" class="nav-icon" />
        </div>
        <span class="nav-label">{{
          isLooseLoggedIn
            ? $t('nav.user')
            : $t('library.userProfileMenu.settings')
        }}</span>
      </router-link>
    </nav>

    <!-- 移动端搜索框 -->
    <div
      v-if="showMobileSearchBox"
      class="mobile-search-overlay"
      @click="hideMobileSearch"
    >
      <div class="mobile-search-box" @click.stop>
        <div class="search-input-container">
          <svg-icon icon-class="search" />
          <input
            ref="mobileSearchInput"
            v-model="keywords"
            type="search"
            :placeholder="$t('nav.search')"
            @keydown.enter="doSearch"
            @blur="hideMobileSearch"
          />
        </div>
      </div>
    </div>

    <ContextMenu ref="userProfileMenu">
      <div class="item" @click="toSettings">
        <svg-icon icon-class="settings" />
        {{ $t('library.userProfileMenu.settings') }}
      </div>
      <div v-if="!isLooseLoggedIn" class="item" @click="toLogin">
        <svg-icon icon-class="login" />
        {{ $t('login.login') }}
      </div>
      <div v-if="isLooseLoggedIn" class="item" @click="logout">
        <svg-icon icon-class="logout" />
        {{ $t('library.userProfileMenu.logout') }}
      </div>
      <hr />
      <div class="item" @click="toGitHub">
        <svg-icon icon-class="github" />
        {{ $t('nav.github') }}
      </div>
    </ContextMenu>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { isLooseLoggedIn, doLogout } from '@/utils/auth';

// import icons for win32 title bar
// icons by https://github.com/microsoft/vscode-codicons
import 'vscode-codicons/dist/codicon.css';

import Win32Titlebar from '@/components/Win32Titlebar.vue';
import LinuxTitlebar from '@/components/LinuxTitlebar.vue';
import ContextMenu from '@/components/ContextMenu.vue';
import ButtonIcon from '@/components/ButtonIcon.vue';

export default {
  name: 'Navbar',
  components: {
    Win32Titlebar,
    LinuxTitlebar,
    ButtonIcon,
    ContextMenu,
  },
  data() {
    return {
      inputFocus: false,
      langs: ['zh-CN', 'zh-TW', 'en', 'tr'],
      keywords: '',
      enableWin32Titlebar: false,
      enableLinuxTitlebar: false,
      showMobileSearchBox: false,
    };
  },
  computed: {
    ...mapState(['settings', 'data']),
    isLooseLoggedIn() {
      return isLooseLoggedIn();
    },
    avatarUrl() {
      return this.data?.user?.avatarUrl && this.isLooseLoggedIn
        ? `${this.data?.user?.avatarUrl}?param=512y512`
        : 'http://s4.music.126.net/style/web2/img/default/default_avatar.jpg?param=60y60';
    },
    hasCustomTitlebar() {
      return this.enableWin32Titlebar || this.enableLinuxTitlebar;
    },
  },
  created() {
    if (process.platform === 'win32') {
      this.enableWin32Titlebar = true;
    } else if (
      process.platform === 'linux' &&
      this.settings.linuxEnableCustomTitlebar
    ) {
      this.enableLinuxTitlebar = true;
    }
  },
  methods: {
    go(where) {
      if (where === 'back') this.$router.go(-1);
      else this.$router.go(1);
    },
    doSearch() {
      if (!this.keywords) return;
      if (
        this.$route.name === 'search' &&
        this.$route.params.keywords === this.keywords
      ) {
        return;
      }
      this.hideMobileSearch();
      this.$router.push({
        name: 'search',
        params: { keywords: this.keywords },
      });
    },
    showMobileSearch() {
      this.showMobileSearchBox = true;
      this.$nextTick(() => {
        if (this.$refs.mobileSearchInput) {
          this.$refs.mobileSearchInput.focus();
        }
      });
    },
    hideMobileSearch() {
      this.showMobileSearchBox = false;
    },
    showMobileUserMenu(e) {
      // 移动端显示用户菜单，位置在底部导航栏上方
      if (window.innerWidth <= 767) {
        e.preventDefault();
        e.stopPropagation();
        // 创建一个虚拟事件对象，位置在底部导航栏上方
        const rect = e.currentTarget.getBoundingClientRect();
        const menuHeight = 200; // 预估菜单高度
        const fakeEvent = {
          y: rect.top - menuHeight - 10, // 在按钮上方，留出菜单空间
          x: rect.left + rect.width / 2, // 按钮中心位置
          preventDefault: () => {},
          stopPropagation: () => {},
        };
        this.$refs.userProfileMenu.openMenu(fakeEvent);
      } else {
        this.showUserProfileMenu(e);
      }
    },
    showUserProfileMenu(e) {
      this.$refs.userProfileMenu.openMenu(e);
    },
    logout() {
      if (!confirm('确定要退出登录吗？')) return;
      doLogout();
      this.$router.push({ name: 'home' });
    },
    toSettings() {
      this.$router.push({ name: 'settings' });
    },
    toGitHub() {
      window.open('https://github.com/qier222/YesPlayMusic');
    },
    toLogin() {
      if (process.env.IS_ELECTRON === true) {
        this.$router.push({ name: 'loginAccount' });
      } else {
        this.$router.push({ name: 'login' });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
// 桌面端导航
.desktop-nav {
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 64px;
  padding: {
    right: 10vw;
    left: 10vw;
  }
  backdrop-filter: saturate(180%) blur(20px);

  background-color: var(--color-navbar-bg);
  z-index: 100;
  -webkit-app-region: drag;

  // 移动端隐藏桌面导航
  @media (max-width: 767px) {
    display: none;
  }
}

// 移动端底部导航
.mobile-nav {
  display: none;

  @media (max-width: 767px) {
    display: flex;
    position: fixed;
    top: auto; // 明确覆盖任何可能的 top 设置
    bottom: 0;
    left: 0;
    right: 0;
    height: 60px;
    background-color: var(--color-navbar-bg);
    backdrop-filter: saturate(180%) blur(20px);
    border-top: 1px solid var(--color-secondary-bg);
    z-index: 100;
    padding-bottom: env(safe-area-inset-bottom, 0);
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);

    .nav-item {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 8px 4px;
      color: var(--color-secondary);
      text-decoration: none;
      transition: color 0.2s;
      min-height: 60px;

      .nav-icon-wrapper {
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 4px;

        svg {
          width: 24px;
          height: 24px;
          color: inherit;
          fill: currentColor;
        }

        .nav-icon {
          width: 24px;
          height: 24px;
          color: inherit;

          ::v-deep svg {
            width: 24px;
            height: 24px;
            fill: currentColor;
          }
        }
      }

      .nav-label {
        font-size: 11px;
        font-weight: 500;
        text-transform: none;
      }

      &.active {
        color: var(--color-primary);
      }

      &:active {
        opacity: 0.6;
      }
    }

    .user-nav-item {
      cursor: pointer;

      .nav-avatar {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        object-fit: cover;
      }
    }
  }
}

// 移动端搜索框（覆盖层）
.mobile-search-overlay {
  display: none;

  @media (max-width: 767px) {
    display: block;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 200;
    animation: fadeIn 0.2s;
  }
}

.mobile-search-box {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  background-color: var(--color-navbar-bg);
  backdrop-filter: saturate(180%) blur(20px);
  padding: 16px;
  padding-top: calc(16px + env(safe-area-inset-top, 0));
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);

  .search-input-container {
    display: flex;
    align-items: center;
    background: var(--color-secondary-bg-for-transparent);
    border-radius: 12px;
    padding: 12px 16px;
    gap: 12px;

    .svg-icon {
      width: 20px;
      height: 20px;
      color: var(--color-secondary);
      flex-shrink: 0;
    }

    input {
      flex: 1;
      border: none;
      background: transparent;
      font-size: 16px;
      color: var(--color-text);
      font-weight: 500;

      &::placeholder {
        color: var(--color-secondary);
      }
    }
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

// 通用 nav 样式已移到 .desktop-nav，避免影响 .mobile-nav

@media (max-width: 1336px) {
  .desktop-nav {
    padding: 0 max(5vw, 90px);
  }
}

@supports (-moz-appearance: none) {
  .desktop-nav,
  .mobile-nav {
    background-color: var(--color-body-bg);
  }
}

.desktop-nav.has-custom-titlebar {
  padding-top: 20px;
  -webkit-app-region: no-drag;
}

.desktop-nav .navigation-buttons {
  flex: 1;
  display: flex;
  align-items: center;
  .svg-icon {
    height: 24px;
    width: 24px;
  }
  button {
    -webkit-app-region: no-drag;
  }
}
@media (max-width: 970px) {
  .desktop-nav .navigation-buttons {
    flex: unset;
  }
}

.desktop-nav .navigation-links {
  flex: 1;
  display: flex;
  justify-content: center;
  text-transform: uppercase;
  user-select: none;
  a {
    -webkit-app-region: no-drag;
    font-size: 18px;
    font-weight: 700;
    text-decoration: none;
    border-radius: 6px;
    padding: 6px 10px;
    color: var(--color-text);
    transition: 0.2s;
    -webkit-user-drag: none;
    margin: {
      right: 12px;
      left: 12px;
    }
    &:hover {
      background: var(--color-secondary-bg-for-transparent);
    }
    &:active {
      transform: scale(0.92);
      transition: 0.2s;
    }
  }
  a.active {
    color: var(--color-primary);
  }
}

.search {
  .svg-icon {
    height: 18px;
    width: 18px;
  }
}

.desktop-nav .search-box {
  display: flex;
  justify-content: flex-end;
  -webkit-app-region: no-drag;

  .container {
    display: flex;
    align-items: center;
    height: 32px;
    background: var(--color-secondary-bg-for-transparent);
    border-radius: 8px;
    width: 200px;
  }

  .svg-icon {
    height: 15px;
    width: 15px;
    color: var(--color-text);
    opacity: 0.28;
    margin: {
      left: 8px;
      right: 4px;
    }
  }

  input {
    font-size: 16px;
    border: none;
    background: transparent;
    width: 96%;
    font-weight: 600;
    margin-top: -1px;
    color: var(--color-text);
  }

  .active {
    background: var(--color-primary-bg-for-transparent);
    input,
    .svg-icon {
      opacity: 1;
      color: var(--color-primary);
    }
  }
}

[data-theme='dark'] {
  .search-box {
    .active {
      input,
      .svg-icon {
        color: var(--color-text);
      }
    }
  }
}

.desktop-nav .right-part {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  .avatar {
    user-select: none;
    height: 30px;
    margin-left: 12px;
    vertical-align: -7px;
    border-radius: 50%;
    cursor: pointer;
    -webkit-app-region: no-drag;
    -webkit-user-drag: none;
    &:hover {
      filter: brightness(80%);
    }
  }
  .search-button {
    display: none;
    -webkit-app-region: no-drag;
  }
}
</style>
