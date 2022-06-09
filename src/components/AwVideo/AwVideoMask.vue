<template>
  <div class="aw-video__mask" @click="playHandler">
    <Icon
      v-show="status === PlayerStatus.Paused"
      class="aw-video__play"
      name="player-fill"
    />
  </div>
  <transition
    enter-active-class="animate__fadeIn"
    leave-active-class="animate__fadeOut"
  >
    <div v-show="status === PlayerStatus.Loading" class="aw-video__loading">
      <LoadingBlockRun />
    </div>
  </transition>
  <div v-show="status === PlayerStatus.Failed" class="aw-video__bad">
    <img src="~static/img/video-bad.png" />
    <span>加载失败了，好耶！</span>
  </div>
  <div v-if="!src" class="aw-video__bad">
    <img src="~static/img/video-empty.png" />
    <span>暂无播放内容~</span>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import LoadingBlockRun from '@comps/Loading/LoadingBlockRun.vue'
import * as Type from './type'

export default defineComponent({
  name: 'AwVideoMask',
  components: {
    LoadingBlockRun
  },
  props: {
    status: {
      type: Number as PropType<Type.Player['status']>,
      default: Type.PlayerStatus.None
    },
    src: {
      type: String,
      default: ''
    },
    playHandler: {
      type: Function as PropType<(e: Event) => void>,
      default: () => false
    }
  },
  setup() {
    return {
      PlayerStatus: Type.PlayerStatus
    }
  }
})
</script>
<style lang="less" scoped>
.aw-video {
  .mask(@height: 100%) {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: @height;
  }
  &__mask {
    .mask(calc(100% - var(--control-height) - 10px));
    z-index: 2;
  }
  &__play {
    position: absolute;
    right: 30px;
    bottom: 16px;
    font-size: 50px;
    cursor: pointer;
    text-shadow: 0 4px 16px rgb(0 0 0 / 40%);
  }
  &__bad {
    .mask;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    z-index: 5;
    background: #000;
    img {
      width: 100px;
    }
    span {
      font-weight: 600;
      font-size: 20px;
      margin-top: 30px;
    }
    &::after {
      content: '';
      .mask;
    }
  }
  &__loading {
    .mask;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    z-index: 3;
    background: rgb(0 0 0 / 40%);
    animation-duration: 0.25s;
    span {
      margin-top: 30px;
    }
  }
}
</style>
