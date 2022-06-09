<template>
  <div ref="selfDom" class="scroll-x">
    <slot name="outside" />
    <div class="scroll-x__content">
      <slot />
    </div>
  </div>
</template>

<script lang="ts">
import BScroll from 'better-scroll'
import {
  onMounted,
  ref,
  defineComponent,
  nextTick,
  watch,
  PropType,
  toRefs
} from 'vue'
import { onWindowSizeChange } from '@/utils/vant/useWindowSize'
import { useEventListener } from '@/utils/vant/useEventListener'
import { wait } from 'adicw-utils'
export default defineComponent({
  name: 'ScrollX',
  props: {
    probeType: {
      type: Number, // 非实时派发scroll事件和位置参数, 类型由0,1,2,3,
      default: 3
    },
    bounce: {
      type: Boolean, // 是否滚动回弹动画
      default: true
    },
    preventDefault: {
      type: Boolean, // 是否禁用默认事件
      default: false
    },
    stopPropagation: {
      type: Boolean, // 是否阻止冒泡
      default: true
    },
    touchable: {
      type: Boolean,
      default: true
    },
    // eslint-disable-next-line vue/require-default-prop
    listenData: [Object, String, Boolean, Number] as PropType<any> // 监听的触发刷新的对象,
  },
  emits: ['init'],
  setup(props, { emit }) {
    const { listenData } = toRefs(props)
    const selfDom = ref<HTMLDivElement | null>(null)
    const bScroll = ref<BScroll | null>(null)

    const refresh = () => {
      if (bScroll.value === null) return
      bScroll.value.refresh()
    }
    const scrollToStart = (el: HTMLElement) => {
      bScroll.value!.scrollToElement(el, 250, true, true)
    }

    watch(
      listenData,
      () => {
        nextTick(refresh)
      },
      {
        immediate: true
      }
    )

    onWindowSizeChange(refresh)
    onMounted(async () => {
      if (selfDom.value === null) return
      await wait(1000)
      bScroll.value = new BScroll(selfDom.value, {
        scrollX: true,
        click: true,
        tap: 'tap',
        ...props,
        ...(props.touchable
          ? {}
          : {
              disableMouse: false,
              disableTouch: false
            })
      })
      emit('init')
    })
    useEventListener('resize', refresh)
    return {
      selfDom,
      refresh,
      scrollToStart
    }
  }
})
</script>
<style lang="less" scoped>
.scroll-x {
  width: 100%;
  overflow: hidden;
  &__content {
    display: flex;
    flex-wrap: nowrap;
    width: max-content;
  }
}
</style>
