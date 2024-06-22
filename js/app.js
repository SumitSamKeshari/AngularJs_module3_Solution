(function () {
'use strict';

angular.module('NarrowItDownApp', [])
.controller('NarrowItDownController', NarrowItDownController )
.service('MenuSearchService', MenuSearchService)
.constant('ApiBasePath', " https://coursera-jhu-default-rtdb.firebaseio.com")
.directive('foundItems', FoundItemsDirective);

//DIRECTIVES ***********************************************************
function FoundItemsDirective() {
  var ddo = {
    templateUrl: 'foundItems.html',
    scope: {
      items: '<',
      onRemove: '&'
    },
    controller: FoundItemsDirectiveController,
    controllerAs: 'list',
    bindToController: true
  };

  return ddo;
}

function FoundItemsDirectiveController() {
  var list = this;

  //Returns true if list is empty
  list.checkFoundList = function () {
	return typeof list.items !== 'undefined' && list.items.length === 0
  };
}


//CONTROLLERS ***********************************************************
NarrowItDownController.$inject = ['MenuSearchService'];
function NarrowItDownController(MenuSearchService) {
  var narrowItCtrl = this;

  narrowItCtrl.searchTerm = '';
  narrowItCtrl.found = [];

  //Search action
  narrowItCtrl.search = function () {
    narrowItCtrl.found = [];
	//Search only when searchTerm is not empty
	if (narrowItCtrl.searchTerm.trim() != "") {
		var promise = MenuSearchService.getMatchedMenuItems(narrowItCtrl.searchTerm);
		promise.then(function (response) {
		  narrowItCtrl.found = response;
      console.log(response);
		})
		.catch(function (error) {
		  console.log("Something went wrong: " + error);
      narrowItCtrl.search = "Nothing found 2";
		});
	} else {
		narrowItCtrl.found = [];
	}

  };

  //Remove action
  narrowItCtrl.removeItem = function (itemIndex) {
    this.lastRemoved = "Last item removed was " + narrowItCtrl.found[itemIndex].name;
	//console.log("lastRemoved: " + this.lastRemoved);
    narrowItCtrl.found.splice(itemIndex, 1);
  };

}


//SERVICES ***********************************************************
/**
* Service to retrieve menu items
*/
MenuSearchService.$inject = ['$http', 'ApiBasePath'];
function MenuSearchService($http, ApiBasePath) {
  var service = this;

  /**
  * Get list item that match to searchTerm
  */
  service.getMatchedMenuItems = function (searchTerm) {
	 var response =  $http({
      method: "GET",
      url: (ApiBasePath + "/menu_items.json")
    });
    return response.then(function (result) {
        var searchItems = [];
        var data = result.data;

        for (var category in data) {
            searchItems.push( data[category].menu_items.filter( item => item.description.toLowerCase().includes(searchTerm.toLowerCase()) )
            );
        }
        return searchItems.flat();
    });

  };
}

})();
