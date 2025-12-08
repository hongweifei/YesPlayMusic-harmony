<template>
  <div ref="contextMenu" class="context-menu">
    <div
      v-if="showMenu"
      ref="menu"
      class="menu"
      tabindex="-1"
      :style="{ top: top, left: left }"
      @blur="closeMenu"
      @click="closeMenu"
    >
      <slot></slot>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'ContextMenu',
  data() {
    return {
      showMenu: false,
      top: '0px',
      left: '0px',
    };
  },
  computed: {
    ...mapState(['player']),
  },
  methods: {
    setMenu(top, left) {
      let heightOffset = this.player.enabled ? 64 : 0;
      // 移动端需要考虑底部导航栏高度（60px）和播放器高度
      const isMobile = window.innerWidth <= 767;
      if (isMobile) {
        heightOffset += 60; // 底部导航栏高度
        if (this.player.enabled) {
          heightOffset += 60; // 移动端播放器高度
        }
      }
      let largestHeight =
        window.innerHeight - this.$refs.menu.offsetHeight - heightOffset;
      let largestWidth = window.innerWidth - this.$refs.menu.offsetWidth - 25;

      // 移动端菜单显示在底部导航栏上方
      if (isMobile && this.$refs.menu) {
        // 确保菜单不会超出屏幕顶部
        const menuHeight = this.$refs.menu.offsetHeight || 200;
        const minTop = 10; // 距离顶部最小距离
        const maxTop = window.innerHeight - menuHeight - heightOffset - 10;

        // 如果计算的位置在按钮上方，确保不会超出屏幕
        if (top > maxTop) {
          top = maxTop;
        }
        if (top < minTop) {
          top = minTop;
        }

        // 菜单水平居中显示
        left = left - this.$refs.menu.offsetWidth / 2;

        // 确保菜单不会超出屏幕左右边界
        if (left < 10) left = 10;
        if (left + this.$refs.menu.offsetWidth > window.innerWidth - 10) {
          left = window.innerWidth - this.$refs.menu.offsetWidth - 10;
        }
      } else {
        // 桌面端原有逻辑
        if (top > largestHeight) top = largestHeight;
        if (left > largestWidth) left = largestWidth;
      }

      this.top = top + 'px';
      this.left = left + 'px';
    },

    closeMenu() {
      this.showMenu = false;
      if (this.$parent.closeMenu !== undefined) {
        this.$parent.closeMenu();
      }
      this.$store.commit('enableScrolling', true);
    },

    openMenu(e) {
      this.showMenu = true;
      this.$nextTick(
        function () {
          this.$refs.menu.focus();
          this.setMenu(e.y, e.x);
        }.bind(this)
      );
      e.preventDefault();
      this.$store.commit('enableScrolling', false);
    },
  },
};
</script>

<style lang="scss" scoped>
.context-menu {
  width: 100%;
  height: 100%;
  user-select: none;
}

.menu {
  position: fixed;
  min-width: 136px;
  max-width: 240px;
  list-style: none;
  background: rgba(255, 255, 255, 0.88);
  box-shadow: 0 6px 12px -4px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.06);
  backdrop-filter: blur(12px);
  border-radius: 12px;
  box-sizing: border-box;
  padding: 6px;
  z-index: 1000;
  -webkit-app-region: no-drag;
  transition: background 125ms ease-out, opacity 125ms ease-out,
    transform 125ms ease-out;

  // 移动端菜单样式优化
  @media (max-width: 767px) {
    min-width: 180px;
    max-width: 280px;
    z-index: 101; // 确保在底部导航栏上方，但在其他内容下方
  }

  &:focus {
    outline: none;
  }
}

[data-theme='dark'] {
  .menu {
    background: rgba(36, 36, 36, 0.78);
    backdrop-filter: blur(16px) contrast(120%) brightness(60%);
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: 0 0 6px rgba(255, 255, 255, 0.08);
  }
  .menu .item:hover {
    color: var(--color-text);
  }
}

@supports (-moz-appearance: none) {
  .menu {
    background-color: var(--color-body-bg) !important;
  }
}

.menu .item {
  font-weight: 600;
  font-size: 14px;
  padding: 10px 14px;
  border-radius: 8px;
  cursor: default;
  color: var(--color-text);
  display: flex;
  align-items: center;
  &:hover {
    color: var(--color-primary);
    background: var(--color-primary-bg-for-transparent);
    transition: opacity 125ms ease-out, transform 125ms ease-out;
  }
  &:active {
    opacity: 0.75;
    transform: scale(0.95);
  }

  .svg-icon {
    height: 16px;
    width: 16px;
    margin-right: 5px;
  }
}

hr {
  margin: 4px 10px;
  background: rgba(128, 128, 128, 0.18);
  height: 1px;
  box-shadow: none;
  border: none;
}

.item-info {
  padding: 10px 10px;
  display: flex;
  align-items: center;
  color: var(--color-text);
  cursor: default;
  img {
    height: 38px;
    width: 38px;
    border-radius: 4px;
  }
  .info {
    margin-left: 10px;
  }
  .title {
    font-size: 16px;
    font-weight: 600;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
    overflow: hidden;
    word-break: break-all;
  }
  .subtitle {
    font-size: 12px;
    opacity: 0.68;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
    overflow: hidden;
    word-break: break-all;
  }
}
</style>
