<template>
  <div ref="selfEl" class="aw-slider" @mouseenter="styleInit">
    <div class="aw-slider__runway" :style="runwayStyle" @click="changeValue">
      <div class="aw-slider__bar" :style="barStyle"></div>
      <div class="aw-slider__part">
        <div
          v-for="(item, index) in partsStyleList"
          :key="index"
          class="aw-slider__part-item"
          :style="item"
        ></div>
      </div>
      <div
        class="aw-slider__btn"
        :class="{ active: isDraging }"
        :style="btnStyle"
        @mousedown="dragStart"
      ></div>
      <slot name="runway" />
    </div>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  CSSProperties,
  ref,
  reactive,
  PropType,
  onMounted
} from 'vue'

import { numLimit } from 'adicw-utils'
import { useEventListener } from '@/utils/vant/useEventListener'
// todo 蜜汁鬼畜
export default defineComponent({
  name: 'AwSlider',
  props: {
    height: {
      type: Number,
      default: 6
    },
    modelValue: {
      type: Number,
      default: 40
    },
    parts: {
      type: Array as PropType<[number, number][]>,
      default: () => []
    }
  },
  emits: {
    'update:modelValue': (val: number) => typeof val === 'number',
    change: (val: number) => typeof val === 'number',
    input: (val: number) => typeof val === 'number'
  },
  setup(props, { emit }) {
    const selfEl = ref<HTMLElement>()
    const selfSize = reactive({
      width: 0,
      x: 0
    })
    const isDraging = ref(false)
    const realValue = ref(props.modelValue)

    const barStyle = computed(() => {
      return {
        width: `${computeBarWidth(props.modelValue)}px`
      } as CSSProperties
    })
    const runwayStyle = computed(
      () =>
        ({
          height: `${props.height}px`
        } as CSSProperties)
    )
    const btnStyle = computed(() => {
      const offsetY = 4
      const offsetX = 10
      return {
        height: `${props.height + offsetY * 2}px`,
        top: `-${offsetY}px`,
        transform: `translateX(${
          selfSize.width * (props.modelValue / 100) - offsetX
        }px)`
      } as CSSProperties
    })
    const partsStyleList = computed(() =>
      props.parts.map((item) => {
        const difference = item[1] - item[0]
        return {
          width: `${computeBarWidth(difference).toFixed()}px`,
          left: `${computeBarWidth(item[0]).toFixed()}px`
        } as CSSProperties
      })
    )

    const styleInit = () => {
      const { x, width } = selfEl.value!.getBoundingClientRect()
      selfSize.width = width
      selfSize.x = x
    }
    const computeBarWidth = (num: number) => {
      return selfSize.width * (num / 100)
    }
    const setValue = (e: MouseEvent) => {
      const btnOffsetX = e.pageX - selfSize.x
      realValue.value = numLimit(
        +((btnOffsetX / selfSize.width) * 100).toFixed(),
        0,
        100
      )
      emit('update:modelValue', realValue.value)
      return realValue.value
    }
    const dragStart = () => {
      isDraging.value = true
      window.addEventListener('mousemove', dargMove)
    }
    const dargMove = (e: MouseEvent) => {
      emit('input', setValue(e))
    }
    const dragEnd = () => {
      if (!isDraging.value) return
      isDraging.value = false
      emit('change', realValue.value)
      window.removeEventListener('mousemove', dargMove)
    }
    const changeValue = (e: MouseEvent) => {
      emit('change', setValue(e))
    }

    onMounted(styleInit)
    useEventListener('mouseup', dragEnd)

    return {
      selfEl,
      barStyle,
      runwayStyle,
      btnStyle,
      changeValue,
      dragStart,
      dragEnd,
      isDraging,
      partsStyleList,
      styleInit
    }
  }
})
</script>

<style lang="less" scoped>
@radius: 4px;
.aw-slider {
  position: relative;
  width: 100%;
  background: rgba(255, 255, 255, 0.3);
  border-radius: @radius;
  cursor: pointer;
  &__runway {
    position: relative;
    width: 100%;
  }
  &__bar {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    background: linear-gradient(to left, #1aafe8, #df6edc);
    z-index: 1;
    border-radius: @radius;
  }
  &__part {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    &-item {
      position: absolute;
      top: 0;
      background: rgba(255, 255, 255, 0.4);
      height: 100%;
    }
  }
  &__btn {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 2;
    width: 20px;
    height: 10px;
    cursor: pointer;
    user-select: none;
    &::before {
      .mask(1,#fff);
      border-radius: 4px;
      transition: all 0.25s;
      transform: scale(0);
    }
    &.active {
      &::before {
        transform: scale(1.1);
      }
    }
  }
  &:hover {
    .aw-slider__btn {
      &::before {
        transform: scale(0.9);
      }
    }
  }
}
</style>
