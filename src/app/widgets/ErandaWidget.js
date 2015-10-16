/**
 * Created by ErandaG on 10/12/2015.
 */


var ErandaWidgetModule = angular.module('adf.widget.ErandaWidget', ['kendo.directives' , 'adf.provider'])
    .config(function (dashboardProvider) {

        dashboardProvider
            .widget('ErandaWidget', {
                title: 'ErandaWidget',
                description: 'this is a widget',
                templateUrl: 'app/widgets/view.html',
                edit: {
                    templateUrl: 'app/widgets//edit.html'
                }
            });

    })
    .factory("ErandaWidgetFactory", [function () {

        var ErandaWidgetFactory = {};

        var collapsed = {
            columns: [],
            rows: []
        };

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
            var name = tuple.members[0].parentName;

            for (var idx = 0, length = collapsed.length; idx < length; idx++) {
                if (collapsed[idx] === name) {
                    console.log(name);
                    return true;
                }
            }

            return false;
        }

        //the main function that convert PivotDataSource data into understandable for the Chart widget format
        function convertData(dataSource, collapsed) {
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

            console.log("Result: " + result);

            return result;
        }

        function initColumnChart(data) {

            var chart = $("#erachart").data("kendoChart");

            if (!chart) {
                $("#erachart").kendoChart({
                    dataSource: {
                        data: data,
                        group: "row"
                    },
//                    filter: {
//                        field: "row", operator: "eq", value: 'Bikes'
//                    },
                    series: [
                        {
                            type: "column",
                            field: "measure",
                            name: "#= group.value # (category)",
                            categoryField: "column"
                        }
                    ],
                    legend: {
                        position: "bottom"
                    },
                    valueAxis: {
                        labels: {
                            format: "${0}"
                        }
                    },
                    tooltip: {
                        visible: true,
                        format: "N0",
                        template: "#= series.name #: #= value #"
                    },
                    dataBound: function (e) {
                        if (e.sender.options.categoryAxis) {
                            e.sender.options.categoryAxis.categories.sort()
                        }
                    }
                });
            } else {
                chart.dataSource.data(data);
            }
        }

        ErandaWidgetFactory.dataSource = new kendo.data.PivotDataSource({
            type: "xmla",
            columns: [
                { name: "[Date].[Calendar]", expand: true }
            ],
            rows: [
                { name: "[Product].[Category]", expand: true }
            ],
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

        ErandaWidgetFactory.pivotGridOptions = {
            columnWidth: 200,
            filterable: true,
            height: 580,
            dataSource: ErandaWidgetFactory.dataSource,
            //gather the collapsed members
            collapseMember: function (e) {
                var axis = collapsed[e.axis];
                var path = e.path[0];

                if (axis.indexOf(path) === -1) {
                    axis.push(path);
                }
            },
            //gather the expanded members
            expandMember: function (e) {
                var axis = collapsed[e.axis];
                var index = axis.indexOf(e.path[0]);

                if (index !== -1) {
                    axis.splice(index, 1);
                }
            },
            dataBound: function () {
                //create/bind the chart widget
                initColumnChart(convertData(ErandaWidgetFactory.dataSource, collapsed));
            }
        };

        return{
            initWidget: function () {
                console.log('Widget Inititlaization');
                return ErandaWidgetFactory.pivotGridOptions;
            }
        }
    }])
    .controller('ErandaWidgetCtrl', ["$scope", "ErandaWidgetFactory",
        function ($scope, ErandaWidgetFactory) {
            $scope.dataStore = ErandaWidgetFactory.initWidget();


        }]);