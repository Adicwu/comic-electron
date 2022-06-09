<template>
  <div
    ref="selfDom"
    class="aw-video__progress"
    :class="{ 'aw-video__progress-hide': !hasCurListenlist }"
    @mouseenter="initStyle"
    @mousemove="onMove"
    @touchmove="onMove"
    @mousedown="progressing"
    @touchstart="progressing"
  >
    <div class="aw-video__progress-tooltip" :style="tooltipStyle">
      <div class="preview">
        <img v-if="previewImg" :src="previewImg" />
        <span>{{ sToMs(tooltipTime) }}</span>
      </div>
    </div>
    <div class="aw-video__progress-indicator" :style="tooltipStyle">
      <Icon name="icon_love_hover" />
      <Icon name="icon_love_hover" />
    </div>
    <AwSlider
      v-model="sliderVal"
      :parts="bufferedListPercent"
      v-bind="$attrs"
      @change="(e) => $emit('change', e)"
    />
  </div>
</template>

<script lang="ts">
import {
  computed,
  CSSProperties,
  defineComponent,
  onMounted,
  PropType,
  reactive,
  ref,
  watch
} from 'vue'
import { sToMs } from 'adicw-utils'
import { onWindowSizeChange } from '@/utils/vant/useWindowSize'
import AwSlider from '@/components/AwSlider/AwSlider.vue'
export default defineComponent({
  name: 'AwVideoProgress',
  components: {
    AwSlider
  },
  props: {
    duration: {
      type: Number,
      default: 0
    },
    currentTime: {
      type: Number,
      default: 0
    },
    bufferedList: {
      type: Array as PropType<[number, number][]>,
      default: () => []
    },
    previewImg: {
      type: String,
      default: ''
    }
  },
  emits: {
    timeChange: (e: number) => e,
    timePreview: (e: number) => e,
    /** 继承于AwSlider组件 */
    change: (e: number) => e,
    progressing: null,
    progressend: null
  },
  setup(props, { emit }) {
    const selfDom = ref<HTMLElement>()

    const self = reactive({
      width: 0,
      offsetX: 0
    })
    const mouse = reactive({
      x: 0
    })
    const sliderVal = ref(0)
    const hasCurListenlist = computed(() => true)
    const tooltipStyle = computed(() => {
      return {
        transform: `translateX(${mouse.x}px)`
      } as CSSProperties
    })
    const tooltipTime = computed(() => {
      const { duration } = props
      const time = (mouse.x / self.width) * duration
      return time | 0
    })
    const bufferedListPercent = computed(
      () =>
        props.bufferedList.map((item) =>
          item.map((num) => +((num / props.duration) * 100).toFixed(2))
        ) as [number, number][]
    )

    const progressing = () => emit('progressing')
    const progressend = () => emit('progressend')
    const onMove = async (e: MouseEvent | TouchEvent) => {
      if (!hasCurListenlist.value) return
      let x = 0
      switch (e.type) {
        case 'touchmove': {
          x = (e as TouchEvent).changedTouches[0].pageX
          break
        }
        case 'mousemove': {
          x = (e as MouseEvent).pageX
          break
        }
      }
      mouse.x = x - self.offsetX
      emit('timePreview', tooltipTime.value)
    }
    const initStyle = async () => {
      self.width = selfDom.value!.clientWidth
      self.offsetX = selfDom.value!.getBoundingClientRect().left
    }
    const changProgress = () => {
      if (!hasCurListenlist.value) return
      emit('timeChange', tooltipTime.value)
    }
    const computeCurArea = (currentTime: number) =>
      currentTime === 0 ? 0 : +((currentTime / props.duration) * 100).toFixed(2)

    watch(
      () => props.currentTime,
      (val) => {
        sliderVal.value = computeCurArea(val)
      }
    )

    onMounted(initStyle)
    onWindowSizeChange(initStyle)

    return {
      onMove,
      tooltipStyle,
      selfDom,
      tooltipTime,
      self,
      changProgress,
      sToMs,
      hasCurListenlist,
      progressing,
      progressend,
      bufferedListPercent,
      sliderVal,
      initStyle
    }
  }
})
</script>
<style lang="less" scoped>
.aw-video__progress {
  @offset: 4px;
  position: absolute;
  top: -@offset;
  width: 100%;
  padding: 4px 0;
  &:hover {
    .aw-video__progress-tooltip,
    .aw-video__progress-indicator {
      opacity: 1;
    }
  }
  .progress {
    opacity: 1;
    transform: translateY(0);
    transition: all 0.25s;
  }
  &-tooltip {
    position: absolute;
    bottom: 26px;
    left: -20px;
    padding: 0 8px;
    background: rgb(0 0 0 / 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    color: #fff;
    border-radius: 8px;
    opacity: 0;
    transition: opacity 0.25s;

    .preview {
      position: relative;
      width: 140px;
      img {
        width: 100%;
        object-fit: cover;
      }
      span {
        position: absolute;
        left: 4px;
        bottom: 4px;
        margin: 0 auto;
        font-size: 14px;
        padding: 2px 4px;
        background: rgba(0, 0, 0, 0.7);
      }
    }
  }
  &-hide {
    cursor: unset;
    .aw-video__progress-tooltip {
      opacity: 0 !important;
    }
    .progress {
      opacity: 0;
      transform: translateY(100px);
    }
  }
  &-indicator {
    @width: 12px;
    position: absolute;
    left: calc(-@width / 2);
    top: -@width;
    width: @width;
    height: 100%;
    z-index: -1;
    padding: @width 0;
    opacity: 0;
    i {
      position: absolute;
      font-size: @width;
      color: crimson;
      opacity: 0.9;
      &:first-child {
        top: @offset;
      }
      &:last-child {
        bottom: @offset;
        transform: rotate(180deg);
      }
    }
  }
}
</style>
