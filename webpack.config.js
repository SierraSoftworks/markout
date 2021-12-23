const devCerts = require("office-addin-dev-certs");
const path = require("path")
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");

module.exports = async (env, options) => {
  const config = {
    devtool: "source-map",
    target: "web",
    entry: {
      taskpane: "./src/taskpane/taskpane.ts",
      commands: "./src/commands/commands.ts",
      debug: "./src/debug/debug.ts",
    },
    resolve: {
      extensions: [".ts", ".tsx", ".html", ".js"],
      alias: { "superagent-proxy": path.resolve(__dirname, "src/shims/superagent-proxy") },
      fallback: {
        "assert": require.resolve("assert/"),
        "buffer": require.resolve("buffer/"),
        "https": require.resolve("https-browserify"),
        "fs": false,
        "os": require.resolve("os-browserify/browser"),
        "stream": require.resolve("stream-browserify"),
        "url": false,
      }
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          exclude: /node_modules/,
          use: "babel-loader"
        },
        {
          test: /\.html$/,
          exclude: /node_modules/,
          use: "html-loader"
        },
        {
          test: /\.(png|jpg|jpeg|gif)$/,
          use: "file-loader"
        }
      ]
    },
    plugins: [
      new webpack.DefinePlugin({
        "process.env.NODE_DEBUG": false
      }),
      new CleanWebpackPlugin(),
      new HtmlWebpackPlugin({
        filename: "taskpane.html",
        template: "./src/taskpane/taskpane.html",
        chunks: ["polyfill", "taskpane"]
      }),
      new HtmlWebpackPlugin({
        filename: "commands.html",
        template: "./src/commands/commands.html",
        chunks: ["polyfill", "commands"]
      }),
      new HtmlWebpackPlugin({
        filename: "debug.html",
        template: "./src/debug/debug.html",
        chunks: ["polyfill", "debug"]
      })
    ],
    devServer: {
      headers: {
        "Access-Control-Allow-Origin": "*"
      },
      port: process.env.npm_package_config_dev_server_port || 3000,
      server: {
        type: 'https',
        options: (options.https !== undefined) ? options.https : await devCerts.getHttpsServerOptions().catch(err => {}),
      }
    }
  };

  return config;
};
