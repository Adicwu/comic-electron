<template>
  <div
    ref="selfEl"
    class="aw-video"
    :class="{ 'web-fullscreen': player.webFullScreen }"
    :style="{ opacity: src ? 1 : 0 }"
    @mousemove="controlBarVisibleHandler"
    @touchmove="controlBarVisibleHandler"
  >
    <AwVideoMask
      :status="player.status"
      :src="src"
      :play-handler="playHandler"
    />
    <div
      :class="{ show: src && player.status !== -1 && controlBar.visible }"
      class="aw-video__control"
    >
      <AwVideoProgress
        ref="awVideoProgressComp"
        :preview-img="player.preview"
        :duration="player.duration"
        :current-time="player.currentTime"
        :buffered-list="player.bufferedList"
        @timePreview="computedPreview"
        @change="onProgressChange"
        @progressing="controlBar.isProgressing = true"
      />
      <Icon
        class="control-icon control-icon__play"
        :name="player.status === PlayerStatus.Playing ? 'pause' : 'play'"
        @click="playHandler"
      />
      <el-tooltip effect="dark" content="下一集" placement="top-start">
        <Icon
          class="control-icon control-icon__next scale"
          name="iconfontsvgnext"
          @click="$emit('next')"
        />
      </el-tooltip>
      <div class="control-time">
        {{ sToMs(player.currentTime) }}
        <span>/</span>
        {{ sToMs(player.duration) }}
      </div>
      <!-- <div
        v-if="quality.length > 0"
        v-click-outside="() => (qualitySelectVisible = false)"
        class="control-select quality"
      >
        <span @click="qualitySelectVisible = !qualitySelectVisible">
          {{ currentQualityName }}
        </span>
        <ul v-show="qualitySelectVisible">
          <li
            v-for="{ name, value } in quality"
            :key="value"
            :class="{ active: currentQuality === value }"
            @click="changeQuality(value)"
          >
            {{ name }}
          </li>
        </ul>
      </div> -->
      <div
        v-click-outside="() => (playbackRate.visible = false)"
        class="control-select playback-rate"
      >
        <span @click="playbackRate.visible = !playbackRate.visible">
          {{ playbackRate.current }}
        </span>
        <ul v-show="playbackRate.visible">
          <li
            v-for="item in playbackRate.list"
            :key="item.value"
            :class="{ active: playbackRate.current === item.name }"
            @click="changePlayBackRate(item)"
          >
            {{ item.name }}
          </li>
        </ul>
      </div>
      <el-tooltip effect="dark" content="快退15秒" placement="top-start">
        <Icon
          class="control-icon active-style"
          style="transform: rotateY(180deg)"
          name="rotate_b"
          @click="fastProgressChange(-15)"
        />
      </el-tooltip>
      <el-tooltip effect="dark" content="快进15秒" placement="top-start">
        <Icon
          class="control-icon active-style"
          name="rotate_b"
          @click="fastProgressChange(15)"
        />
      </el-tooltip>
      <div class="control-icon control-volume">
        <Icon
          :name="player.isMuted ? 'mute' : 'volume'"
          @click="volumeCutover"
        />
        <div class="control-volume__inner">
          <el-slider
            v-model="player.volume"
            vertical
            height="100px"
            :show-tooltip="false"
          />
        </div>
      </div>
      <el-tooltip effect="dark" content="网页全屏" placement="top-start">
        <Icon
          class="control-icon scale active-style"
          :name="
            player.webFullScreen ? 'exit-fullscreen-4-3' : 'fullscreen-4-3'
          "
          @click="webFullScreenCutover"
        />
      </el-tooltip>
      <el-tooltip effect="dark" content="画中画" placement="top-start">
        <Icon
          class="control-icon scale active-style"
          :name="
            player.pip
              ? 'picture-in-picture-exit-fill'
              : 'picture-in-picture-2-fill'
          "
          @click="pipCutover"
        />
      </el-tooltip>
      <el-tooltip effect="dark" content="全屏" placement="top-start">
        <Icon
          class="control-icon scale active-style"
          :name="player.fullScreen ? 'exit-full-screen' : 'full-screen'"
          @click="fullScreenCutover"
        />
      </el-tooltip>
    </div>
    <AwVideoMsg ref="awVideoMsgComp" />
    <VideoRender
      ref="videoInstance"
      :key="src"
      v-model:volume="player.volume"
      :src="src"
      @initStart="videoInits.start"
      @initSuccessed="videoInits.successed"
      @initFailed="videoInits.failed"
      @error="videoEvents.error"
      @loadedmetadata="videoEvents.loadedmetadata"
      @canplay="videoEvents.canplay"
      @timeupdate="videoEvents.timeupdate"
      @ended="videoEvents.ended"
      @play="videoEvents.play"
      @pause="videoEvents.pause"
      @waiting="videoEvents.waiting"
      @playing="videoEvents.playing"
      @seeking="videoEvents.waiting"
      @seeked="videoEvents.playing"
      @volumechange="videoEvents.volumechange"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, Ref, ref } from 'vue'
import {
  fullscreen,
  pictureInPicture,
  checkFullscreen,
  sToMs
} from 'adicw-utils'

import AwVideoProgress from './AwVideoProgress.vue'
import AwVideoMsg, { NotifyItem, NotifyReturns } from './AwVideoMsg.vue'
import VideoRender from './VideoRender.vue'
import AwVideoMask from './AwVideoMask.vue'

import { debounce, throttle } from '@/utils/adLoadsh'
import { useEventListener } from '@/utils/vant/useEventListener'
import { getVideoScreenshot } from '@/utils/media'
import * as Type from './type'

export * from './type'

// type Props = ExtractPropTypes<typeof props>
type VideoInstance = InstanceType<typeof VideoRender>

/** 播放倍数模块 */
function playbackRateModule(videoInstance: Ref<VideoInstance | undefined>) {
  /** 播放倍数集合 */
  const playbackRate = reactive({
    /** 选项显隐 */
    visible: false,
    /** 当前倍数名称 */
    current: '1.0x',
    /** 倍数列表 */
    list: [
      {
        name: '2.0x',
        value: 2
      },
      {
        name: '1.5x',
        value: 1.5
      },
      {
        name: '1.0x',
        value: 1
      },
      {
        name: '0.5x',
        value: 0.5
      }
    ]
  })
  /**
   * 倍数修改
   * @param item
   */
  const changePlayBackRate = (item: typeof playbackRate['list'][0]) => {
    playbackRate.current = item.name
    videoInstance.value?.setPlaybackRate(item.value)
    playbackRate.visible = false
  }
  return {
    changePlayBackRate,
    playbackRate
  }
}

export default defineComponent({
  name: 'AwVideo',
  components: {
    AwVideoProgress,
    AwVideoMsg,
    AwVideoMask,
    VideoRender
  },
  inheritAttrs: true,
  props: {
    /** 视频源地址 */
    src: {
      type: String,
      default: ''
    },
    /** 画质列表 */
    // quality: {
    //   type: Array as PropType<Type.Quality[]>,
    //   default: () => [
    //     {
    //       name: '1080p 超清',
    //       value: 0
    //     },
    //     {
    //       name: '720p 高清',
    //       value: 1
    //     },
    //     {
    //       name: '自动',
    //       value: -1
    //     }
    //   ]
    // },
    /** 初始化时是否静音 */
    muted: {
      type: Boolean,
      default: false
    },
    /**
     * 视频初始进度，ms
     */
    initCurrentTime: {
      type: Number,
      default: 0
    }
  },
  emits: ['changeQuality', 'ended', 'error', 'next'],
  setup(props, ctx) {
    const awVideoMsgComp = ref<InstanceType<typeof AwVideoMsg>>()
    const awVideoProgressComp = ref<InstanceType<typeof AwVideoProgress>>()
    const videoInstance = ref<VideoInstance>()
    const selfEl = ref<HTMLElement>()

    const player: Type.Player = reactive({
      currentTime: 0,
      duration: 0,
      status: Type.PlayerStatus.None,
      volume: props.muted ? 0 : 60,
      bufferedList: [],
      preview: '',
      oldVolume: 0,
      fullScreen: false,
      get isMuted() {
        return this.volume === 0
      },
      isListened: false,
      pip: false,
      webFullScreen: false
    })
    /**
     * 提示框集合
     * ps: 用于存储当前展示的提示框，方便处理
     */
    const notifys = reactive<{
      [prop: string]: NotifyReturns | null
    }>({
      buffer: null,
      canplay: null
    })
    /**
     * 底部控制bar集合
     */
    const controlBar = reactive({
      /** 是否显示 */
      visible: false,
      /**  */
      timer: null as null | NodeJS.Timeout,
      /** 是否在进度拖拽中 */
      isProgressing: false
    })
    // const qualityModule =
    //   /** 画质切换模块 */
    //   (() => {
    //     /** 当前画质 */
    //     const currentQuality = ref<Type.Quality['value']>(-1)
    //     /** 画质选项选项显隐 */
    //     const qualitySelectVisible = ref(false)
    //     /** 当前选择的画质名称 */
    //     const currentQualityName = computed(
    //       () =>
    //         props.quality.find((item) => item.value === currentQuality.value)
    //           ?.name || '-'
    //     )

    //     /**
    //      * 画质切换
    //      * @param value 画质值
    //      */
    //     const changeQuality = (value: Type.Quality['value']) => {
    //       currentQuality.value = value
    //       qualitySelectVisible.value = false
    //       ctx.emit('changeQuality', value)
    //     }

    //     return {
    //       currentQuality,
    //       currentQualityName,
    //       changeQuality,
    //       qualitySelectVisible
    //     }
    //   })()

    /**
     * 进度修改
     * @param val ms
     */
    const changeProgress = (val: number) => {
      videoInstance.value?.setCurrentTime(val)
    }
    /**
     * 计算进度预览图
     * @param val ms
     */
    const computedPreview = debounce(async (val: number) => {
      player.preview = await getVideoScreenshot(props.src, val)
    }, 100)
    /**
     * 进度切换
     * @param val 0-100
     */
    const onProgressChange = (val: number) => {
      const realTime = player.duration * (+val / 100)
      changeProgress(realTime)
      controlBar.isProgressing = false
    }
    /**
     * 进度快速切换
     * @param limit s
     */
    const fastProgressChange = (limit: number) => {
      const num = player.currentTime + limit
      if (num < 0 || num > player.duration) return
      changeProgress(num)
    }
    const play = () => {
      player.status = Type.PlayerStatus.Playing
      videoInstance.value?.play()
    }
    /** 播放控制 */
    const playHandler = () => {
      switch (player.status) {
        case Type.PlayerStatus.Loading: {
          break
        }
        case Type.PlayerStatus.Playing: {
          videoInstance.value?.pause()
          break
        }
        case Type.PlayerStatus.Paused: {
          videoInstance.value?.play()
          break
        }
        case Type.PlayerStatus.Failed: {
          break
        }
      }
    }
    /** 全屏切换 */
    const fullScreenCutover = () => {
      player.fullScreen = !player.fullScreen
      player.webFullScreen = false
      fullscreen(selfEl.value!, player.fullScreen ? 'to' : 'exit')
    }
    /** 画中画切换 */
    const pipCutover = () => {
      player.pip = !player.pip
      const videoEl = selfEl.value!.querySelector('video')

      videoEl && pictureInPicture(videoEl, player.pip ? 'to' : 'exit')
    }
    /** 网页全屏切换 */
    const webFullScreenCutover = () => {
      player.webFullScreen = !player.webFullScreen
      setTimeout(() => {
        awVideoProgressComp.value?.initStyle()
      }, 300)
    }
    /** 静音切换 */
    const volumeCutover = () => {
      if (player.isMuted) {
        player.volume = player.oldVolume
      } else {
        player.oldVolume = player.volume
        player.volume = 0
      }
    }
    /**
     * 消息提示
     * @param item
     */
    const notify = (item: NotifyItem) => {
      return awVideoMsgComp.value!.notify(item)
    }
    const clearNotify = () => {
      return awVideoMsgComp.value!.clearNotify()
    }
    const hideControlBar = () => {
      controlBar.visible = false
      controlBar.timer = null
      controlBar.timer && clearTimeout(controlBar.timer)
    }
    /** 控制bar显隐控制器 */
    const controlBarVisibleHandler = throttle(() => {
      if (controlBar.timer) {
        clearTimeout(controlBar.timer)
        controlBar.timer = null
      }
      controlBar.visible = true
      controlBar.timer = setTimeout(hideControlBar, 3000)
    }, 100)
    /** 增加音量 */
    const increaseVolume = () => {
      let newVol = player.volume + 10
      if (newVol >= 100) {
        newVol = 100
      }
      player.volume = newVol
    }
    /** 减少音量 */
    const lowerVolume = () => {
      let newVol = player.volume - 10
      if (newVol <= 0) {
        newVol = 0
      }
      player.volume = newVol
    }

    /** 视频初始化钩子 */
    const videoInits = {
      start() {
        player.status = Type.PlayerStatus.Loading
      },
      successed() {
        // player.status = 2
      },
      failed() {
        player.status = Type.PlayerStatus.Failed
      }
    }
    /** 视频响应事件 */
    const videoEvents = {
      /** 准备就绪 */
      loadedmetadata(e: Event) {
        const { duration } = e.target as HTMLVideoElement
        player.duration = duration
        props.initCurrentTime && changeProgress(props.initCurrentTime)
      },
      /** 每次播放就绪 */
      canplay() {
        player.status = Type.PlayerStatus.Paused
        notifys.canplay && notifys.canplay.remove()
        notifys.canplay = notify({
          content: '电波获取完成~',
          duration: 3000
        })
      },
      /** 进度 监听 */
      timeupdate(e: Event) {
        if (controlBar.isProgressing) return
        const video = e.target as HTMLVideoElement

        player.currentTime = video.currentTime
        player.bufferedList = Array(video.buffered.length)
          .fill(0)
          .map((_, index) => {
            return [video.buffered.start(index), video.buffered.end(index)]
          })
      },
      /** 播放结束 监听 */
      ended() {
        player.status = Type.PlayerStatus.Paused
        notify({
          content: '本集已播放完成~',
          duration: 5000
        })
        ctx.emit('ended')
      },
      /** 播放 监听 */
      play() {
        player.status = Type.PlayerStatus.Playing
      },
      /** 暂停 监听 */
      pause() {
        player.status = Type.PlayerStatus.Paused
      },
      /** 错误 监听 */
      error(e: Error) {
        console.error(e)
        player.status = Type.PlayerStatus.Failed
        ctx.emit('error')
        notify({
          content: '视频加载错误，emmm~',
          duration: 5000
        })
      },
      /** 缓冲开始 监听 */
      waiting: debounce(() => {
        player.status = Type.PlayerStatus.Loading
        notifys.buffer = notify({
          content: '电波获取中，请稍后~',
          duration: 3000
        })
      }, 100),
      /** 缓冲结束 监听 */
      playing: debounce(() => {
        // const { paused } = e.target as HTMLVideoElement
        // player.status = paused ? 2 : 1
        play()
        notifys.buffer && notifys.buffer.remove()
      }, 100),
      volumechange(e: Event) {
        player.volume = (e.target as HTMLMediaElement).volume * 100
      }
    }

    /** 监听 */
    ;(() => {
      // ps: 全屏下无法监听keydown等
      useEventListener('resize', () => {
        !checkFullscreen() && (player.fullScreen = false)
      })
      useEventListener('leavepictureinpicture', () => {
        player.pip = false
      })
      useEventListener('keydown', (e) => {
        const evt = e as KeyboardEvent
        e.preventDefault()
        switch (evt.key) {
          // 方向键左
          case 'ArrowLeft': {
            fastProgressChange(-10)
            break
          }
          // 方向键右
          case 'ArrowRight': {
            fastProgressChange(10)
            break
          }
          case 'ArrowUp': {
            increaseVolume()
            break
          }
          case 'ArrowDown': {
            lowerVolume()
            break
          }
          // 空格键
          case ' ': {
            playHandler()
            break
          }
        }
      })
    })()

    return {
      PlayerStatus: Type.PlayerStatus,
      videoInits,
      videoEvents,
      awVideoProgressComp,
      videoInstance,
      selfEl,
      awVideoMsgComp,
      player,
      controlBar,
      hideControlBar,
      playHandler,
      sToMs,
      fullScreenCutover,
      pipCutover,
      volumeCutover,
      changeProgress,
      computedPreview,
      notify,
      webFullScreenCutover,
      clearNotify,
      onProgressChange,
      fastProgressChange,
      controlBarVisibleHandler,
      ...playbackRateModule(videoInstance)
      // ...qualityModule
    }
  }
})
</script>
<style lang="less" scoped>
.aw-video {
  @controlHeight: 38px;
  --control-height: @controlHeight;
  position: relative;
  width: 100%;
  height: 100%;
  color: var(--font-unactive-color);
  background: #000;
  overflow: hidden;
  transition: all 0.25s;

  &.web-fullscreen {
    position: fixed;
    left: 0;
    top: 0;
    aspect-ratio: unset;
    width: 100%;
    height: 100vh;
    z-index: 9999;
  }

  ::v-deep(.video-render) {
    position: absolute;
    left: 0;
    top: 0;
    z-index: 1;
  }

  &__control {
    @padding: 16px;
    position: absolute;
    left: 0;
    bottom: 0;
    margin: 0 @padding;
    padding-top: 6px;
    margin-bottom: 12px;
    width: calc(100% - @padding*2);
    display: flex;
    align-items: center;
    color: #fff;
    background: rgba(43, 51, 63, 0.7);
    height: @controlHeight;
    user-select: none;
    transition: all 0.25s;
    border-bottom-left-radius: 10px;
    border-bottom-right-radius: 10px;
    transform: translateY(150%);
    z-index: 4;

    &.show {
      transform: translateY(0%);
    }

    i {
      cursor: pointer;
    }

    .control {
      &-icon {
        display: flex;
        justify-content: center;
        align-items: center;
        width: @controlHeight;
        height: 100%;
        font-size: 18px;

        &.active-style {
          &:active {
            opacity: 0.7;
          }
        }

        &.scale {
          &:hover {
            animation: icon-hover 0.8s forwards;
          }

          @keyframes icon-hover {
            0% {
              transform: scale(1);
            }

            20% {
              transform: scale(1.1);
            }

            40% {
              transform: scale(0.9);
            }

            60% {
              transform: scale(1.1);
            }

            80% {
              transform: scale(0.8);
            }

            100% {
              transform: scale(1);
            }
          }
        }

        &__play {
          font-size: 24px;

          &.icon-pause {
            font-size: 16px;
          }
        }

        &__next {
          font-size: 14px;
        }
      }

      &-time {
        display: flex;
        align-items: center;
        height: 100%;
        margin: 0 20px;
        font-size: 14px;
        line-height: 14px;

        span {
          margin: 0 6px;
        }
      }

      &-select {
        position: relative;
        margin-left: auto;
        margin-right: 8px;
        text-align: center;

        &.quality {
          width: 100px;
        }

        &.playback-rate {
          width: 60px;

          ul {
            overflow: hidden;
          }
        }

        span {
          display: inline-block;
          cursor: pointer;
          font-size: 15px;
          line-height: 8px;
          width: 100%;
          height: 15px;
          font-weight: 500;
        }

        ul {
          position: absolute;
          bottom: @controlHeight;
          left: 0;
          right: 0;
          margin: 0 auto;
          width: 100%;
          padding: 6px 0;
          font-size: 14px;
          color: var(--font-unactive-color);
          background: var(--bg-color);
          border-radius: 14px;
          transition: all 0.25s;

          li {
            cursor: pointer;
            padding: 6px 0;
            transition: all 0.25s;

            &.active {
              color: var(--font-color);
              background: none !important;
            }

            &:hover {
              background: var(--primary-color);
            }
          }
        }
      }

      &-volume {
        &:hover {
          .control-volume__inner {
            opacity: 1;
            transform: translateY(0);
          }
        }

        &__inner {
          position: absolute;
          bottom: calc(@controlHeight);
          padding: 18px 4px;
          background: var(--aside-bg-color);
          border-radius: 24px;
          transition: all 0.25s;
          opacity: 0;
          transform: translateY(160%);
          box-shadow: 0 0 12px rgba(0 0 0 / 0.1);

          ::v-deep(.el-slider) {
            .el-slider__bar {
              background: var(--font-color);
            }

            .el-slider__runway {
              width: 2px;
              background: var(--font-unactive-color);
            }

            .el-slider__bar {
              width: 2px;
            }

            .el-slider__button-wrapper {
              left: calc(var(--el-slider-button-wrapper-offset) - 2px);
            }

            .el-slider__button {
              border-color: var(--font-color);
              transform: scale(0.7);
            }
          }
        }
      }
    }
  }
}
</style>
