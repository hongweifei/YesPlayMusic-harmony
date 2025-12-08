<template>
  <div class="login">
    <div class="section-1">
      <img src="/img/logos/yesplaymusic.png" />
      <svg-icon icon-class="x"></svg-icon>
      <img src="/img/logos/netease-music.png" />
    </div>
    <div class="section-2">
      <div
        class="card"
        @mouseover="activeCard = 1"
        @mouseleave="activeCard = 0"
        @click="goTo('account')"
      >
        <div class="container" :class="{ active: activeCard === 1 }">
          <div class="title-info">
            <div class="title">{{ $t('login.loginText') }}</div>
            <div class="info">{{ $t('login.accessToAll') }}</div>
          </div>
          <svg-icon icon-class="arrow-right"></svg-icon>
        </div>
      </div>
      <div
        class="card"
        @mouseover="activeCard = 2"
        @mouseleave="activeCard = 0"
        @click="goTo('username')"
      >
        <div class="container" :class="{ active: activeCard === 2 }">
          <div class="title-info">
            <div class="title">{{ $t('login.search') }}</div>
            <div class="info">{{ $t('login.readonly') }}</div>
          </div>
          <svg-icon icon-class="arrow-right"></svg-icon>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import NProgress from 'nprogress';

import SvgIcon from '@/components/SvgIcon.vue';

export default {
  name: 'Login',
  components: {
    SvgIcon,
  },
  data() {
    return {
      activeCard: 0,
    };
  },
  created() {
    NProgress.done();
  },
  methods: {
    goTo(path) {
      this.$router.push({ path: '/login/' + path });
    },
  },
};
</script>

<style lang="scss" scoped>
.login {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: calc(100vh - 192px);

  @media (max-width: 767px) {
    height: calc(100vh - 120px);
    padding: 20px;
  }
}

.section-1 {
  margin-bottom: 16px;
  display: flex;
  align-items: center;

  @media (max-width: 767px) {
    margin-bottom: 24px;
  }

  img {
    height: 64px;
    margin: 20px;

    @media (max-width: 767px) {
      height: 48px;
      margin: 12px;
    }
  }
  .svg-icon {
    height: 24px;
    width: 24px;
    color: rgba(82, 82, 82, 0.28);

    @media (max-width: 767px) {
      height: 20px;
      width: 20px;
    }
  }
}

.section-2 {
  display: flex;
  align-items: center;
  flex-direction: column;

  @media (max-width: 767px) {
    width: 100%;
  }
}
.card {
  cursor: pointer;
  margin-top: 14px;
  margin-bottom: 14px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #eaeffd;
  border-radius: 8px;
  height: 128px;
  width: 300px;
  transition: all 0.3s;
  padding-left: 22px;
  box-sizing: border-box;

  @media (max-width: 767px) {
    width: 100%;
    max-width: 100%;
    height: 100px;
    padding-left: 16px;
  }

  .active {
    .title-info {
      transform: translateX(-8px);
    }
    .svg-icon {
      opacity: 1;
      visibility: visible;
      transform: translateX(8px);
    }
  }

  .container {
    display: flex;
    // justify-content: space-around;
    align-items: center;

    color: #335eea;
  }

  .title-info {
    transition: all 0.3s;
  }

  .title {
    font-size: 24px;
    font-weight: 600;

    @media (max-width: 767px) {
      font-size: 20px;
    }
  }
  .info {
    margin-top: 2px;
    font-size: 14px;
    color: rgba(51, 94, 234, 0.78);

    @media (max-width: 767px) {
      font-size: 12px;
    }
  }
  .svg-icon {
    opacity: 0;
    height: 24px;
    width: 24px;
    margin-left: 16px;
    transition: all 0.3s;

    @media (max-width: 767px) {
      height: 20px;
      width: 20px;
      margin-left: 12px;
    }
  }
}
</style>
