import { defineStore } from 'pinia'
import { getComicFavInstance, Comic } from '@/class/comicFav.class'

export type ComicFavInfo = Comic

export const useFavStore = defineStore('favStore', {
  getters: {
    comicFavs() {
      return getComicFavInstance().fav
    }
  },
  actions: {
    comicFav(comic: Comic) {
      getComicFavInstance().favHandler(comic)
    },
    isFavComic(id: string) {
      return getComicFavInstance().has(id)
    },
    saveComicFav() {
      getComicFavInstance().saveStore()
    }
  }
})
