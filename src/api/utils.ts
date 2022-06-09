/**
 * 视频地址格式化（用于处理部分错误的地址）
 * @param url
 * @returns
 */
export function videoUrlFormat(url: string) {
  return url.replaceAll("'", '').split('?url=').pop() || ''
}
