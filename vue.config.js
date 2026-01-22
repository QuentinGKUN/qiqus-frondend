module.exports = {
  devServer: {
    port: 8081,
    proxy: {
      '/api': {
        target: 'http://175.178.119.226:20255',
        changeOrigin: true,
        pathRewrite: {
          '^/api': '/api'
        }
      }
    }
  },
  publicPath: process.env.NODE_ENV === 'production' ? '/' : '/',
  lintOnSave: false
}

