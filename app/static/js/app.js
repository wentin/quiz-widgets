/* route handling file */
var QuizApp = angular.module('QuizApp', ['ngRoute'])

	.config(function($locationProvider) {
		
		$locationProvider.html5Mode(true);

	})

	.config(function($provide) {
	
		// register services 
		$provide.factory('HTTPService', HTTPService);
		$provide.factory('UIService', UIService);
		$provide.factory('FormService', FormService);

	});
		