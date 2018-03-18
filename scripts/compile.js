var easyfile = require('easyfile');
var path = require('path');
var HasteResolver = require('haste-resolver');
var babel = require('babel-core');
var glob = require('glob');

var resolver = new HasteResolver({
  roots: [path.join(__dirname, '../src')]
});

resolver.getHasteMap().then(function(hasteMap) {

  var files = glob.sync('**/*.js', {
    nodir: true,
    cwd: path.join(__dirname, '../src/'),
    realpath: true,
  });

  files.forEach(function(filePath) {
    try {
      var options = {
        presets: ['react-native', 'stage-0'],
        plugins: [
          [require('./rewrite-modules'), {
            getModule: hasteMap.getModule.bind(hasteMap),
            filePath: filePath,
            platform: 'web'
          }],
        ],
        sourceMaps: true
      };
      var { code, map } = babel.transformFileSync(filePath, options);
      var buildPath = filePath.replace('src', 'lib');
      easyfile.write(buildPath, code, {
        force: true,
        backup: false,
      });

      easyfile.write(`${buildPath}.map`, JSON.stringify(map), {
        force: true,
        backup: false,
      });
      console.log(filePath, '->', buildPath);
    } catch (e) {
      console.error(e);
    }
  });
});
