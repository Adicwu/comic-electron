import { dfGetax } from '@/common/request/index'
import * as FnReturns from './type'
import * as ApiReturns from './api.type'
import { getVal } from 'adicw-utils'

/**
 * 获取动漫的相关图片列表-来源pixiv
 * @param param
 */
export async function getComicImglist({
  name = '',
  limit = 20,
  offset = 0
}: {
  /** 动漫名称 */
  name?: string
  /** 分页大小 */
  limit?: number
  /** 偏移数量 */
  offset?: number
}): Promise<FnReturns.GetComicImglistReturn> {
  try {
    const realName = name
      .split(' ')[0]
      .split('/')[0]
      .split('(')[0]
      .replace(
        /(第一季|第二季|第四季|第五季|第六季|第七季|BD|无修|剧场版|？)/,
        ''
      )
    const { data } = await dfGetax<ApiReturns.VilipixIllust>(
      `https://www.vilipix.com/api/illust/tag/${realName}?limit=${limit}&offset=${offset}`
    )
    return (data.rows || []).map((item) => ({
      date: item.create_date,
      title: item.alt,
      url: item.regular_url,
      id: item.id,
      desc: item.description,
      w: item.width,
      h: item.height
    }))
  } catch (e) {
    return []
  }
}

/**
 * 获取动漫图片详情，和getComicImglist关联
 * todo
 * @param param
 */
export async function getComicImgmain({ id }: { id: string; userId: string }) {
  try {
    const { data } = await dfGetax<ApiReturns.VilipixTranslate>(
      `https://www.vilipix.com/api/translate/${id}`
    )
    const info = getVal(() => data.data.source_json, '')
    console.log(info)
  } catch {
    return ''
  }
}
