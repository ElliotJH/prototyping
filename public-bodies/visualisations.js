var magnitude = function() {
    return {
	billion:  {value: 1e9, suffix:"b"},
        million:  {value: 1e6, suffix:"m"},
        thousand: {value: 1e3, suffix:"k"},
	unit:     {value: 1, suffix:""},
	format : function(number) {
	    return this._magnitudeFormat(number, this._magnitudeFor(number));
	},
	_magnitudeFor: function (value) {
            if (value >= 1e9) return this.billion;
            if (value >= 1e6) return this.million;
            if (value >= 1e3) return this.thousand;
            return this.unit;
	},
	_magnitudeFormat: function (value, magnitude) {
            return (parseFloat(value.toPrecision(3)) / magnitude.value).toString() + magnitude.suffix;
	}
    }
}();

var vis = function() {


    function deptColor(d) {
	dept = d.replace(",", "");
	if(dept == "Treasury") {
	    return "#af292e";
	}
	else if(dept == "Cabinet Office") {
	    return  "#0078ba";
	}
	else if(dept == "Department for Education") {
	    return  "#003a69";
	}
	else if(dept == "Department for Transport") {
	    return  "#006c56";
	}
	else if(dept == "Home Office") {
	    return  "#9325b2";
	}
	else if(dept == "Department of Health") {
	    return  "#00ad93";
	}
	else if(dept == "Ministry of Justice") {
	    return  "#231f20";
	}
	else if(dept == "Ministry of Defence") {
	    return  "#4d2942";
	}
	else if(dept == "Foreign and Commonwealth Office") {
	    return  "#003e74";
	}
	else if(dept == "Department for Communities and Local Government") {
	    return  "#00857e";
	}
	else if(dept == "Department for Energy and Climate Change") {
	    return  "#009ddb";
	}
	else if(dept == "Department of Energy and Climate Change") {
	    return  "#009ddb";
	}
	else if(dept == "Department for Culture Media and Sport") {
	    return  "#d40072";
	}
	else if(dept == "Department for Environment Food and Rural Affairs") {
	    return  "#898700";
	}
	else if(dept == "Department for Work and Pensions") {
	    return  "#00beb7";
	}
	else if(dept == "Department for Business Innovation and Skills") {
	    return  "#003479";
	}
	else if(dept == "Department for International Development") {
	    return  "#002878";
	}
	else if(dept == "Government Equalities Office") {
	    return  "#9325b2";
	}
	else if(dept == "Attorney General's Office") {
	    return  "#9f1888";
	}
	else if(dept == "Scotland Office") {
	    return  "#002663";
	}
	else if(dept == "Wales Office") {
	    return  "#a33038";
	}
	else {
	    return "#0076c0";//Some departments we might not know a colour for ("Northern Ireland Office"), so use HM Government (because that isn't incorrect)
	}
    }

    function displayDepartment(d) {
	var infobox = d3.select("#infobox");
	infobox.selectAll("h1")
	    .data([d])
	    .enter()
	    .append("h1");

	infobox.selectAll("h1").data([d]).text(d.name);
    }
    function displayNDPB(d) {
	displayDepartment(d);
    }

    function displayInformation(d) {
	if(d.depth == 1) {
	    displayDepartment(d);
	}
	else if (d.depth == 2) {
	    displayNDPB(d);
	}
    }

    function fillDeptColor(alt) {
	return function(d) {
	    if(d.depth == 0) {
		return "none";
	    }
	    else if(d.depth == 1) {
		return deptColor(d.name)
	    } else {
		return alt;
	    }
	}
    }

    function fillColor(d) {
	if(d.depth == 1) {
	    return deptColor(d.name);
	}
	else {
	    return "white";
	}
    }

    function fillOpacity(d) {
	if(d.depth < 2) {
	    return "1"
	}
	else {
	    return "0.7"
	}
    }

    var renderWordCloud = function() {
	var area = {x: 1024, y: 1024};
	$.getJSON("wordcloud.json", {}, function(publicbodies) {
	    var scale = d3.scale.linear();
	    var quantize = d3.scale.quantize().domain([publicbodies[0][1], 1]).range(["purple", "mauve", "fuscia", "pink", "baby-pink", "red", "orange", "yellow", "green", "turqoise"]);
	    scale.domain([1, publicbodies[0][1]]);
	    scale.range([10, 60]);
	    var treemap = d3.layout.treemap();

	    d3.layout.cloud().size([area.x, area.y])
		.words(publicbodies.map(function(d) { return {text: d[0],
		 					      size: scale(d[1]) + Math.random() * 10,
		 					      color: quantize(d[1])};}))
		.fontSize(function(d) {return d.size})
		.rotate(function() { return (Math.random()) * 90 - 45; })
		.font("sans-serif")
		.padding(3)
		.on("end", function(words) {
		    d3.select("#wordcloud").append("svg")
			.attr("width", area.x)
			.attr("height", area.y)
			.append("g")
			.attr("transform", "translate(" + area.x/2 + ", " + area.y/2 + ")")
			.selectAll("text")
			.data(words).enter().append("text")
			.style("font-size", function(d) { return d.size})
			.style("fill", function(d) { return d.color})
			.style("font-family", "sans-serif")
			.attr("text-anchor", "middle")
			.text(function(d) { return d.text;})
			.attr("transform", function(d) {
          		    return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
        		});
		})
		.start();
	});
    };

    var renderTotalExpenditure = function() {
	var svg = d3.select("body").append("svg");
	var pack = d3.layout.treemap().size([1900, 900]).padding(0);

	d3.json("totalexpenditure.json", function(err, json) {
	    var quants = d3.scale.quantize().domain([0, json.length]).range(["red", "green", "blue"]);
	    var data = {children: json};
	    var nodes = pack(data);
	    svg.selectAll("rect").data(nodes)
		.enter()
		.append("rect")
		.attr("x", function(d) { return d.x })
    		.attr("y", function(d) { return d.y })
		.attr("width", function(d) { return d.dx })
    		.attr("height", function(d) { return d.dy })
		.style("stroke", "black")
		.style("fill", function(d, i) { return "steelblue" });
	    svg.selectAll("text").data(nodes)
		.enter()
		.append("text").text(function(d) { if(d.depth != 0) { return "£" + Math.floor(d.value / 1000000) + " million" }})
		.style("stroke", "black")
		.attr("x", function(d) { return d.x + (d.dx / 2)})
    		.attr("y", function(d) { return d.y + (d.dy / 2) })
		.attr("width", function(d) { return d.dx })
		.attr("font-size", "12px")
		.attr("text-anchor", "middle");
	});
    };

    var renderGroupedBubble = function() {
	var svg = d3.select("body").append("svg");
	var pack = d3.layout.pack().size([1000, 700]).padding(0);
	displayDepartment("None");

	d3.json("groupedbubble.json", function(err, json) {
	    var data = {children: json};
	    nodes = pack(data);

	    svg.selectAll("circle").data(nodes)
		.enter()
		.append("circle")
		.attr("r", function(d) { return d.r } )
		.attr("cx", function(d) { return d.x } )
	    	.attr("cy", function(d) { return d.y } )
		.style("stroke", function(d) { if (d.depth > 0) { return "black"; } else { return "none"; }})
		.style("fill", fillColor)
		.style("opacity", fillOpacity)
		.on("mouseover", displayInformation);

	});
    }

    var renderPartPie = function() {

	function minDepthChecker(min, arg, other) {
	    return function(d) {
		if(d.depth > min) {
		    return arg;
		} else {
		    return other;
		}
	    }
	}

	function depthChecker(arg, other) {
	    return minDepthChecker(0, arg, other)
	}


	function sumChild(root) {
	    var sum = 0;
	    for(var i = 0; i < root.length; i++) {
		sum += root[i].value;
	    }
	    return sum;
	}

	function maxChild(dept) {
	    var max = 0;
	    for(var i = 0; i < dept.children.length; i++) {
		if(max < dept.children[i].value) {
		    max = dept.children[i].value;
		}
	    }
	    return max;
	}

	var svg = d3.select("#totalexpenditure").append("svg");
	var partition = d3.layout.partition([800, 800]).size([2 * Math.PI, 140000]);

	var sqrt = Math.sqrt;
	var translate = "translate(300, 390)";
	d3.json("http://publicbodiesrails.dev/visualisations/groupedbubble.json", function(err, json) {
	    var nodes = partition({children: json});
	    svg.selectAll("path")
		.data(nodes)
		.enter()
		.append("path")
		.attr("d",
		      d3.svg.arc()
		      .innerRadius(function(d) {
			  return sqrt(d.y)
		      })
		      .outerRadius(function(d) {
			  return sqrt(d.y + d.dy);
		      })
		      .startAngle(function(d) {
			  return (d.x);
		      })
		      .endAngle(function(d) {
			  return (d.x + d.dx)
		      })
		     )
	    	.attr("transform", translate)
		.style("stroke", "white")
		.style("fill", function(d) {
		    if(d.depth > 0) {
			if(d.depth == 1) {
			    return deptColor(d.name);
			} else {
			    var dept = d.parent;
			    col = chroma.color(deptColor(dept.name));
			    var scale = chroma.scale([col.brighten().brighten(), col.brighten()]).domain([0, maxChild(dept)])
			    return scale(d.value);
			}
		    }
		    return "white";
		})
		.on("mouseover", function(d) {
		    if(d.depth == 0) {
			d3.select("#departmentName").text("All Departments");
			d3.select("#expenditure").text(magnitude.format(sumChild(nodes)))
		    } else {
			d3.select("#departmentName").text(d.name);
			d3.select("#expenditure").text(magnitude.format(d.value));
		    }
		})
		.filter(function(d) { if(d.depth == 0) { return true; } else { return false; }})
		.append("text").text("Depth 0");

	    svg.append("text")
	    	.attr("transform", translate)
		.text(magnitude.format(sumChild(nodes)))
		.style("font-size", "30px")
	    	.style("text-anchor", "middle")
	    	.attr("id", "expenditure");
	    svg.append("text")
	    	.attr("transform", translate)
		.text("All Departments")
		.style("font-size", "30px")
	    	.style("text-anchor", "middle")
		.attr("id", "departmentName");

	})
    }

    var renderPartitionLayout = function() {
	var svg = d3.select("body").append("svg");
	var pack = d3.layout.partition().size([1400, 350])
	displayDepartment("None");

	d3.json("groupedbubble.json", function(err, json) {
	    var data = {children: json};
	    nodes = pack(data);

	    svg.selectAll("rect").data(nodes)
		.enter()
		.append("rect")
	    	.attr("x", function(d) { return d.x } )
		.attr("y", function(d) { return d.y } )
		.attr("width", function(d) { return d.dx } )
	    	.attr("height", function(d) { return d.dy } )
		.style("stroke", function(d) { if (d.depth > 0) { return "black"; } else { return "none"; }})
		.style("fill", fillColor)
		.style("opacity", fillOpacity)
		.on("mouseover", displayInformation);

	});
    }

    return {
	totalexpenditure : renderPartPie,//renderTotalExpenditure,
	wordcloud : renderWordCloud,
	groupedbubble:renderGroupedBubble,
	partition: renderPartitionLayout,
	partpie: renderPartPie
    };
}();
$(function() {
    if($("#wordcloud").length > 0) {
	vis.wordcloud();
    }
    if($("#totalexpenditure").length > 0) {
	vis.totalexpenditure();
    }
    if($("#groupedbubble").length > 0) {
	vis.groupedbubble();
    }
    if($("#partition").length > 0) {
	vis.partition();
    }
})
