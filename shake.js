var graphData = [];
var sensorNames = ['EHZ', 'ENZ', 'ENN', 'ENE'];
var sensorSelect = "EHZ";
var ctrlVisible = false;
var isActive = true; // Play, Pause

sensorNames.forEach((sensorName) => {
	graphData[sensorName]=[];
	graphData[sensorName]['fast']=[];
	graphData[sensorName]['q1']=[];
	graphData[sensorName]['q2']=[];
	graphData[sensorName]['q3']=[];
	graphData[sensorName]['q4']=[];
});

function toggleActive(onOff){
	if(onOff == 'on'){
		shakedat = new WebSocket("ws://WEBSOCKETIPADDRESS:WEBSOCKETPORT");
		shakedat.onmessage = (event) => {shakemessage(event)};
		document.getElementById("togglePause").innerHTML = "&#10073;&#10073;";
		document.getElementById("togglePause").onclick = function(){toggleActive('off')};
	}else{
		shakedat.close();
		document.getElementById("togglePause").innerHTML = "&#9658";
		document.getElementById("togglePause").onclick = function(){toggleActive('on')};
	}
}

function toggleCtrl(){
	if(ctrlVisible === false){
		document.getElementById("ctrlpanel").style.display="";
		ctrlVisible = true;
	}else{
		document.getElementById("ctrlpanel").style.display="none";
		ctrlVisible = false;
	}
}

function setSensor(sensor){
	sensorSelect=sensor;
	document.getElementById("setEHZ").className='setSensor';
	document.getElementById("setENZ").className='setSensor';
	document.getElementById("setENN").className='setSensor';
	document.getElementById("setENE").className='setSensor';
	// set y domains
	if(sensor == 'EHZ'){
		document.getElementById("setEHZ").className='setSensor selectedOption';
		y1fast.domain([0,10000]);
		g1fast.select(".leftAxis").call(y1fastAxis);
		yq1.domain([0,10000]);
		histq1.select(".leftAxis").call(yq1Axis);
		yq2.domain([0,10000]);
		histq2.select(".leftAxis").call(yq2Axis);
		yq3.domain([0,10000]);
		histq3.select(".leftAxis").call(yq3Axis);
		yq4.domain([0,10000]);
		histq4.select(".leftAxis").call(yq4Axis);
	}else if(sensor == 'ENE'){
		document.getElementById("setENE").className='setSensor selectedOption';
		y1fast.domain([-335000,-304000]);
		g1fast.select(".leftAxis").call(y1fastAxis);
		yq1.domain([-335000,-304000]);
		histq1.select(".leftAxis").call(yq1Axis);
		yq2.domain([-335000,-304000]);
		histq2.select(".leftAxis").call(yq2Axis);
		yq3.domain([-335000,-304000]);
		histq3.select(".leftAxis").call(yq3Axis);
		yq4.domain([-335000,-304000]);
		histq4.select(".leftAxis").call(yq4Axis);
	}else if(sensor == 'ENN'){
		document.getElementById("setENN").className='setSensor selectedOption';
		y1fast.domain([-367000,-340000]);
		g1fast.select(".leftAxis").call(y1fastAxis);
		yq1.domain([-367000,-340000]);
		histq1.select(".leftAxis").call(yq1Axis);
		yq2.domain([-367000,-340000]);
		histq2.select(".leftAxis").call(yq2Axis);
		yq3.domain([-367000,-340000]);
		histq3.select(".leftAxis").call(yq3Axis);
		yq4.domain([-367000,-340000]);
		histq4.select(".leftAxis").call(yq4Axis);
	}else if(sensor == 'ENZ'){
		document.getElementById("setENZ").className='setSensor selectedOption';
		y1fast.domain([3704000,3762000]);
		g1fast.select(".leftAxis").call(y1fastAxis);
		yq1.domain([3704000,3762000]);
		histq1.select(".leftAxis").call(yq1Axis);
		yq2.domain([3704000,3762000]);
		histq2.select(".leftAxis").call(yq2Axis);
		yq3.domain([3704000,3762000]);
		histq3.select(".leftAxis").call(yq3Axis);
		yq4.domain([3704000,3762000]);
		histq4.select(".leftAxis").call(yq4Axis);
	}
	// reload graphs
	path1fast.datum(graphData[sensorSelect]['fast']);
	pathq1.datum(graphData[sensorSelect]["q1"]);
	pathq1.attr("d", lineq1).transition();
	pathq2.datum(graphData[sensorSelect]["q2"]);
	pathq2.attr("d", lineq2).transition();
	pathq3.datum(graphData[sensorSelect]["q3"]);
	pathq3.attr("d", lineq3).transition();
	pathq4.datum(graphData[sensorSelect]["q4"]);
	pathq4.attr("d", lineq4).transition();

}

function toggleDarkMode(mode){
	if(mode == 'dark'){
		document.body.style.background="#493e3e"
		document.getElementById("setLight").className='setSensor';
		document.getElementById("setDark").className='setSensor selectedOption';
	}else{
		document.body.style.background="#eadede"
		document.getElementById("setLight").className='setSensor selectedOption';
		document.getElementById("setDark").className='setSensor';
	}
}

//60 second stream
var g1fast = d3.select("#graph1fast").append("svg")
	.attr("width", 1000)
	.attr("height", 370);
var x1fast = d3.scaleTime()
	.range([0, 1000])
	.domain([new Date() - 60000, new Date()]); // show the last 60 seconds of data
var y1fast = d3.scaleLinear()
	.range([100, 250])
	.domain([0, 36000]); // assume data is in the range of 0 to 100
var x1fastAxis = d3.axisBottom(x1fast);
var y1fastAxis = d3.axisLeft(y1fast);
var line1fast = d3.line()
	.x(function(d) { return x1fast(d.time); })
	.y(function(d) { return y1fast(d.value); });
var path1fast = g1fast.append("path")
	.datum(graphData[sensorSelect]['fast'])
	.attr("class", "line")
	.attr("d", line1fast)
	.attr("fill","none")
	.style("stroke", "#d22");
g1fast.append("g")
	.attr("class", "bottomAxis")
	.attr("transform", "translate(0, 300)")
	.call(x1fastAxis);
g1fast.append("g")
	.attr("class", "leftAxis")
	.call(y1fastAxis);

//6 minute static line 1
graphData[sensorSelect]["q1"] = [];
var histq1 = d3.select("#q1").append("svg")
	.attr("width", 1000)
	.attr("height", 370);
var xq1 = d3.scaleTime()
	.range([0, 1000])
	.domain([new Date() - 360000, new Date()]); // show the last 120 seconds of data
var yq1 = d3.scaleLinear()
	.range([350, 0])
	.domain([0, 36000]); // assume data is in the range of 0 to 100
var xq1Axis = d3.axisBottom(xq1);
var yq1Axis = d3.axisLeft(yq1);
var lineq1 = d3.line()
	.x(function(d) { return xq1(d.time); })
	.y(function(d) { return yq1(d.value); });
var pathq1 = histq1.append("path")
	.datum(graphData[sensorSelect]["q1"])
	.attr("class", "line")
	.attr("d", lineq1)
	.attr("fill","none")
	.style("stroke", "rgb(8, 26, 125)");
histq1.append("g")
	.attr("class", "bottomAxis")
	.attr("transform", "translate(0, 300)")
	.call(xq1Axis);
histq1.append("g")
	.attr("class", "leftAxis")
	.call(yq1Axis);

//6 minute static line 2
var histq2 = d3.select("#q2").append("svg")
	.attr("width", 1000)
	.attr("height", 370);
var xq2 = d3.scaleTime()
	.range([0, 1000])
	.domain([new Date() - 360000, new Date()]); // show the last 120 seconds of data
var yq2 = d3.scaleLinear()
	.range([350, 0])
	.domain([0, 36000]); // assume data is in the range of 0 to 100
var xq2Axis = d3.axisBottom(xq2);
var yq2Axis = d3.axisLeft(yq2);
var lineq2 = d3.line()
	.x(function(d) { return xq2(d.time); })
	.y(function(d) { return yq2(d.value); });
graphData[sensorSelect]["q2"] = [];
var pathq2 = histq2.append("path")
	.datum(graphData[sensorSelect]["q2"])
	.attr("class", "line")
	.attr("d", lineq2)
	.attr("fill","none")
	.style("stroke", "rgb(8, 26, 125)");
histq2.append("g")
	.attr("class", "bottomAxis")
	.attr("transform", "translate(0, 300)")
	.call(xq2Axis);
histq2.append("g")
	.attr("class", "leftAxis")
	.call(yq2Axis);

//6 minute static line 3
var histq3 = d3.select("#q3").append("svg")
	.attr("width", 1000)
	.attr("height", 370);
var xq3 = d3.scaleTime()
	.range([0, 1000])
	.domain([new Date() - 360000, new Date()]);
var yq3 = d3.scaleLinear()
	.range([350, 0])
	.domain([0, 36000]); // assume data is in the range of 0 to 100
var xq3Axis = d3.axisBottom(xq3);
var yq3Axis = d3.axisLeft(yq3);
var lineq3 = d3.line()
	.x(function(d) { return xq3(d.time); })
	.y(function(d) { return yq3(d.value); });
graphData[sensorSelect]["q3"] = [];
var dataq3 = [];
var pathq3 = histq3.append("path")
	.datum(graphData[sensorSelect]["q3"])
	.attr("class", "line")
	.attr("d", lineq3)
	.attr("fill","none")
	.style("stroke", "rgb(8, 26, 125)");
	//.style("stroke", "rgb(64, 14, 242)");
	
histq3.append("g")
	.attr("class", "bottomAxis")
	.attr("transform", "translate(0, 300)")
	.call(xq3Axis);
histq3.append("g")
	.attr("class", "leftAxis")
	.call(yq3Axis);

//6 minute static line 4
var histq4 = d3.select("#q4").append("svg")
	.attr("width", 1000)
	.attr("height", 370);
var xq4 = d3.scaleTime()
	.range([0, 1000])
	.domain([new Date() - 360000, new Date()]);
var yq4 = d3.scaleLinear()
	.range([350, 0])
	.domain([0, 36000]);
var xq4Axis = d3.axisBottom(xq4);
var yq4Axis = d3.axisLeft(yq4);
var lineq4 = d3.line()
	.x(function(d) { return xq4(d.time); })
	.y(function(d) { return yq4(d.value); });
graphData[sensorSelect]["q4"] = [];
var dataq4 = [];
var pathq4 = histq4.append("path")
	.datum(graphData[sensorSelect]["q4"])
	.attr("class", "line")
	.attr("d", lineq4)
	.attr("fill","none")
	.style("stroke", "rgb(8, 26, 125)");
histq4.append("g")
	.attr("class", "bottomAxis")
	.attr("transform", "translate(0, 300)")
	.call(xq4Axis);
histq4.append("g")
	.attr("class", "leftAxis")
	.call(yq4Axis);

var shakedat = new WebSocket("ws://WEBSOCKETIPADDRESS:WEBSOCKETPORT");
shakedat.onmessage = (event) => {shakemessage(event)};

function shakemessage(event) {

	var newD=JSON.parse(event.data);
	if(newD.msgType == 'tick'){
		var sensorName=newD.sensor;
		newD.values.forEach((datapoint) => {
			graph1fastupdate(sensorName,datapoint);
		});
	}else if(newD.msgType == 'lastMinute'){
		// loop though each sensor name
		sensorNames.forEach((sensorName) => {
			// clear out existing data
			// no idea why can't just set the array to []
			while(graphData[sensorName]['fast'].length > 0) {
				graphData[sensorName]['fast'].shift();
			}
			// fill sensorname[q] array with new data
			for(var d in newD[sensorName]){
				var tstamp = new Date(newD[sensorName][d].time);
				graphData[sensorName]['fast'].push({ time: tstamp, value: newD[sensorName][d].value });
			}
		});
	}else{
		// loop though each sensor name
		sensorNames.forEach((sensorName) => {
			// clear out existing data
			// no idea why can't just set the array to []
			while(graphData[sensorName][newD.q].length > 0) {
				graphData[sensorName][newD.q].shift();
			}
			// fill sensorname[q] array with new data
			for(var d in newD[sensorName]){
				var tstamp = new Date(newD[sensorName][d].time);
				graphData[sensorName][newD.q].push({ time: tstamp, value: newD[sensorName][d].value });
			}
		});
		
		// update q 1-4 graphs for sensorSelect
		var tstampStart = new Date(newD[sensorSelect][0].time)
		var tstampEnd = new Date(newD[sensorSelect][newD[sensorSelect].length-1].time)
		
		if(newD.q == 'q1'){
			xq1.domain([tstampStart, tstampEnd]);

			histq1.select(".bottomAxis")
				.transition()
				.duration(0)
				.call(xq1Axis);

			pathq1.attr("d", lineq1)
				.attr("transform", null)
				.transition()
				.attr("transform", "translate(" + xq1(tstampStart) + ")");
		}
		if(newD.q == 'q2'){
			xq2.domain([tstampStart, tstampEnd]);

			histq2.select(".bottomAxis")
				.transition()
				.duration(0)
				.call(xq2Axis);

			pathq2.attr("d", lineq2)
				.attr("transform", null)
				.transition();
		}
		if(newD.q == 'q3'){
			xq3.domain([tstampStart, tstampEnd]);

			histq3.select(".bottomAxis")
				.transition()
				.duration(0)
				.call(xq3Axis);

			pathq3.attr("d", lineq3)
				.attr("transform", null)
				.transition();
		}
		if(newD.q == 'q4'){
			xq4.domain([tstampStart, tstampEnd]);

			histq4.select(".bottomAxis")
				.transition()
				.duration(0)
				.call(xq4Axis);

			pathq4.attr("d", lineq4)
				.attr("transform", null)
				.transition();
		}
	}
}

var graph1fastupdate = function(sensorName,newData) {
	var now = new Date(newData.time);
	graphData[sensorName]['fast'].push({ time: now, value: newData.value });

	if(sensorName == sensorSelect){
		x1fast.domain([now - 60000, now]);

		g1fast.select(".bottomAxis")
			.transition()
			.duration(100)
			.call(x1fastAxis);

		path1fast.attr("d", line1fast)
			.attr("transform", null)
			.transition()
			.duration(100)
			.ease(d3.easeLinear)
			.attr("transform", "translate(" + x1fast(now - 60000) + ")");
	}
	
	while(graphData[sensorName]['fast'].length > 6000) {
		graphData[sensorName]['fast'].shift();
	}
}

var graphq1update = function(sensorName,newData) {
	var tstampEnd = new Date(newData.time)
	graphData[sensorName]["q1"].push({ time: tstampEnd, value: newData.value });
	if(sensorName == sensorSelect){
		xq1.domain([tstampEnd-360000, tstampEnd]);

		histq1.select(".bottomAxis")
			.transition()
			.duration(100)
			.call(xq1Axis);

		pathq1.attr("d", lineq1)
			.attr("transform", null)
			.transition()
			.duration(100)
			.ease(d3.easeLinear)
			.attr("transform", "translate(" + xq1(tstampEnd - 360000) + ")");
	}
}
