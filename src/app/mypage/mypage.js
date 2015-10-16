'use strict';

/**
 * @ngdoc function
 * @name mypage.controller:mypageCtrl
 * @description
 * # mypageCtrl
 * Controller of the mypage
 */

angular
.module('mypage',["kendo.directives" ])
    .config(function($routeProvider){
        $routeProvider
            .when('/mypage', {
                templateUrl: 'app/mypage/mypage.html',
                controller: 'mypageCtrl'
            });
})
.controller('mypageCtrl', function mypageCtrl($scope) {

        var collapsed = {
            columns: [],
            rows: []
        };
        $scope.filtername = "CY 2007";

        var data = new kendo.data.DataSource({
            data: [
                { text: "Foo", id: 1 },
                { text: "Bar", id: 2 },
                { text: "Baz", id: 3 }
            ]
        });

        $scope.productsDataSource = {
            type: "odata",
            serverFiltering: true,
            transport: {
                read: {
                    url: "//demos.telerik.com/kendo-ui/service/Northwind.svc/Products"
                }
            }
        };
        $scope.handleChange = function(data, dataItem, columns) {
            $scope.data = data;
            $scope.columns = columns;
            $scope.dataItem = dataItem;
        };

        $scope.textUp = "Increment";
        $scope.textDown = "Decrement";

        $scope.gridOptions = {
            dataSource: data,
            selectable: "cell",
            columns: [
                { field: "text", title: "Some Text" },
                { field: "id", title: "Id" }
            ]
        };

        $scope.dataSource = new kendo.data.PivotDataSource({
            type: "xmla",
//            columns: [{ name: "[Date].[Calendar]" }],
//            rows: [{ name: "[Product].[Category]" }],
            measures: ["[Measures].[Internet Sales Amount]"],
            transport: {
                connection: {
                    catalog: "Adventure Works DW 2008R2",
                    cube: "Adventure Works"
                },
                read: "//demos.telerik.com/olap/msmdpump.dll"
            },
            schema: {
                type: "xmla"
            },
            error: function (e) {
                alert("error: " + kendo.stringify(e.errors[0]));
            }
        });
        var pivotGridColumnDirty = false;
        var pivotGridRowDirty = false;
        var prev = {};
        var prevRows = {};
        $scope.pivotGridOptions = {
            columnWidth: 200,
            filterable: true,
            height: 580,
            dataSource: $scope.dataSource,

            //gather the collapsed members
            collapseMember: function(e) {
                var axis = collapsed[e.axis];
                var path = e.path[0];

                if (axis.indexOf(path) === -1) {
                    axis.push(path);
                }
            },
            //gather the expanded members
            expandMember: function(e) {
                var axis = collapsed[e.axis];
                var index = axis.indexOf(e.path[0]);

                if (index !== -1) {
                    axis.splice(index, 1);
                }
            },
            dataBound: function() {
                //The following code checks if the pivot grid has changed
                //And expands the top level row or column if changed
                var columns = $scope.dataSource.columns();
                var rows = $scope.dataSource.rows();
                if((prev !== columns))
                {
                    pivotGridColumnDirty  = false;
                }
                if((prevRows !== rows))
                {
                    pivotGridRowDirty  = false;
                }
                if((!pivotGridColumnDirty) && (columns.length> 0)) {
                    prev = columns;
                    prevRows = rows;
                    this.dataSource.expandColumn(columns);

                    pivotGridColumnDirty  = true;
                }
                if((!pivotGridRowDirty) && (rows.length>0))
                {
                    prevRows = rows;
                    prev = columns;
                    this.dataSource.expandRow(rows);
                    pivotGridRowDirty = true;
                }

                //create/bind the chart widget
                initColumnChart(convertData($scope.dataSource, collapsed));
            }
        };



$scope.pie = function(val){
    initPieChart(val);
}


        function flattenTree(tuples) {
            tuples = tuples.slice();
            var result = [];
            var tuple = tuples.shift();
            var idx, length, spliceIndex, children, member;

            while (tuple) {
                //required for multiple measures
                if (tuple.dataIndex !== undefined) {
                    result.push(tuple);
                }

                spliceIndex = 0;
                for (idx = 0, length = tuple.members.length; idx < length; idx++) {
                    member = tuple.members[idx];
                    children = member.children;
                    if (member.measure) {
                        [].splice.apply(tuples, [0, 0].concat(children));
                    } else {
                        [].splice.apply(tuples, [spliceIndex, 0].concat(children));
                    }
                    spliceIndex += children.length;
                }

                tuple = tuples.shift();
            }

            return result;
        }

        //Check whether the tuple has been collapsed
        function isCollapsed(tuple, collapsed) {
            if( tuple.members.length>0) {
                var name = tuple.members[0].parentName;

                for (var idx = 0, length = collapsed.length; idx < length; idx++) {
                    if (collapsed[idx] === name) {
                        console.log(name);
                        return true;
                    }
                }

                return false;
            }
            return true;
        }

        //the main function that convert PivotDataSource data into understandable for the Chart widget format
        function convertData(dataSource, collapsed) {
            dataSource.schemaDimensions()
                .done(function(dimensions) {

                });

            var columnTuples = flattenTree(dataSource.axes().columns.tuples || [], collapsed.columns);

            var rowTuples = flattenTree(dataSource.axes().rows.tuples || [], collapsed.rows);

            var data = dataSource.data();

            var rowTuple, columnTuple;

            var idx = 0;
            var result = [];
            var columnsLength = columnTuples.length;

            for (var i = 0; i < rowTuples.length; i++) {
                rowTuple = rowTuples[i];

                if (!isCollapsed(rowTuple, collapsed.rows)) {
                    for (var j = 0; j < columnsLength; j++) {
                        columnTuple = columnTuples[j];

                        if (!isCollapsed(columnTuple, collapsed.columns)) {
                            if (idx > columnsLength && idx % columnsLength !== 0) {
                                result.push({
                                    measure: Number(data[idx].value),
                                    column: columnTuple.members[0].caption,
                                    row: rowTuple.members[0].caption
                                });
                            }
                        }
                        idx += 1;
                    }
                }
            }

            return result;
        }

        function initColumnChart(data) {

            var chart = $("#chart").data("kendoChart");

            if (!chart) {
                $("#chart").kendoChart({
                    dataSource: {
                        data: data,
                        group: "row"
                    },
//                    filter: {
//                        field: "row", operator: "eq", value: 'Bikes'
//                    },
                    series: [{
                        type: "column",
                        field: "measure",
                        name: "#= group.value # (category)",
                        categoryField: "column"
                    }],
                    legend: {
                        position: "bottom"
                    },
                    valueAxis: {
                        labels: {
                            format: "${0}"
                        }
                    },
                    dataBound: function(e) {
                        if (e.sender.options.categoryAxis.categories) {
                            e.sender.options.categoryAxis.categories.sort()
                        }
                    }
                });
            } else {
                chart.dataSource.data(data);
            }
        }

        function initPieChart(value) {
            var data = convertData($scope.dataSource, collapsed);
            var chart = $("#piechart").data("kendoChart");

            if (!chart) {
                $("#piechart").kendoChart({
                    dataSource: {
                        data: data,
                        filter: {
                            field: "column", operator: "eq", value: value
                        }
//                        group: "row"
                    },
                    series: [{
                        type: "pie",
                        field: "measure",
                        categoryField: "row"
                    }],
                    title: {
                        text: value
                    },
                    legend: {
                        position: "bottom"
                    },
//                    valueAxis: {
//                        labels: {
//                            format: "${0}"
//                        }
//                    },
                    tooltip: {
                        visible: true,
                        format: "N0",
                        template: "#= category # - #= kendo.format('{0:P}', percentage)#"
                    }
//                    dataBound: function(e) {
//                        if (e.sender.options.categoryAxis) {
//                            e.sender.options.categoryAxis.categories.sort()
//                        }
//                    }
                });
            } else {
                chart.dataSource.data(data);
            }
        }
});
