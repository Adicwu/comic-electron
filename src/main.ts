import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'

import App from './App.vue'
import { directs } from '@/utils/vue/directs'

import { createTheme } from './theme/theme.class'
import { elementPlusInit } from './plugins/elementPlus'
import { createVueInit } from '@/utils/vue/index'
import { createPreloadCdn } from '@/plugins/preloadCdn.class'
import { createPlayProgress } from '@/class/playProgress.class'
import { createPlayHistory } from '@/class/playHistory.class'
import { createComicFav } from '@/class/comicFav.class'

createPreloadCdn()
createTheme()
createPlayProgress().getStore()
createPlayHistory().getStore()
createComicFav().getStore()

const app = createApp(App)
app.use(createPinia())
elementPlusInit(app)
createVueInit(app).useDirects(directs).useComps()
app.use(router).mount('#app')

window.addEventListener('unhandledrejection', (e) => {
  e.preventDefault()
})
