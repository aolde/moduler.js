module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    
    jshint: {
      all: ['src/moduler.js'],
      options: {
        '-W030': true
      }
    },
    
    clean: ["build"],
    
    copy: {
      main: {
        src: 'src/moduler.js', 
        dest: 'build/moduler-<%= pkg.version %>.js'
      }
    },
    
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> (v<%= pkg.version %>) built at <%= grunt.template.today("yyyy-mm-dd") %> */\n',
        report: 'gzip',
        sourceMap: 'build/moduler-<%= pkg.version %>.min.map',
        sourceMappingURL: 'moduler-<%= pkg.version %>.min.map',
        sourceMapPrefix: 1
      },
      build: {
        src: 'build/moduler-<%= pkg.version %>.js',
        dest: 'build/moduler-<%= pkg.version %>.min.js'
      }
    },
    
    compress: {
      main: {
        options: {
          archive: 'moduler-js-<%= pkg.version %>.zip'
        },
        files: [
          { cwd: 'build', src: '**', expand: true }
        ]
      }
    },
        
    qunit: {
      all: ['tests/tests.html']
    }
    
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-compress');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-bump');

  // Default task(s).
  grunt.registerTask('default', ['jshint', 'qunit', 'clean', 'copy', 'uglify', 'compress']);
};
