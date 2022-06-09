import { defineStore } from 'pinia'

const REQUEST_BASEURL_STORE_KEY = 'REQUEST_BASEURL_STORE'

export function getServerIp() {
  return localStorage.getItem(REQUEST_BASEURL_STORE_KEY) || ''
}

export const useSystemConfigStore = defineStore('SystemConfig', {
  state: () => ({
    serverIp: ''
  }),
  actions: {
    saveServerIp(url: string) {
      this.serverIp = url
      localStorage.setItem(REQUEST_BASEURL_STORE_KEY, url)
    },
    getServerIp() {
      this.serverIp = getServerIp()
    }
  }
})
