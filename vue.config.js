const { defineConfig } = require('@vue/cli-service')
const path = require('path')
const resolve = (dir) => path.join(__dirname, dir)
module.exports = defineConfig({
  transpileDependencies: true,
  chainWebpack: (config) => {
    config.resolve.alias
      .set('~styles', resolve('./src/assets/css'))
      .set('static', resolve('./src/assets'))
      .set('@apis', resolve('./src/api'))
      .set('@comps', resolve('./src/components'))
  },
  pluginOptions: {
    'style-resources-loader': {
      preProcessor: 'less',
      patterns: [path.resolve(__dirname, './src/assets/css/util.less')]
    }
  }
})
