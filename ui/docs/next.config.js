const { withContentlayer } = require('next-contentlayer')

module.exports = withContentlayer({
  output: 'export',
  images: { unoptimized: true },
})
