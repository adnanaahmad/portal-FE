/* global require, module */
const withAntdLess = require("next-plugin-antd-less");

module.exports = withAntdLess({
  async rewrites() {
    return [
      // Rewrite everything else to use `pages/index`
      {
        source: "/:path*",
        destination: "/",
      },
    ];
  },
});
