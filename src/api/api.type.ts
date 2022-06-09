export interface Search {
  /** 状态码 */
  code: number
  /** 状态文字 */
  message: string
  /** 数据 */
  data: {
    /** 当前返回页数 */
    pageindex: number
    /** 总页数 */
    pagetotal: number
    /** 动漫列表 */
    results: {
      /** 分类列表 */
      category: string
      /** 封面 */
      cover: string
      /** 首发时间 */
      date: string
      /** 介绍 */
      description: string
      /** 动漫id */
      id: string
      /** 动漫状态（更新、完结...） */
      season: string
      /** 动漫名称 */
      title: string
    }[]
  }
}

export interface Filter {
  /** 状态码 */
  code: number
  /** 状态文字 */
  message: string
  /** 数据 */
  data: {
    /** 当前返回页数 */
    total_page: number
    /** 总页数 */
    total: number
    /** 动漫列表 */
    results: {
      /** 封面 */
      cover: string
      /** 动漫id */
      id: string
      /** 动漫状态（更新、完结...） */
      season: string
      /** 动漫名称 */
      title: string
    }[]
  }
}

export interface GetAnime {
  /** 状态码 */
  code: number
  /** 状态文字 */
  message: string
  /** 数据 */
  data: {
    /** 声优名字列表 */
    actors: string[]
    /** 分类列表 */
    categories: string[]
    /** 封面 */
    cover: string
    /**首发时间 */
    first_date: string
    /** 语言 */
    lang: string
    /** 作者 */
    master: string
    /** 播放列表 */
    playlist: {
      /** 播放源id-集列表 */
      [prop: number]: {
        /** 注意：此选项暂时无用 */
        link: string
        /** 当前集名称 */
        title: string
      }[]
    }
    /** 分数 */
    rank: string
    /** 发布国家 */
    region: string
    /** 动漫状态（更新、完结...） */
    season: string
    /** 动漫名称 */
    title: string
  }
}

export interface GetVideo {
  /** 状态码 */
  code: number
  /** 状态文字 */
  message: string
  /** 数据 */
  data: {
    /** 播放源id-地址列表 */
    [prop: number]: string[]
  }
}

export interface GetConfig {
  /** 状态码 */
  code: number
  /** 状态文字 */
  message: string
  /** 数据 */
  data: {
    /** 动漫筛选-条件 */
    filtersConfig: {
      /** 分类-名称 */
      name: string
      /** 分类-id */
      id: number
      /** 分类-类型列表 */
      categories: {
        /** 类型-名称 */
        classname: string
        /** 类型-id */
        classid: string
      }[]
    }[]
  }
}

export interface GetIndex {
  /** 状态码 */
  code: number
  /** 状态文字 */
  message: string
  /** 数据 */
  data: {
    /** 轮播 */
    banner: {
      /** 封面 */
      cover: string
      /** 动漫id */
      id: string
      /** 动漫名称 */
      title: string
    }[]
    /** 国漫 */
    chinese_comic: {
      /** 封面 */
      cover: string
      /** 动漫id */
      id: string
      /** 动漫状态（更新、完结...） */
      season: string
      /** 动漫名称 */
      title: string
    }[]
    /** 热门动漫 */
    hots: {
      results: {
        /** 封面 */
        cover: string
        /** 动漫id */
        id: string
        /** 动漫状态（更新、完结...） */
        season: string
        /** 动漫名称 */
        title: string
        /** 首发时间 */
        date: string
        /** 介绍 */
        description: string
      }[]
    }
    /** 完结日漫 */
    japancomic: {
      /** 封面 */
      cover: string
      /** 动漫id */
      id: string
      /** 动漫状态（更新、完结...） */
      season: string
      /** 动漫名称 */
      title: string
    }[]
    /** 最新更新 */
    latest: {
      /** 封面 */
      cover: string
      /** 动漫id */
      id: string
      /** 动漫状态（更新、完结...） */
      season: string
      /** 动漫名称 */
      title: string
    }[]
    /** 周更新列表 */
    perweek: {
      /** 周几（0-6）-更新的动漫列表 */
      [prop: number]: {
        /** 动漫id */
        id: string
        /** 动漫状态（更新、完结...） */
        season: string
        /** 动漫名称 */
        title: string
      }[]
    }
    /** 推荐动漫番外 */
    theatre_comic: {
      /** 封面 */
      cover: string
      /** 动漫id */
      id: string
      /** 动漫状态（更新、完结...） */
      season: string
      /** 动漫名称 */
      title: string
    }[]
  }
}

export interface VilipixIllust {
  /** 结果 */
  rows: {
    /** 图片id */
    id: string
    /** 作者id */
    user_id: string
    /** 创建时间 */
    create_date: string
    /** 简介 */
    description: string
    /** 名称 */
    alt: string
    /** 分类 字符串，逗号分割 */
    tags: string
    /** 图片地址 */
    regular_url: string
    /** 图片宽度 */
    width: number
    /** 图片高度 */
    height: number
  }[]
  /** 结果总数 */
  count: number
}

export interface VilipixTranslate {
  data: {
    /** json */
    source_json: string
  }
}
