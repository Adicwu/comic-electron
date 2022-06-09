import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import RouteList from './routes/index'
import { getServerIp } from '@/stores/systemConfig.store'
import { ElNotification } from 'element-plus'
import {
  getRouteSCMInstance,
  createRouteSCM
} from '@/class/routeScrollCache.class'
import { WEB_NAME } from '@/common/static'

createRouteSCM()

const routes: RouteRecordRaw[] = [
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/Error/404.vue'),
    meta: {
      title: WEB_NAME + '-404not found'
    }
  },
  {
    path: '/',
    component: () => import('@/views/Home/Index.vue'),
    meta: {
      title: WEB_NAME,
      dom: '#home'
    }
  },
  ...RouteList
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

router.beforeEach((to, from, next) => {
  getRouteSCMInstance().addCache(from.path, from.meta)

  if (to.name !== 'Setting' && !getServerIp()) {
    ElNotification({
      type: 'error',
      title: '配置',
      message: '请先配置服务器地址'
    })
    next({ name: 'Setting' })
  }
  next()
})
router.afterEach((to) => {
  getRouteSCMInstance().setScroll(to.path)
  document.title = String(to.meta.title) || WEB_NAME
})

export default router
