module.exports = (grunt) ->

  # Used instead of "ext" to accommodate filenames with dots. Lots of talk all
  # over GitHub, including here: https://github.com/gruntjs/grunt/pull/750
  coffeeRename = (dest, src) -> "#{ dest }#{ src.replace /\.(lit)?coffee$/, '.js' }"

  # Project configuration.
  grunt.initConfig
    pkg: grunt.file.readJSON 'package.json'
    browserify:
      options:
        transform: ['coffeeify']
      standalone:
        options:
          standalone: 'httprequest'
        files:
          './browser-builds/standalone/httprequest.js': './lib/core.js'
          './browser-builds/standalone/httprequest-full.js': './lib/complete.js'
    coffee:
      compile:
        files: [
          expand: true
          cwd: './src/'
          src: ['**/*.?(lit)coffee']
          dest: './lib/'
          rename: coffeeRename
        ]
    mochaTest:
      test:
        options:
          reporter: 'Spec'
          clearRequireCache: true
          require: 'coffee-script/register'
          grep: grunt.option 'grep'
        src: ['test/**/*.?(lit)coffee']
    watch:
      options:
        atBegin: true
      lib:
        files: ['src/*.?(lit)coffee']
        tasks: ['build:node', 'build:standalone']
    bump:
      options:
        files: ['package.json', 'bower.json']
        commit: true
        commitFiles: ['-a']
        createTag: true
        push: false

  # Load grunt plugins
  grunt.loadNpmTasks 'grunt-contrib-coffee'
  grunt.loadNpmTasks 'grunt-contrib-watch'
  grunt.loadNpmTasks 'grunt-mocha-test'
  grunt.loadNpmTasks 'grunt-bump'
  grunt.loadNpmTasks 'grunt-browserify'

  # Define tasks.
  grunt.registerTask 'build', ['build:node', 'build:standalone']
  grunt.registerTask 'build:node', ['coffee']
  grunt.registerTask 'build:standalone', ['build:node', 'browserify:standalone']
  grunt.registerTask 'default', ['build']
  grunt.registerTask 'test', ['mochaTest']
