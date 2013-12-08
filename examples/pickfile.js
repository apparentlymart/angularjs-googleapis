
(function (angular, window) {

     var app = angular.module('pickfile', ['googleapis']);

     app.config(
         function (googleProvider) {
             googleProvider.setDeveloperKey(
                 // this developer key belongs to this set of examples.
                 // for a production app you should register your own.
                 'AIzaSyAxKjjiXgQf76DSA1xmTeNK1XLKyDBcrxY'
             );
         }
     );

     app.factory(
         'googlePicker',
         function (google, $q) {
             return {
                 newPickerBuilder: function () {
                     var defer = $q.defer();
                     google.load('picker', '1').then(
                         function () {
                             defer.resolve(
                                 new google.picker.PickerBuilder().setDeveloperKey(
                                     google.getDeveloperKey()
                                 )
                             );
                         }
                     );
                     return defer.promise;
                 }
             };
         }
     );

     app.controller(
         'pickerExample',
         function ($scope, googlePicker) {
             $scope.pickedData = null;
             $scope.pickSomething = function () {
                 googlePicker.newPickerBuilder().then(
                     function (builder) {
                         var picker = builder.
                             addView(google.picker.ViewId.IMAGE_SEARCH).
                             addView(google.picker.ViewId.MAPS).
                             addView(google.picker.ViewId.PHOTOS).
                             addView(google.picker.ViewId.YOUTUBE).
                             setCallback(
                                 function (data) {
                                     $scope.$apply(
                                         function () {
                                             $scope.pickedData = data;
                                         }
                                     );
                                 }
                             ).build();
                         picker.setVisible(true);
                     }
                 );
             };
         }
     );

})(angular, window);
