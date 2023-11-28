var app = angular.module("my-app", ["ngRoute"]);
var url = "https://crudcrud.com/api/e14459a373444451a893f12a2f551bc5";

app.config(function ($routeProvider, $locationProvider) {
  $routeProvider
    .when("/", {
      templateUrl: "./pages/home.html",
      controller: "HomeController",
    })
    .when("/about", {
      templateUrl: "./pages/about.html",
    })
    .when("/addItem", {
      templateUrl: "./pages/addItem.html",
      controller: "addItemController",
    })
    .otherwise({
      templateUrl: "./pages/404.html",
    });

  $locationProvider.hashPrefix("!");
});

app.service("itemsService", function () {
  this.items = [];
  this.itemToUpdate = "";
});

app.controller(
  "HomeController",
  function ($scope, $http, $location, itemsService, $timeout) {
    $scope.loading = true;

    const loadItemsFromApi = async () => {
      try {
        const response = await $http.get(`${url}/items`);
        $scope.$apply(() => {
          itemsService.items = [];
          for (let i = 0; i < response.data.length; i++) {
            itemsService.items.push({
              id: response.data[i]._id,
              name: response.data[i].name,
            });
          }
          $scope.items = itemsService.items.map((item) => item);
          $scope.loading = false;
        });
      } catch (error) {
        console.error(error);
        $scope.loading = false;
      }
    };

    loadItemsFromApi();

    $scope.deleteFunc = async (id) => {
      try {
        const res = await $http.delete(`${url}/items/${id}`);

        $scope.$apply(() => {
          $scope.items = $scope.items.filter((item) => item.id !== id);
        });
      } catch (error) {
        console.log(error);
      }
    };

    $scope.editFunc = (id) => {
      itemsService.itemToUpdate = $scope.items.find(
        (item) => item.id === id
      ).name;
      $location.path("/addItem");
      $scope.deleteFunc(id);
    };
  }
);

app.controller("appController", function ($scope, $location) {
  $scope.isActive = function (path) {
    return $location.path() === path;
  };
});

app.controller(
  "addItemController",
  function ($scope, $http, itemsService, $location) {
    if (itemsService.itemToUpdate !== "") {
      $scope.newItem = itemsService.itemToUpdate;
    }

    $scope.addItem = async () => {
      try {
        const result = await $http.post(`${url}/items`, {
          name: $scope.newItem,
        });

        $scope.$apply(() => {
          itemsService.items.push({
            id: result.data._id,
            name: $scope.newItem,
          });
          $scope.newItem = "";
          itemsService.itemToUpdate = "";
          $location.path("/");
        });
      } catch (error) {
        console.log(error);
      }
    };
  }
);
