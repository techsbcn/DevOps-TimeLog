const path = require('path');
const fs = require('fs');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const Dotenv = require('dotenv-webpack');

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
    publicPath: '/dist/',
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.dev.js', '.json', '.wasm'],
    alias: {
      'azure-devops-extension-sdk': path.resolve('node_modules/azure-devops-extension-sdk'),
    },
    fallback: {
      crypto: false,
      path: false,
      fs: false,
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
    ],
  },
  devtool: 'inline-source-map',
  devServer: {
    https: true,
    port: 3000,
    hot: true,
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
  plugins: [
    new Dotenv({ path: env.mode == 'development' ? './.env' : `./.env.${env.mode}` }),
    new CopyWebpackPlugin({
      patterns: [
        { from: '**/*.html', context: 'src/Contributions' },
        { from: 'sql-wasm.wasm', to: './' },
      ],
    }),
  ],
});
