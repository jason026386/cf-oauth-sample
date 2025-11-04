const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const webpack = require('webpack')

module.exports = {
  entry: './game/main.ts',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, './public')
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: 'ts-loader',
          options: {
            configFile: 'tsconfig.game.json',
          }
        },
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader, {
            loader: "css-loader",
            options: {
              url: false,
            },
          }
        ]
      },
      {
        test: /\.ya?ml$/,
        use: "yaml-loader",
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: 'asset', // 100kb 이하면 자동으로 base64 인라인, 크면 파일로
        parser: {
          dataUrlCondition: {
            maxSize: 100 * 1024 // 100kb
          }
        }
      },
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
      'pixi.js': path.resolve(__dirname, 'node_modules/pixi.js'),
    },
  },
  plugins: [
    new MiniCssExtractPlugin({ filename: 'styles.css' }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      API_BASE_URI: JSON.stringify(
        process.env.NODE_ENV === 'production'
          ? 'https://mc2d.yj-publishing.workers.dev/api'
          : 'http://localhost:8081/api'
      ),
    }),
  ],
  mode: 'development'
}
