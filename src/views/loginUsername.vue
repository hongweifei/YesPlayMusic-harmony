<template>
  <div class="login">
    <div>
      <div class="title">{{ $t('login.usernameLogin') }}</div>
      <div class="section">
        <div class="search-box">
          <div class="container">
            <svg-icon icon-class="search" />
            <div class="input">
              <input
                v-model="keyword"
                :placeholder="$t('login.searchHolder')"
                @keydown.enter="throttleSearch"
              />
            </div>
          </div>
        </div>
      </div>
      <div class="sestion">
        <div v-show="activeUser.nickname === undefined" class="name">
          {{ $t('login.enterTip') }}
        </div>
        <div v-show="activeUser.nickname !== undefined" class="name">
          {{ $t('login.choose') }}
        </div>
        <div class="user-list">
          <div
            v-for="user in result"
            :key="user.id"
            class="user"
            :class="{ active: user.nickname === activeUser.nickname }"
            @click="activeUser = user"
          >
            <img
              class="head"
              :src="user.avatarUrl | resizeImage"
              loading="lazy"
            />
            <div class="nickname">
              {{ user.nickname }}
            </div>
          </div>
        </div>
      </div>
      <ButtonTwoTone
        v-show="activeUser.nickname !== undefined"
        @click.native="confirm"
      >
        {{ $t('login.confirm') }}
      </ButtonTwoTone>
    </div>
  </div>
</template>

<script>
import { mapMutations } from 'vuex';
import NProgress from 'nprogress';
import { search } from '@/api/others';
import { userPlaylist } from '@/api/user';
import { throttle } from '@/utils/common';

import ButtonTwoTone from '@/components/ButtonTwoTone.vue';

export default {
  name: 'LoginUsername',
  components: {
    ButtonTwoTone,
  },
  data() {
    return {
      keyword: '',
      result: [],
      activeUser: {},
    };
  },
  created() {
    NProgress.done();
  },
  methods: {
    ...mapMutations(['updateData']),
    search() {
      if (!this.keyword) return;
      search({ keywords: this.keyword, limit: 9, type: 1002 }).then(data => {
        this.result = data.result.userprofiles;
        this.activeUser = this.result[0];
      });
    },
    confirm() {
      this.updateData({ key: 'user', value: this.activeUser });
      this.updateData({ key: 'loginMode', value: 'username' });
      userPlaylist({
        uid: this.activeUser.userId,
        limit: 1,
      }).then(data => {
        this.updateData({
          key: 'likedSongPlaylistID',
          value: data.playlist[0].id,
        });
        this.$router.push({ path: '/library' });
      });
    },
    throttleSearch: throttle(function () {
      this.search();
    }, 500),
  },
};
</script>

<style lang="scss" scoped>
.login {
  display: flex;
  color: var(--color-text);

  @media (max-width: 767px) {
    flex-direction: column;
    padding: 20px;
  }
}

.title {
  font-size: 42px;
  font-weight: 700;
  margin-bottom: 48px;

  @media (max-width: 767px) {
    font-size: 28px;
    margin-bottom: 32px;
  }
}

.sestion {
  margin-top: 18px;

  @media (max-width: 767px) {
    margin-top: 16px;
  }

  .name {
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 8px;
    opacity: 0.78;

    @media (max-width: 767px) {
      font-size: 13px;
    }
  }
}

.search-box {
  @media (max-width: 767px) {
    width: 100%;
  }

  .container {
    display: flex;
    align-items: center;
    height: 48px;
    border-radius: 11px;
    width: 326px;
    background: var(--color-primary-bg);

    @media (max-width: 767px) {
      width: 100%;
      height: 44px;
    }
  }

  .svg-icon {
    height: 22px;
    width: 22px;
    color: var(--color-primary);
    margin: {
      left: 12px;
      right: 8px;
    }

    @media (max-width: 767px) {
      height: 20px;
      width: 20px;
      margin-left: 10px;
      margin-right: 6px;
    }
  }

  input {
    flex: 1;
    font-size: 22px;
    border: none;
    background: transparent;
    width: 115%;
    font-weight: 600;
    margin-top: -1px;
    color: var(--color-primary);

    @media (max-width: 767px) {
      font-size: 16px;
      width: 100%;
    }

    &::placeholder {
      color: var(--color-primary);
      opacity: 0.78;
    }
  }
}

.user-list {
  display: flex;
  flex-wrap: wrap;
  margin-top: 24px;
  margin-bottom: 24px;

  @media (max-width: 767px) {
    margin-top: 16px;
    margin-bottom: 16px;
    gap: 8px;
  }
}

.user {
  margin-right: 16px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  padding: 12px 12px 12px 16px;
  border-radius: 8px;
  width: 256px;
  transition: 0.2s;
  user-select: none;

  @media (max-width: 767px) {
    width: 100%;
    margin-right: 0;
    margin-bottom: 0;
    padding: 10px 12px;
  }

  .head {
    border-radius: 50%;
    height: 44px;
    width: 44px;

    @media (max-width: 767px) {
      height: 40px;
      width: 40px;
    }
  }
  .nickname {
    font-size: 18px;
    margin-left: 12px;

    @media (max-width: 767px) {
      font-size: 16px;
      margin-left: 10px;
    }
  }
  &:hover {
    background: var(--color-secondary-bg);
  }
}

.user.active {
  transition: 0.2s;
  background: var(--color-primary-bg);
  .nickname {
    color: var(--color-primary);
  }
}
</style>
