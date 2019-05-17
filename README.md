# core-webpack

[![npm version](https://img.shields.io/npm/v/gopack.svg?style=flat)](https://www.npmjs.com/package/gopack)

Dependencies: webpack webpack-dev-server chalk fs-extra.

## Installation

You can use doreact package on npm or yarn.

```
npm install topack --dev
yarn add topack --dev
```

## API

-   port
-   entry
-   output
-   resolve
-   loaders
-   plugins
-   server
    -   https
    -   contentBase
    -   proxy

## Development Configuration

```
dev:{
  port: 3000,
  https: true,
  entry: [`webpack-dev-server/client?https://0.0.0.0:${3000}`, "webpack/hot/dev-server", `${path.resolve("src")}/index.tsx`],
  output: {
    path: path.resolve("build/dist"),
    filename: "static/js/[name].js",
    publicPath: "/",
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx", ".sass", ".less"],
    modules: [path.resolve("src"), "node_modules"],
    alias: path.resolve("alias"),
  },
  loaders: [
      {
          test: /\.(ts|tsx)$/,
          include: [path.resolve("src")],
          loader: "ts-loader",
          exclude: /node_modules/,
          options: {},
      },
      {
          test: /\.(css|less)$/,
          use: [
              "style-loader",
              "css-loader",
              {
                  loader: "less-loader",
                  options: {
                      javascriptEnabled: true /* Inline-javascript, enabled can use Mixins */,
                  },
              },
          ],
      },
      {
          test: /\.(png|jpe?g|gif|webp)$/,
          loader: "url-loader",
          query: {
              limit: 1024 /* Generate separate images beyond limit otherwise use picture stream format. */,
              name: "static/img/[name].[hash:8].[ext]",
          },
      },
      {
          test: /\.(woff|woff2|eot|ttf|otf)$/,
          loader: "file-loader",
          options: {
              name: "static/font/[name].[hash:8].[ext]",
          },
      },
      {
          test: /\.mp4$/,
          loader: "file-loader",
      },
  ],
  plugins: [
    new StylelintPlugin({
        configFile: path.resolve("stylelint.json"),
        context: path.resolve("src"),
        files: ["**/*.less"],
        syntax: "less",
    }),
    new ForkTSCheckerPlugin({
        tsconfig: path.resolve("tsconfig.json"),
        tslint: path.resolve("tslint.json"),
    }),
    new HTMLPlugin({
        template: `${path.resolve("src")}/static/index.html`,
        favicon: `${path.resolve("src")}/static/favicon.ico`,
    }),
  ],
  server:{
    contentBase: path.resolve("static"),
    https: true,
    proxy: {},
  }
}
```

## Production Configuration

```
build:{
  entry: `${path.resolve("src")}/index.tsx`,
  output: {
      path: path.resolve("build/dist"),
      filename: "static/js/[name].[chunkhash:8].js",
      publicPath: "/",
  },
  resolve: {
      extensions: [".ts", ".tsx", ".js", ".jsx", ".less"],
      modules: [path.resolve("src"), "node_modules"],
  },
  optimization: {
      namedModules: true,
      runtimeChunk: "single",
      splitChunks: {
          automaticNameDelimiter: "-",
          maxAsyncRequests: 12,
      },
      minimizer: [
          new UglifyJSPlugin({
              cache: true,
              parallel: true,
              sourceMap: true,
              uglifyOptions: {
                  compress: {
                      pure_funcs: ["console.info", "console.debug", "console.time", "console.timeEnd"],
                  },
              },
          }),
          new OptimizeCSSAssetsPlugin({
              cssProcessorOptions: {
                  map: {
                      inline: false,
                  },
              },
          }),
      ],
  },
  performance: {
      maxEntrypointSize: 720000 /* 实际大小700kb */,
      maxAssetSize: 1000000,
  },
  loaders: [
      {
          test: /\.(ts|tsx)$/,
          include: [path.resolve("src")],
          loader: "ts-loader",
          options: {},
      },
      {
          test: /\.(css|less)$/,
          use: [
              MiniCSSExtractPlugin.loader,
              {
                  loader: "css-loader",
                  options: {
                      sourceMap: true,
                      importLoaders: 2,
                  },
              },
              {
                  loader: "postcss-loader",
                  options: {
                      sourceMap: true,
                      plugins: () => [autoprefixer],
                  },
              },
              {
                  loader: "less-loader",
                  options: {
                      javascriptEnabled: true,
                      sourceMap: true,
                  },
              },
          ],
      },
      {
          test: /\.(png|jpe?g|gif|webp)$/,
          loader: "url-loader",
          query: {
              limit: 1024,
              name: "static/img/[name].[hash:8].[ext]",
          },
      },
      {
          test: /\.(woff|woff2|eot|ttf|otf)$/,
          loader: "file-loader",
          options: {
              name: "static/font/[name].[hash:8].[ext]",
          },
      },
      {
          test: /\.mp4$/,
          loader: "file-loader",
          options: {
              name: "static/mp4/[name].[hash:8].[ext]",
          },
      },
  ],
  plugins: [
      new MiniCSSExtractPlugin({
          filename: "static/css/[name].[contenthash:8].css",
      }),
      new ForkTSCheckerPlugin({
          tsconfig: path.resolve("tsconfig.json"),
          tslint: path.resolve("tslint.json"),
          useTypescriptIncrementalApi: false,
          workers: ForkTSCheckerPlugin.TWO_CPUS_FREE,
      }),
      new StylelintPlugin({
          configFile: path.resolve("stylelint.json"),
          context: path.resolve("src"),
          files: ["**/*.less"],
          syntax: "less",
      }),
      new HTMLPlugin({
          template: `${path.resolve("src")}/static/index.html`,
          favicon: `${path.resolve("src")}/static/favicon.ico`,
          minify: {
              collapseBooleanAttributes: true,
              collapseInlineTagWhitespace: true,
              collapseWhitespace: true,
              includeAutoGeneratedTags: false,
              keepClosingSlash: true,
              minifyCSS: true,
              minifyJS: true,
              minifyURLs: true,
              removeAttributeQuotes: true,
              removeComments: true,
              removeEmptyAttributes: true,
              removeRedundantAttributes: true,
              removeScriptTypeAttributes: true,
              removeStyleLinkTypeAttributes: true,
              removeTagWhitespace: true,
              useShortDoctype: true,
          },
      })
  ],
}
```
