<template>
  <section class="home-section">
    <template v-if="!isInit">
      <div class="home-section__header">
        <ul class="home-section__tabs">
          <li class="active aw-skeleton">xxx</li>
        </ul>
      </div>
      <div class="home-section__main">
        <div
          v-for="item in 5"
          :key="item"
          class="aw-skeleton"
          style="border-radius: 12px"
        ></div>
      </div>
    </template>
    <template v-else>
      <div class="home-section__header">
        <ul class="home-section__tabs">
          <li
            v-for="{ name, key } in tabs.list"
            :key="key"
            :class="{ active: key === tabs.active }"
            @click="changeTab(key)"
          >
            {{ name }}
          </li>
        </ul>
      </div>
      <TransUl tag="div" class="home-section__main">
        <div v-for="item in currentComic" :key="item.id">
          <HomeSectionCard :detail="item" />
        </div>
      </TransUl>
    </template>
  </section>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, reactive } from 'vue'
import HomeSectionCard from './HomeSectionCard.vue'
import TransUl from '@comps/Animate/TransUl.vue'
import * as Type from '../types/homeSection.type'

export default defineComponent({
  name: 'HomeSection',
  components: {
    HomeSectionCard,
    TransUl
  },
  props: {
    hots: {
      type: Array as PropType<Type.Comic['hots']>,
      default: () => []
    },
    latest: {
      type: Array as PropType<Type.Comic['latest']>,
      default: () => []
    },
    isInit: {
      type: Boolean,
      default: true
    }
  },
  setup(props) {
    type ComicKey = 'hots' | 'latest'

    const tabs = reactive<Type.Tabs<ComicKey>>({
      active: 'hots',
      list: [
        // {
        //   name: '日排行',
        //   key: 'perday'
        // },
        {
          name: '热门',
          key: 'hots'
        },
        {
          name: '最新更新',
          key: 'latest'
        }
      ]
    })
    const currentComic = computed(() => {
      return {
        latest: props.latest.slice(0, 5).map((item) => ({
          cover: item.cover,
          title: item.title,
          id: item.id,
          desc: item.season
        })),
        hots: props.hots.slice(0, 5).map((item) => ({
          cover: item.cover,
          title: item.title,
          id: item.id,
          desc: item.season
        }))
      }[tabs.active]
    })

    const changeTab = (key: ComicKey) => {
      tabs.active = key
    }

    return {
      tabs,
      changeTab,
      currentComic
    }
  }
})
</script>
<style lang="less" scoped>
@import '../style/home-main';
.home-section {
  width: 440px;
  &__header {
    .up-block-header;
  }
  &__main {
    .up-block-main;
    display: flex;
    flex-direction: column;
    gap: 14px;
    height: 400px;
    & > div {
      flex: 1;
      overflow: hidden;
    }
  }
  &__tabs {
    display: flex;
    width: 100%;
    height: 100%;
    color: var(--font-unactive-color);
    li {
      display: flex;
      align-items: center;
      padding: 0 20px;
      height: 100%;
      transition: all 0.25s;
      border-radius: 8px;
      user-select: none;
      cursor: pointer;
      &.active {
        color: var(--font-color);
        background: var(--bg-color);
      }
    }
  }
}
</style>
