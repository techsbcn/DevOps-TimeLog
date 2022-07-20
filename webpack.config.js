const path = require('path');
const fs = require('fs');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const Dotenv = require('dotenv-webpack');
const webpack = require('webpack');

// Webpack entry points. Mapping from resulting bundle name to the source file entry.
const entries = {};

// Loop through subfolders in the "Samples" folder and add an entry for each one
const contributionsDir = path.join(__dirname, 'src/Contributions');
fs.readdirSync(contributionsDir).filter((dir) => {
  if (fs.statSync(path.join(contributionsDir, dir)).isDirectory()) {
    entries[dir] = './' + path.relative(process.cwd(), path.join(contributionsDir, dir, dir));
  }
});

module.exports = (env) => ({
  entry: entries,
  output: {
    filename: '[name]/[name].js',
    publicPath: env.mode == 'development' ? '/dist/' : '../',
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.dev.js', '.json', '.wasm'],
    alias: {
      'azure-devops-extension-sdk': path.resolve('node_modules/azure-devops-extension-sdk'),
    },
    fallback: {
      url: false,
      fs: false,
      assert: require.resolve('assert'),
      crypto: require.resolve('crypto-browserify'),
      http: require.resolve('stream-http'),
      https: require.resolve('https-browserify'),
      os: require.resolve('os-browserify/browser'),
      buffer: require.resolve('buffer'),
      stream: require.resolve('stream-browserify'),
      path: false,
      util: false,
      tls: false,
      net: false,
      zlib: require.resolve('browserify-zlib'),
    },
  },
  stats: {
    warnings: false,
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
      },
      {
        test: /\.scss$/,
        use: ['style-loader', 'css-loader', 'azure-devops-ui/buildScripts/css-variables-loader', 'sass-loader'],
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.woff$/,
        use: [
          {
            loader: 'base64-inline-loader',
          },
        ],
      },
      {
        test: /\.html$/,
        loader: 'file-loader',
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              query: {
                name: 'static/[name].[ext]',
              },
            },
          },
          {
            loader: 'image-webpack-loader',
            options: {
              query: {
                mozjpeg: {
                  progressive: true,
                },
                gifsicle: {
                  interlaced: true,
                },
                optipng: {
                  optimizationLevel: 7,
                },
              },
            },
          },
        ],
      },
      {
        test: /\/worker\.js$/,
        use: { loader: 'worker-loader' },
      },
    ],
  },
  devtool: 'source-map',
  devServer: {
    https: true,
    port: 3000,
    hot: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': '*',
      'Access-Control-Allow-Headers': '*',
    },
  },
  plugins: [
    new Dotenv({ path: env.mode == 'development' ? './.env' : `./.env.${env.mode}` }),
    new CopyWebpackPlugin({
      patterns: [
        { from: '**/*.html', context: 'src/Contributions' },
        { from: 'sql-wasm.wasm', to: './' },
        //{ from: 'blank-auth-end.html', to: './' },
        //{ from: 'auth-start.html', to: './' },
        { from: '**/*.html', context: 'src/authFiles' },
      ],
    }),
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    }),
  ],
});
