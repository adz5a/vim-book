"use strict";

const { resolve } = require("path");
const { appSrc } = require("./paths");


module.exports = {
    views: resolve(appSrc, "views"),
    data: resolve(appSrc, "data"),
    components: resolve(appSrc, "components"),
      // Support React Native Web
      // https://www.smashingmagazine.com/2016/08/a-glimpse-into-the-future-with-react-native-for-web/
      'react-native': 'react-native-web',
};
