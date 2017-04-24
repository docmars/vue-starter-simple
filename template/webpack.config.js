var path = require('path')
var webpack = require('webpack')
var HtmlWebpackPlugin = require('html-webpack-plugin')
var ExtractTextPlugin = require('extract-text-webpack-plugin')
var CleanWebpackPlugin = require('clean-webpack-plugin')

module.exports = {
  entry: './src/main.js',
  output: {
    path: path.resolve(__dirname, './dist'),
    publicPath: './',
    filename: '[hash].[name].js'
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          loaders: {
            {{#sass}}
            // Since sass-loader (weirdly) has SCSS as its default parse mode, we map
            // the "scss" and "sass" values for the lang attribute to the right configs here.
            // other preprocessors should work out of the box, no loader config like this necessary.
            'scss': 'vue-style-loader!css-loader!sass-loader',
            'sass': 'vue-style-loader!css-loader!sass-loader?indentedSyntax'
            {{/sass}}
          }
          // other vue-loader options go here
        }
      },
      {
        test: /\.css$/,
        loader: 'css-loader'
      },
      {
        test: /\.(sass|scss)$/,
        loader: sassLoader()
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]?[hash]'
        }
      },

      // Fonts
      { test: /\.woff$/, loader: 'url-loader?limit=65000&mimetype=application/font-woff' },
      { test: /\.woff2$/, loader: 'url-loader?limit=65000&mimetype=application/font-woff2' },
      { test: /\.[ot]tf$/, loader: 'url-loader?limit=65000&mimetype=application/octet-stream' },
      { test: /\.eot$/, loader: 'url-loader?limit=65000&mimetype=application/vnd.ms-fontobject' }
    ]
  },
  resolve: {
    alias: {
      'vue$': 'vue/dist/vue.esm.js',
      'src': path.resolve(__dirname, 'src'),
      'components': path.resolve(__dirname, 'src/components'),
      'assets': path.resolve(__dirname, 'src/assets'),
      'store': path.resolve(__dirname, 'src/store')
    }
  },
  devServer: {
    historyApiFallback: true,
    noInfo: true,
    publicPath: '/'
  },
  performance: {
    hints: false
  },
  devtool: '#eval-source-map',
  plugins: [
    new ExtractTextPlugin({
      filename: '[name].[contenthash].css',
      allChunks: false
    }),
    new HtmlWebpackPlugin({
      template: 'index.ejs',
      filename: 'index.html',
      inject: true,
      hash: true
    })
  ]
}

if (process.env.NODE_ENV === 'production') {
  module.exports.devtool = '#source-map'
  // http://vue-loader.vuejs.org/en/workflow/production.html
  module.exports.plugins = (module.exports.plugins || []).concat([
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
    new CleanWebpackPlugin(['dist'], {}),
    new webpack.optimize.UglifyJsPlugin({
      sourceMap: true,
      compress: {
        warnings: false
      }
    }),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks: function (module, count) {
        // any required modules inside node_modules are extracted to vendor
        return (
          module.resource &&
          /\.js$/.test(module.resource) &&
          module.resource.indexOf(
            path.join(__dirname, 'node_modules')
          ) === 0
        )
      }
    }),
    new HtmlWebpackPlugin({
      template: 'index.ejs',
      filename: 'index.html',
      inject: true,
      hash: true,
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true
      },
      chunksSortMode: 'dependency',
    }),
    new webpack.LoaderOptionsPlugin({
      minimize: true
    }),
    new ExtractTextPlugin('styles.css')
  ])
}

function sassLoader() {
  let loader
  if (process.env.NODE_ENV === 'production') {
    loader = ExtractTextPlugin.extract({
      fallbackLoader: 'style-loader',
      loader: ['css-loader?sourceMap', 'resolve-url-loader', 'sass-loader?sourceMap']
    })
  } else {
    loader = ['style-loader', 'css-loader', 'sass-loader']
  }
  return loader
}