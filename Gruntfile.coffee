module.exports = (grunt) ->

  TEST_SERVER_PORT = process.env.TEST_SERVER_PORT ? 4000

  # Used instead of "ext" to accommodate filenames with dots. Lots of talk all
  # over GitHub, including here: https://github.com/gruntjs/grunt/pull/750
  coffeeRename = (dest, src) -> "#{ dest }#{ src.replace /\.(lit)?coffee$/, '.js' }"

  # Project configuration.
  grunt.initConfig
    pkg: grunt.file.readJSON 'package.json'
    browserify:
      standalone:
        options:
          bundleOptions:
            standalone: 'httprequest'
        files:
          './browser-builds/standalone/httprequest.js': './lib/index.js'
    coffee:
      compile:
        files: [
          expand: true
          cwd: './src/'
          src: ['**/*.?(lit)coffee']
          dest: './lib/'
          rename: coffeeRename
        ]
      browsertests:
        files: [
          expand: true
          cwd: './test/'
          src: ['**/*.?(lit)coffee']
          dest: './test/'
          rename: coffeeRename
        ]
    connect:
      tests:
        options:
          port: TEST_SERVER_PORT
          base: '.'
          keepalive: grunt.option('keepalive')?
    express:
      testapp:
        options:
          hostname: 'localhost'
          port: 4001
          server: './test/app'
    mocha:
      all:
        options:
          run: true
          log: true
          logErrors: true
          reporter: 'Spec'
          urls: ["http://localhost:#{ TEST_SERVER_PORT }/test/index.html"]
          mocha:
            grep: grunt.option 'grep'  # Forward the grep option to mocha
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
  grunt.loadNpmTasks 'grunt-contrib-connect'
  grunt.loadNpmTasks 'grunt-express'
  grunt.loadNpmTasks 'grunt-mocha'
  grunt.loadNpmTasks 'grunt-bump'
  grunt.loadNpmTasks 'grunt-browserify'

  # Define tasks.
  grunt.registerTask 'build', ['build:node', 'build:standalone']
  grunt.registerTask 'build:node', ['coffee']
  grunt.registerTask 'build:browsertests', ['coffee:browsertests']
  grunt.registerTask 'build:standalone', ['build:node', 'browserify:standalone']
  grunt.registerTask 'default', ['build']
  grunt.registerTask 'test', ['build:browsertests', 'build:standalone', 'testapp', 'connect:tests', 'mocha']
  grunt.registerTask 'testapp', ['express']
