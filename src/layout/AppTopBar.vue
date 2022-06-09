<template>
  <div class="app-top__bar">
    <Icon class="control-i" name="delete2" />
    <Icon class="control-i" name="exit-fullscreen-4-3" />
    <Icon class="control-i" name="delete2" @click="close" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
// const { ipcRenderer } = require('electron')

export default defineComponent({
  name: 'AppTopBar',
  setup() {
    const close = () => {
      // console.log(ipcRenderer)
    }
    return { close }
  }
})
</script>
<style lang="less" scoped>
@import '~styles/var';
.app-top__bar {
  width: 100%;
  height: @topBarHeight;
  -webkit-app-region: drag;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 16px;
  box-sizing: border-box;
  .control-i {
    position: relative;
    font-size: 30px;
    color: var(--font-color);
    cursor: pointer;
    padding: 6px;
    z-index: 1;
    margin-left: 8px;
    &::after {
      .mask(-1,var(--box-bg-color));
      border-radius: 6px;
      opacity: 0;
      transition: all 0.25s;
    }
    &:hover::after {
      opacity: 0.6;
    }
  }
}
</style>
