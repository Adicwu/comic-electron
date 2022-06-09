import { defineStore } from 'pinia'
import * as FnReturns from '@/api/type'

type ComicUpdateInfo = FnReturns.GetHomeMixData['perweek']

/**
 * 由于目前接口特性，故只有在首页home.vue中才会获取数据
 */
export const useComicUpdate = defineStore('comicUpdate', {
  state() {
    return {
      comic: new Map<
        ComicId,
        {
          updateTime: string
          status: string
        }
      >()
    }
  },
  actions: {
    setComic(comic: ComicUpdateInfo) {
      comic.forEach(({ name, value }) => {
        value.forEach((item) => {
          this.comic.set(item.id, {
            updateTime: name,
            status: item.season
          })
        })
      })
    },
    /**
     * 获取动漫更新信息
     * @param comicId
     * @returns
     */
    getComicUpdateInfo(comicId: ComicId) {
      return this.comic.get(comicId)
    }
  }
})
