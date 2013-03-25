var _ = require("underscore")
  , helper_utils = require("punch").Utils.Helper
  , blog_content_handler = require("punch-blog-content-handler")
  , all_posts = []
  , last_modified = null;

// TODO: This code is duplicated from punch-blog-content-handler.
// Consider moving it to its own helper.
var match_patterns = function(basepath, patterns) {
  if (Array.isArray(patterns)) {
    return _.any(patterns, function(pattern) {
      return basepath.match(pattern) != null;
    });
  } else {
    // assume a single pattern given and match directly
    return basepath.match(patterns);
  }
};

var fetch_all_posts = function(callback) {
  //reset posts list
  blog_content_handler.allPosts = {};

  blog_content_handler.getAllPosts(function(err, posts_obj, posts_last_modified) {
    if (!err) {
      all_posts = _.values(posts_obj);
      last_modified = posts_last_modified;
    }

    return callback();
  });
}

var tag_helpers = {

  years: function() {
    return _.keys(blog_content_handler.postDates).reverse();
  },

  top_tags: function() {
    var tag_counts = blog_content_handler.tagCounts;
    return _.sortBy(_.keys(tag_counts), function(tag) {
      return tag_counts[tag];
    }).reverse();
  }

};

module.exports = {

  directAccess: function() {
    return {
      "block_helpers": {},
      "tag_helpers": {},
      "options": {}
    };
  },

  get: function(basepath, file_extension, options, callback) {
    var self = this;

    var archive_url_regexs = _.map(blog_content_handler.archiveUrls, function(url) {
      return new RegExp("^" + url.pattern + "\\/index$", "g");
    });

    if (match_patterns(basepath, archive_url_regexs)) {
      fetch_all_posts(function() {
        return callback(null, {
          "tag": tag_helpers
        }, {}, last_modified);
      });
    } else {
      return callback(null, {}, {}, null);
    }
  }

}