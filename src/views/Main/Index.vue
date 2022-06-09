<template>
  <div class="comic-main">
    <div class="comic-main__break">
      <Icon name="arrow" @click="$router.go(-1)" />
    </div>

    <div class="comic-main__inner">
      <div class="comic-main__video">
        <AwVideo
          ref="awVideoComp"
          :key="id"
          :src="anthology.current"
          :init-current-time="initPlayerCurrentTime"
          autoplay
          @next="nextAnthology"
          @ended="nextAnthology"
          @error="onVideoError"
        />
      </div>
      <div class="comic-main__box">
        <el-tabs>
          <el-tab-pane label="选集" lazy>
            <div class="comic-main__anthology">
              <ComicAnthology
                v-for="(item, index) in anthology.list"
                :key="index"
                :org-id="item.orgId"
                :active="anthology.current"
                :label="item.name"
                :list="item.values"
                :bad-anthology="anthology.bads"
                @change="
                  (e) =>
                    changeAnthology(e, {
                      resetInitPlayerCurrentTime: false
                    })
                "
              />
            </div>
          </el-tab-pane>
          <el-tab-pane label="详情" lazy>
            <ComicMainInfo :id="id" :comic="comic" />
          </el-tab-pane>
          <el-tab-pane v-if="comicImglist.length > 0" label="相关图片" lazy>
            <ComicImglist :imgs="comicImglist" />
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  onBeforeUnmount,
  reactive,
  Ref,
  ref,
  toRef,
  watch
} from 'vue'
import { useRoute } from 'vue-router'
import { sToMs, getVal } from 'adicw-utils'

import AwVideo from '@comps/AwVideo/AwVideo.vue'
import ComicAnthology, { ChangeReturns } from './component/ComicAnthology.vue'
import ComicImglist from './component/ComicImglist.vue'
import ComicMainInfo from './component/ComicMainInfo.vue'
import { ElNotification } from 'element-plus'

import * as Api from '@apis/index'
import * as Type from './types/index.type'
import { GetComicMainReturn } from '@apis/index'
import { usePlayCache } from '@/hooks/user'

/**
 * 动漫信息模块
 * @param comicId 动漫id
 * @param init 信息请求完成后的回调
 */
function comicInfoModule(comicId: Ref<ComicId>, init: () => void) {
  const isPending = ref(false)
  /** 动漫信息 */
  const comic = reactive<GetComicMainReturn>({
    title: '',
    season: '',
    region: '',
    rank: '',
    master: '',
    lang: '',
    firstDate: '',
    cover: '',
    voiceActors: [],
    cates: [],
    playlist: []
  })
  /** 动漫地址集 */
  const comicUrls = ref<Api.GetVideoUrlReturn>([])
  const comicImglist = ref<Api.GetComicImglistReturn>([])

  const comicInit = async (comicId: ComicId) => {
    isPending.value = true
    const [urls, main] = await Promise.all([
      Api.getVideoUrl(comicId),
      Api.getComicMain(comicId)
    ])

    comicUrls.value = urls
    if (main) {
      comic.playlist = main.playlist
      ;(Object.keys(comic) as (keyof GetComicMainReturn)[]).forEach((k) => {
        if (typeof main[k] !== 'undefined') {
          comic[k] = main[k] as any
        }
      })

      Api.getComicImglist({
        name: comic.title
      }).then((res) => (comicImglist.value = res))

      document.title = comic.title
      isPending.value = false
      init()
    }
  }

  /** 数据获取 */
  watch(comicId, comicInit, {
    immediate: true
  })

  return {
    comic,
    comicUrls,
    isPending,
    comicImglist
  }
}

export default defineComponent({
  name: 'ComicMain',
  components: {
    AwVideo,
    ComicAnthology,
    ComicImglist,
    ComicMainInfo
  },
  props: {
    id: {
      type: [Number, String],
      default: -1
    }
  },
  setup(props) {
    const awVideoComp = ref<InstanceType<typeof AwVideo>>()
    const route = useRoute()
    const { playProgressCache, playHistoryCache } = usePlayCache()

    const routeParam = reactive({
      get episode() {
        return Number(route.query.episode) || -1
      },
      get progress() {
        return Number(route.query.progress) || -1
      },
      get orgId() {
        return String(route.query.orgId) || ''
      }
    })
    const { comic, comicUrls, ...comicInfoModuleArgs } = comicInfoModule(
      toRef(props, 'id'),
      () => {
        !!~routeParam.episode ? initInRoute() : init()
      }
    )
    /** 选集 */
    const anthology = reactive<
      Type.Anthology & {
        /** 当前选中的集信息 */
        currentItem: ChangeReturns | null
      }
    >({
      current: '',
      currentItem: null,
      bads: [],
      get list() {
        return comicUrls.value.map((item) => ({
          name: `播放源(${item.key})`,
          orgId: item.key,
          values: item.value.map((url, index) => ({
            name: getVal(() => comic.playlist[index].name, '未知'),
            value: url
          }))
        }))
      }
    })
    /** 播放器初始化进度 */
    const initPlayerCurrentTime = ref(0)
    /** 选集列表-map */
    const anthologyListMap = computed(() =>
      anthology.list.reduce<{
        [orgId: string]: Type.Anthology['list'][0]
      }>((total, item) => {
        total[item.orgId] = item
        return total
      }, {})
    )

    /**
     *  修改选集
     * @param item 选择集信息
     * @param option {
     *  isAddCache是否添加到播放缓存
     *  resetInitPlayerCurrentTime是否重置播放器初始化进度
     * }
     */
    const changeAnthology = (
      item: ChangeReturns,
      { isAddCache = true, resetInitPlayerCurrentTime = false } = {}
    ) => {
      const { value } = item
      resetInitPlayerCurrentTime && (initPlayerCurrentTime.value = 0)

      // 错误地址判断
      if (['kol-fans.fp.ps'].some((key) => value.includes(key))) {
        anthology.bads.push(value)
        return false
      } else {
        anthology.current = value
        anthology.currentItem = item
        isAddCache && saveProgressCache(item)
        awVideoComp.value!.clearNotify()
        awVideoComp.value!.notify({
          content: `正在播放${item.name}`,
          duration: 3000
        })
        return true
      }
    }
    /** 下一集 */
    const nextAnthology = () => {
      if (!anthology.currentItem) return
      initPlayerCurrentTime.value = 0
      const list = anthologyListMap.value[anthology.currentItem.orgId]
      if (!list) return
      const nextIndex =
        list.values.findIndex(
          (item) => item.value === anthology.currentItem?.value
        ) + 1
      if (nextIndex >= list.values.length) {
        awVideoComp.value!.notify({
          content: `已经是最后一个了~`,
          duration: 3000
        })
      } else {
        changeAnthology({
          ...list.values[nextIndex],
          orgId: list.orgId
        })
      }
    }
    /**
     * 保存播放缓存
     * @param item 集信息
     * @param item
     */
    const saveProgressCache = (item: ChangeReturns | null) => {
      if (!item) return
      playProgressCache.add({
        orgId: item.orgId,
        name: String(item.name),
        progress: getVal(() => awVideoComp.value!.player.currentTime, 0),
        comicId: +props.id
      })
    }
    /**
     * AwVideo-error事件
     */
    const onVideoError = async () => {
      // 重置当前选集
      anthology.bads.push(anthology.current)
      anthology.current = ''
      anthology.currentItem = null
    }
    /**
     * 默认初始化
     */
    const init = async () => {
      // 获取对应缓存
      const cache = playProgressCache.getLatestCache(+props.id)
      if (cache) {
        console.log('cache', cache)

        // 查找缓存对应源
        const list = anthologyListMap.value[cache.orgId]
        if (!list) return
        // 查找缓存对应集
        const value = list.values.find((item) => item.name === cache.name)
        if (!value) return
        initPlayerCurrentTime.value = cache.progress
        changeAnthology(
          {
            ...value,
            orgId: list.orgId
          },
          {
            isAddCache: false
          }
        )
        awVideoComp.value?.notify({
          content: `上次播放到 ${value.name} ${sToMs(cache.progress)}`,
          duration: 3000
        })
      } else {
        // 默认选择第一个源下的第一集
        const item = getVal(() => anthology.list[0].values[0], null)
        item &&
          !changeAnthology(
            {
              ...item,
              orgId: anthology.list[0].orgId
            },
            {
              isAddCache: false
            }
          ) &&
          ElNotification({
            type: 'error',
            title: '动漫加载',
            message: '默认加载失败，请手动选择源'
          })
      }

      playHistoryCache.add({
        id: +props.id,
        name: comic.title,
        cover: comic.cover
      })
    }
    /**
     * 初始化-从路由中获取信息
     */
    const initInRoute = async () => {
      const list = anthologyListMap.value[routeParam.orgId]
      if (!list) return
      const value = list.values[routeParam.episode]

      initPlayerCurrentTime.value = routeParam.progress

      changeAnthology(
        {
          ...value,
          orgId: list.orgId
        },
        {
          isAddCache: false
        }
      )
      awVideoComp.value?.notify({
        content: `已为您定位到 ${value.name} ${sToMs(routeParam.progress)}`,
        duration: 3000
      })
    }

    /** 销毁前预处理 */
    onBeforeUnmount(() => {
      saveProgressCache(anthology.currentItem)
      playProgressCache.saveStore()
      playHistoryCache.saveStore()
    })

    return {
      ...comicInfoModuleArgs,
      comic,
      comicUrls,
      anthology,
      awVideoComp,
      routeParam,
      initPlayerCurrentTime,
      changeAnthology,
      onVideoError,
      nextAnthology
    }
  }
})
</script>
<style lang="less" scoped>
@import './style/main';
</style>
