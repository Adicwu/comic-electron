export default class CacheAssist {
  private readonly locationKey = 'cache'
  private getStorage() {
    return localStorage.getItem(this.locationKey)
  }
  private setStorage() {
    return localStorage.setItem(
      this.locationKey,
      new Date().getTime().toString()
    )
  }
  public removeStorage() {
    localStorage.removeItem(this.locationKey)
  }
  public getFirstCahce() {
    const cache = this.getStorage()
    const hasCache = Boolean(cache)
    !hasCache && this.setStorage()
    return hasCache
  }
}
export function createCacheAssist() {
  return new CacheAssist()
}
