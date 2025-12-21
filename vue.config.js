module.exports = {
  devServer: {
    port: 8081,
    proxy: {
      '/api': {
        target: 'http://117.72.123.149:20255',
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

