<template>
  <div class="aw-slide-item">
    <slot />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { AWSLIDE_KEY } from './const'
import { useParent } from '@/utils/vant/useRelation/index'
export default defineComponent({
  name: 'AwSlideItem',
  setup() {
    useParent(AWSLIDE_KEY)
    return {}
  }
})
</script>
