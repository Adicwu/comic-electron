<template>
  <div v-if="detail" class="comic-card" @click="toComicMain(detail!.id)">
    <div class="cover">
      <HoverImgCard :src="detail.cover" />
    </div>
    <AttachedContainer :offset-x="12" :width="240">
      <ComicCardInfo :detail="detail" />
    </AttachedContainer>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'

import * as Api from '@/api'
import { toComicMain } from '@/hooks/router'

import HoverImgCard from '@/components/Transition/HoverImgCard.vue'
import AttachedContainer from '@/components/Container/AttachedContainer.vue'
import ComicCardInfo from './ComicCardInfo.vue'

export default defineComponent({
  name: 'ComicCard',
  components: {
    HoverImgCard,
    AttachedContainer,
    ComicCardInfo
  },
  props: {
    detail: {
      type: Object as PropType<Api.SearchComicReturn['data'][0] | null>,
      default: null
    }
  },
  setup() {
    return {
      toComicMain
    }
  }
})
</script>
<style lang="less" scoped>
.comic-card {
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  box-sizing: border-box;
  .cover {
    flex: 1;
    width: 100%;
    aspect-ratio: 1/1.4;
  }
  .info {
    p {
      font-size: 18px;
    }
  }
}
</style>
