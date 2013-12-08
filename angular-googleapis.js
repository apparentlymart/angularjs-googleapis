
(function (angular, window) {

     var app = angular.module('googleapis', ['ng']);

     app.provider(
         'google',
         function () {
             var googleProvider = {};

             var loaderPromise;

             var developerKey = null;
             var loaderScriptUrl = 'https://www.google.com/jsapi?callback=angularJsGoogleApiLoaderCallback';

             googleProvider.setDeveloperKey = function (key) {
                 developerKey = key;
             };

             googleProvider.$get = function ($q) {
                 if (! window.google) {
                     window.google = {};
                 }
                 var google = window.google;

                 function wrapLoader(innerLoader) {
                     return function (moduleName, moduleVersion, optionalSettings) {
                         var defer = $q.defer();
                         optionalSettings = optionalSettings || {};
                         var originalCallback = optionalSettings.callback || function () {};
                         optionalSettings.callback = optionalSettings.callback || function () {
                             originalCallback();
                             defer.resolve(window.google[moduleName]);
                         };
                         innerLoader(moduleName, moduleVersion, optionalSettings);
                         return defer.promise;
                     };
                 }

                 function loadLoader() {
                     if (loaderPromise) {
                         return loaderPromise;
                     }

                     var defer = $q.defer();
                     loaderPromise = defer.promise;

                     window.angularJsGoogleApiLoaderCallback = function () {
                         delete window.angularJsGoogleApiLoaderCallback;
                         // re-wrap the actual loader in our promise-aware one.
                         var defaultLoad = window.google.load;
                         window.google.load = wrapLoader(window.google.load);
                         defer.resolve(window.google);
                     };
                     var scriptElem = document.createElement('script');
                     var scriptUrl = loaderScriptUrl;
                     if (developerKey) {
                         scriptUrl = scriptUrl + "&key=" + encodeURIComponent(developerKey);
                     }
                     scriptElem.src = scriptUrl;
                     var existingScriptElem = document.getElementsByTagName('script')[0];
                     existingScriptElem.parentElement.insertBefore(scriptElem, existingScriptElem);

                     return loaderPromise;
                 }

                 // We install a stub google.load that will load the real loader on the first call.
                 // Once we've loaded the real loader it'll overwrite this function.
                 if (! google.load) {
                     google.load = wrapLoader(
                         function (moduleName, moduleVersion, optionalSettings) {
                             loadLoader().then(
                                 function (google) {
                                     google.load(moduleName, moduleVersion, optionalSettings);
                                 }
                             );
                         }
                     );
                     google.load = function (moduleName, moduleVersion, optionalSettings) {
                         var defer = $q.defer();
                         optionalSettings = optionalSettings || {};
                         optionalSettings.callback = optionalSettings.callback || function () {
                             defer.resolve();
                         };
                         loadLoader().then(
                             function (google) {
                                 google.load(moduleName, moduleVersion, optionalSettings);
                             }
                         );
                         return defer.promise;
                     };
                 }

                 google.getDeveloperKey = function () {
                     return developerKey;
                 };

                 return google;
             };

             return googleProvider;
         }
     );

})(angular, window);
