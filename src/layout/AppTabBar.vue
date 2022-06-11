<template>
  <div class="app-tab__bar">
    <div class="avatar">
      <BaseImg src="https://api.adicw.cn/uploads/UserAvatar/default.jpg" />
    </div>
    <div v-click-outside="() => (historyVisible = false)" class="history">
      <Icon
        class="tool"
        :class="{ active: historyVisible }"
        name="history"
        @click="historyVisible = !historyVisible"
      />
      <transition
        enter-active-class="animate__zoomIn"
        leave-active-class="animate__hinge"
      >
        <div v-show="historyVisible" class="history-content">
          <el-tabs v-model="tabs.active">
            <el-tab-pane
              v-for="item in tabs.list"
              :key="item.value"
              :label="item.name"
              :name="item.value"
            >
              <div
                v-for="k in playHistory.slice(0, 4)"
                :key="k.id"
                class="card"
                @click="
                  ;[toComicMain(k.id, 'replace'), (historyVisible = false)]
                "
              >
                <BaseImg :src="k.cover" />
                <div class="card-info">
                  <p>{{ k.name }}</p>
                  <span v-if="k.playEpisode">{{
                    `观看至 ${k.playEpisode} ${k.playProgress}`
                  }}</span>
                  <span v-else class="bad">播放失败</span>
                </div>
              </div>
              <div
                v-if="playHistory.length >= 4"
                class="more"
                @click="$router.push({ name: 'User' })"
              >
                查看全部记录
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </transition>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, reactive, ref } from 'vue'
import { usePlayCacheStore } from '@/stores/playCache.store'
import { toComicMain } from '@/hooks/router'
export default defineComponent({
  name: 'AppTabBar',
  setup() {
    const playCacheStore = usePlayCacheStore()

    const tabs = reactive({
      active: '1',
      list: [
        // {
        //   name: '收藏',
        //   value: '0'
        // },
        {
          name: '历史',
          value: '1'
        }
      ]
    })
    const playHistory = computed(() => playCacheStore.playHistory)
    const historyVisible = ref(false)
    return {
      tabs,
      historyVisible,
      playHistory,
      toComicMain
    }
  }
})
</script>
<style lang="less" scoped>
@import '~styles/var';

.app-tab__bar {
  position: fixed;
  left: 20px;
  top: 20px;
  display: flex;
  align-items: center;
  z-index: 8;
  -webkit-app-region: no-drag;

  .avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    overflow: hidden;
    margin-right: 14px;
    img {
      width: 100%;
      height: 100%;
    }
  }
  .tool {
    position: relative;
    display: flex;
    width: 36px;
    height: 36px;
    justify-content: center;
    align-items: center;
    font-size: 16px;
    cursor: pointer;
    color: var(--font-color);
    &::after {
      .mask(-1,var(--aside-bg-color));
      border-radius: 50%;
      opacity: 0.8;
    }
    &.active {
      color: var(--primary-color);
    }
  }
  .history {
    position: relative;
    user-select: none;
    &-content {
      position: absolute;
      left: -100%;
      top: 100%;
      width: 340px;
      margin-top: 10px;
      background: var(--aside-bg-color);
      box-shadow: 0 0 10px rgb(0 0 0 / 0.2);
      border-radius: 4px;
      overflow: hidden;
      animation-duration: 0.625s;
      ::v-deep(.el-tabs) {
        .el-tabs__header {
          box-sizing: border-box;
          padding: 0 16px;
          .el-tabs__active-bar {
            background-color: var(--warning-color);
          }
          .el-tabs__item {
            color: var(--font-unactive-color);
          }
          .el-tabs__item.is-active,
          .el-tabs__item:hover {
            color: var(--font-color);
          }
        }
        .el-tabs__content {
          margin-bottom: 10px;
          .el-tab-pane {
            display: flex;
            flex-direction: column;
            gap: 14px;
          }
        }
      }
      .card {
        display: flex;
        width: 100%;
        padding: 0 10px;
        box-sizing: border-box;
        cursor: pointer;
        transition: all 0.25s;
        img {
          width: 100px;
          aspect-ratio: 2/1.2;
          border-radius: 4px;
        }
        &-info {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          flex: 1;
          padding-left: 12px;
          box-sizing: border-box;
          font-size: 12px;
          p {
            .p-truncate(2);
          }
          span {
            color: var(--font-unactive-color);
            padding-bottom: 4px;
          }
          .bad {
            color: var(--warning-color);
            font-weight: 600;
          }
        }
        &:hover {
          filter: brightness(0.5);
        }
      }
      .more {
        font-size: 12px;
        text-align: center;
        cursor: pointer;
        transition: all 0.25s;
        &:hover {
          text-decoration: underline;
          opacity: 0.6;
        }
      }
    }
  }
}
</style>
