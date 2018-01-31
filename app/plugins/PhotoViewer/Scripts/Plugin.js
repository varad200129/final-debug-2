/*!
 * This file is part of App Builder
 * For licenses information see App Builder help
 * ©2018 App Builder - https://www.davidesperalta.com
 */

window.App.Plugins.PhotoViewer = function() {

  var showMessage = function(msg) {
    alert(msg);
  };

  /* Public interface: actions exposed by the plugin */

  return {

    PhotoViewerOpen: function(url) {
      if (window.App.Cordova) {
        window.open(url, '_system');  
      } else {
        PhotoViewer.show(url, '', {share:false});
      }
    },

    /* Optional plugin's events (called by App Builder) */

    PluginSetupEvent: function() {},

    PluginAppReadyEvent: function() {},

    PluginDocumentReadyEvent: function() {}
  };
};
