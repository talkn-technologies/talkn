const webpack = require('webpack');
const path = require('path');
const os = require('os');
const homeDir = os.homedir();
console.log('@@@', path.resolve(__dirname, 'api-client/src') + '/',)
module.exports = {
  cache: false,
  entry: {
    javascript: path.resolve(__dirname, `./src`),
  },
  output: {
    filename: `talkn.visualizar.js`,
    path: path.resolve(__dirname, `./dist/`),
  },
  module: {
    rules: [
      {
        test: /\.tsx|.ts$/,
        exclude: [/node_modules/],
        use: [{ loader: 'ts-loader' }],
      },
    ],
  },
  resolve: {
    alias: {
      '@api-client': path.resolve(__dirname, 'api-client/src') + '/',
      '@common': path.resolve(__dirname, 'api-client/common/src') + '/',
    },
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    fallback: {
      process: require.resolve('process/browser'),
      os: require.resolve('os-browserify/browser'),
    },
  },
  plugins: [new webpack.HotModuleReplacementPlugin()],
  devServer: {
    allowedHosts: 'all',
    compress: true,
    server: {
      type: 'https',
      options: {
        key: path.resolve(__dirname, `../talkn-ch-gateway/common/ch-configs/localhost/openssl.key`),
        cert: path.resolve(__dirname, `../talkn-ch-gateway/common/ch-configs/localhost/openssl.crt`),
       },
    },
    port: 8080,
  },

  //  plugins: [new BundleAnalyzerPlugin()],
  devtool: 'inline-source-map',
};
