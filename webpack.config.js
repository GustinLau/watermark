module.exports = {
  entry: './src/index.js',
  mode: process.env.NODE_ENV,
  devServer: {
    port:8696,
    open:true,
    hot:true,
    static:'public'
  },
  output: {
    filename: 'index.js',
    libraryTarget: 'umd',
    library: 'Watermark'
  },
  module: {
    rules: [
      { test: /\.js$/, use: 'babel-loader' }
    ]
  }
}
