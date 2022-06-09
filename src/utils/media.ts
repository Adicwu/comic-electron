import { wait } from 'adicw-utils'

/**
 * 图片加载
 * @param path 图片地址
 * @returns
 */
export function loadImg(path: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const iamge = new Image()
    iamge.src = path
    iamge.onload = () => resolve(path)
    iamge.onerror = reject
  })
}

/**
 * 获取当前视频截屏
 * @param videoUrl 视频源
 * @param currentTime 截取的时间戳
 * @returns
 */
export async function getVideoScreenshot(
  videoUrl: string,
  currentTime: number
) {
  try {
    const video = document.createElement('video')
    video.src = videoUrl
    video.crossOrigin = '*'
    await new Promise((resolve) => (video.oncanplay = resolve))
    video.currentTime = currentTime
    await wait(300)

    const canvas = document.createElement('canvas')
    canvas.width = 160
    canvas.height = 90
    canvas.getContext('2d')!.drawImage(video, 0, 0, canvas.width, canvas.height)
    return canvas.toDataURL('image/png')
  } catch (e) {
    console.log(e)
    return ''
  }
}
