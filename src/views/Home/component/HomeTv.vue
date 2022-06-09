<template>
  <LazyBlock class="home-tv" :class="{ 'aw-skeleton': !isInit }">
    <h2>
      <span>番外</span>
    </h2>
    <div class="home-tv__inner">
      <ComicTvCard v-for="item in tv" :key="item.id" :detail="item" />
    </div>
  </LazyBlock>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import * as SectionType from '../types/homeSection.type'
import ComicTvCard from './ComicTvCard.vue'
import LazyBlock from '@comps/Transition/LazyBlock.vue'
export default defineComponent({
  name: 'HomeTv',
  components: {
    ComicTvCard,
    LazyBlock
  },
  props: {
    tv: {
      type: Array as PropType<SectionType.Comic['tv']>,
      default: () => []
    },
    isInit: {
      type: Boolean,
      default: true
    }
  },
  setup() {
    return {}
  }
})
</script>
<style lang="less" scoped>
@import '../style/home-child';
.home-tv {
  position: relative;
  width: 800px;
  height: 334px;
  display: flex;
  flex-direction: column;
  border-radius: 14px;
  h2 {
    .home-child-title('SIDE SHOW');
  }
  &__inner {
    display: flex;
    flex: 1;
    margin-top: 20px;
    gap: 20px;
    padding-bottom: 10px;
  }
}
</style>
