<template>
  <div class="comic-card__info" :style="selfStyle">
    <header>{{ detail.title }}</header>
    <footer>
      <p>{{ detail.season }}</p>
    </footer>
  </div>
</template>

<script lang="ts">
import { computed, CSSProperties, defineComponent, PropType } from 'vue'
import * as Api from '@/api'

export default defineComponent({
  name: 'ComicCardInfo',
  props: {
    detail: {
      type: Object as PropType<Api.SearchComicReturn['data'][0]>,
      default: null
    }
  },
  setup(props) {
    const selfStyle = computed(
      () =>
        ({
          backgroundImage: `url(${props.detail?.cover})`
        } as CSSProperties)
    )
    return {
      selfStyle
    }
  }
})
</script>
<style lang="less" scoped>
.comic-card__info {
  @padding: 12px;
  position: relative;
  width: 100%;
  aspect-ratio: 5/6;
  background-size: cover;
  background-position: center;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  header {
    display: flex;
    align-items: center;
    width: 100%;
    padding: @padding;
    box-sizing: border-box;
    color: #fff;
    font-size: 16px;
    line-height: 18px;
    background: rgba(255, 255, 255, 0);
    backdrop-filter: blur(14px);
    text-shadow: 0 0 8px rgba(0, 0, 0, 0.4);
  }
  footer {
    position: relative;
    width: 100%;
    padding: 20px @padding @padding @padding;
    box-sizing: border-box;
    &::before {
      .mask(2,rgba(255, 255, 255, 0.2));
      backdrop-filter: blur(14px);
    }
    &::after {
      .mask(1,rgba(255, 255, 255, 0.6));
      height: 50%;
      transform: translateY(-50%) scale(1.2);
      filter: blur(4px);
    }
    p {
      position: relative;
      z-index: 3;
      color: #eee;
      font-size: 14px;
    }
  }
}
</style>
