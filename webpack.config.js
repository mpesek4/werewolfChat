module.exports = {
    entry: './client/index.js',
    entry: [
        '@babel/polyfill', // enables async-await
        './client/index.js'
      ],
    devtool: 'source-map',
    output: {
        path: __dirname,
        filename: './public/bundle.js'
      },
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          exclude: /(node_modules|bower_components)/,
          loader: 'babel-loader',
        },
        // use the style-loader/css-loader combos for anything matching the .css extension
        {
          test: /\.css$/,
          use: [
            'style-loader',
            'css-loader',
          ]
        }
      ]
    }
  };