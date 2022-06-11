const { defineConfig } = require('@vue/cli-service')
const path = require('path')
const resolve = (dir) => path.join(__dirname, dir)
module.exports = defineConfig({
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
    },
    electronBuilder: {
      builderOptions: {
        productName: 'Masami',
        win: {
          target: ['msi', 'nsis'],
          icon: 'public/android-chrome-512x512.png'
        },
        nsis: {
          oneClick: false, //是否一键安装，默认为true
          language: '2052', //安装语言，2052对应中文
          perMachine: true, //为当前系统的所有用户安装该应用程序
          allowToChangeInstallationDirectory: true //允许用户选择安装目录
        }
      }
    }
  }
})
