(function () {
'use strict';

angular.module('NarrowItDownApp', [])
.controller('NarrowItDownController', NarrowItDownController )
.service('MenuSearchService', MenuSearchService)
.constant('ApiBasePath', " https://coursera-jhu-default-rtdb.firebaseio.com/")
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
  
  //Search action
  narrowItCtrl.narrowItDown = function (searchTerm) {
	//Search only when searchTerm is not empty
	if (searchTerm) {
		var promise = MenuSearchService.getMatchedMenuItems(searchTerm);
		promise.then(function (response) {
		  narrowItCtrl.found = response;
		})
		.catch(function (error) {
		  console.log(error);
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
	return $http({
      method: "GET",
      url: (ApiBasePath + "/menu_items.json")
    }).then(function (response) {
		//Filtering the response items by searchTerm
		var foundItems = [];
		var menuItemsLength = response.data.menu_items.length;
		//console.log("menuItemsLength: " + menuItemsLength);
		for (var i = 0; i < menuItemsLength; i++) {
			var item = response.data.menu_items[i];
			if (item.description.indexOf(searchTerm) !== -1) {
				//console.log("matched: " + item.description + " == " + searchTerm);
				foundItems.push(item);
			}
		};
		return foundItems;
    });
  };
}

})();
