const path = require('path');

module.exports = {
  entry: './src/scripts/PAPI.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
  },
  plugins: [
    nodeResolve({
      jsnext: true
    }),
  ],
  resolve: {
    fallback: { crypto: require.resolve('crypto-browserify') },
  },
};
