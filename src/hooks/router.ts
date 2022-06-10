import router from '../router/index'
import { useIpc } from '@/hooks/ipc'

/**
 * 前往动漫详情
 * @param id
 * @returns
 */
export function toComicMain(
  id: number | string,
  type: 'push' | 'replace' = 'push'
) {
  // useIpc().openMain(id)
  return router[type]({
    name: 'ComicMain',
    params: {
      id
    }
  })
}
