/* global module: false */
/* jshint camelcase: false */

'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    // Metadata.
    pkg: grunt.file.readJSON('bower.json'),
    banner: '/*! <%= pkg.title %> - v<%= pkg.version %> - ' + '<%= grunt.template.today("yyyy-mm-dd") %>\n' + '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' + '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.copyright %>;' + ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',
    // Task configuration.
    concat: {
      options: {
        banner: '<%= banner %>',
        stripBanners: true
      },
      dist: {
        src: [
            'lib/util/**/*.js',
            'lib/namespace.js',
            'lib/amd.module.js',
            'lib/<%= pkg.name %>.*.js',
            'lib/shine.js'
          ],
        dest: 'dist/<%= pkg.name %>.js'
      }
    },
    uglify: {
      options: {
        banner: '<%= banner %>',
        sourceMap: true,
        wrap: 'shinejs'
      },
      dist: {
        src: '<%= concat.dist.dest %>',
        dest: 'dist/<%= pkg.name %>.min.js'
      }
    },
    jshint: {
      options: {
        node: true,
        browser: true,
        esnext: true,
        bitwise: false,
        camelcase: true,
        curly: true,
        eqeqeq: true,
        immed: true,
        indent: 2,
        latedef: true,
        newcap: true,
        noarg: true,
        quotmark: 'single',
        undef: true,
        unused: true,
        strict: true,
        trailing: true,
        smarttabs: true,
        predef: ['shinejs', 'shinejsGlobal']
      },
      gruntfile: {
        src: 'Gruntfile.js'
      },
      lib_test: {
        src: ['lib/**/*.js', 'test/**/*.js']
      }
    },
    qunit: {
      files: ['test/**/*.html']
    },
    copy: {
      ghpages: {
        expand: true,
        flatten: true,
        filter: 'isFile',
        src: ['dist/**'],
        dest: '../gh-pages/js/'
      }
    },
    watch: {
      gruntfile: {
        files: '<%= jshint.gruntfile.src %>',
        tasks: ['jshint:gruntfile']
      },
      js: {
        files: ['<%= concat.dist.src %>'],
        tasks: ['jshint', 'concat', 'uglify', 'ghpages']
      }
      /*,
      lib_test: {
        files: '<%= jshint.lib_test.src %>',
        tasks: ['jshint:lib_test', 'qunit']
      }*/
    }
  });

  grunt.registerTask('ghpages','Copy files to GitHub Pages directory', function(){
    var dest = grunt.config.get('copy.ghpages.dest');

    if (!grunt.file.exists(dest)) {
      grunt.log.writeln('To copy dist files to gh-pages on build, checkout ' +
        'the \n\'gh-pages\' branch so that ' + dest + 'is writable.');
      return true;
    }

    grunt.log.writeln('Copying distribution files to ', dest);

    grunt.task.run('copy:ghpages');

    return true;
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Default task.
  grunt.registerTask('default', ['jshint', /*'qunit',*/ 'concat', 'uglify']);

};
