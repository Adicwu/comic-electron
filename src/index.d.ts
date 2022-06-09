/**
 * 对象值类型
 */
type ValueOf<T> = T[keyof T]

/**
 * 动漫id
 */
type ComicId = string | number
