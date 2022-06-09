import {
  isRef,
  onDeactivated,
  onMounted,
  onUnmounted,
  Ref,
  ref,
  unref,
  nextTick,
  onActivated,
  onBeforeUnmount
} from 'vue'
import { domObserver } from '@/utils/dom'
import { useEventListener } from '@/utils/vant/useEventListener'

/**
 * 节点入屏监听
 * @param el 节点
 * @param callback 执行方法
 */
export function useDomObserver(
  el: Ref<HTMLElement | undefined> | HTMLElement,
  callback: () => void
) {
  onMounted(() => {
    const isV = isRef(el)
    if (!el || (isV && !el.value)) return
    domObserver(isV ? el.value! : el, callback)
  })
}

/**
 * 样式计算
 * @param callback
 */
export function useReStyle(callback: () => void) {
  onMounted(callback)
  useEventListener('resize', callback)
}

/**
 * 延时批渲染
 * @param maxStep 最大步数
 */
export function useDeferredRender(maxStep: number) {
  const deferredRenderStep = ref(0)
  /**
   * 渲染批次顺序
   * @param step 第几步，需小于传入的总步数
   * @returns 是否渲染
   */
  const defer = (step: number) => deferredRenderStep.value > step
  /**
   * 开始渲染
   */
  const runDeferredRender = () => {
    requestAnimationFrame(() => {
      deferredRenderStep.value++
      if (deferredRenderStep.value < maxStep) {
        runDeferredRender()
      }
    })
  }

  return {
    defer,
    runDeferredRender
  }
}

/**
 * 节点重绘监听
 * @param el
 * @param callback
 */
export function useResizeListener(
  el: HTMLElement | Ref<HTMLElement | undefined>,
  callback: () => void
) {
  let ob: ResizeObserver | null

  const add = () => {
    const element = unref(el)

    if (element && !ob) {
      ob = new ResizeObserver(callback)
      ob.observe(element)
    }
  }

  const remove = () => {
    const element = unref(el)

    if (element && ob) {
      ob.disconnect()
      ob = null
    }
  }

  onUnmounted(remove)
  onDeactivated(remove)
  usePageIn(add)
}

/**
 * 页面/组件 进入
 * @param hook
 */
export function usePageIn(hook: () => void) {
  let mounted: boolean

  onMounted(() => {
    hook()
    nextTick(() => {
      mounted = true
    })
  })

  onActivated(() => {
    if (mounted) {
      hook()
    }
  })
}

/**
 * 页面/组件 离开
 * @param hook
 */
export function usePageOut(hook: () => void) {
  onBeforeUnmount(hook)
  onDeactivated(hook)
}
