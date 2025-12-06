export default {
  plugins: {
    autoprefixer: {
      overrideBrowserslist: [
        '> 1%',
        'last 2 versions',
        'not dead',
        'not ie <= 11', // IE11 需要特殊处理，这里先排除
        'iOS >= 9',
        'Android >= 4.4'
      ],
      flexbox: 'no-2009' // 使用现代 flexbox 语法
    }
  }
}
















