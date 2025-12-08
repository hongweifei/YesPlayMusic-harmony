<template>
  <button class="button-icon"><slot></slot></button>
</template>

<script>
export default {
  name: 'ButtonIcon',
};
</script>

<style lang="scss" scoped>
button {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 8px;
  background: transparent;
  margin: 4px;
  border-radius: 25%;
  transition: 0.2s;
  -webkit-tap-highlight-color: transparent;

  @media (max-width: 767px) {
    min-width: 44px;
    min-height: 44px;
    padding: 10px;
  }

  .svg-icon {
    color: var(--color-text);
    height: 16px;
    width: 16px;

    @media (max-width: 767px) {
      height: 20px;
      width: 20px;
    }
  }
  &:first-child {
    margin-left: 0;
  }
  &:hover {
    background: var(--color-secondary-bg-for-transparent);
  }
  &:active {
    transform: scale(0.92);

    @media (max-width: 767px) {
      transform: scale(0.95);
      background: var(--color-secondary-bg-for-transparent);
    }
  }
}
</style>
