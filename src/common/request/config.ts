import { useSystemConfigStore } from '@/stores/systemConfig.store'

/**
 * 通用请求超时时间
 */
export const timeout = 14000
/**
 * 接口基准头
 */
export const BASE_URL = useSystemConfigStore().serverIp
