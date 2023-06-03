
import { RemoveDrawnData } from "./index.js";
import { GetTotalGDP, GetStringReprensteationOfDollars} from "./gdpvalues.js";
import {statsContainer, GetRoundFloatToSecondDecimal} from './constants.js'

var colors = [ "#F3BB75", "#F3D56E", "#F4F367", "#D5F460", "#D5F460","#8BF652","#8AEA51", 
                "#87DD4F", "#85D14D", "#82C54B", "#7EB949", "#7AAE47", "#75A345"];

var statePieStats;


function DrawPieChart (data, id, year){
    if(typeof(id) === 'undefined' || id === null) return;
    
    statsContainer.style["flex-direction"] = "row";
    statsContainer.style["justify-content"] = "center";
    statsContainer.style["align-items"] = "center";
    RemoveDrawnData();
    statePieStats = [];
    var outerRadius = 240;
    var innerRadius = 0;  
    let distanceFromChart = 12;
    var width = 540;
    var height = 540;
    var arc = d3.arc().innerRadius(innerRadius).outerRadius(outerRadius);
    let totalYearValueGDP = GetTotalGDP(data, id, year);
    var pie = d3.pie().value(function (d) {
      return d.value;
    });
  
   let dataObjectOthers = {
      value: 0,
      "GeoFIPS": "",
      "GeoName": "",
      "Description": []
    }
  
    let stateStatsObjects = [];
    data.forEach(element => {
      if(element.GeoFIPS === id && element[year]){
        if(element[year]/totalYearValueGDP < 0.01 && dataObjectOthers.Description.length < 4){
          dataObjectOthers.value = GetRoundFloatToSecondDecimal(dataObjectOthers.value + element[year]);
          dataObjectOthers.GeoFIPS = element.GeoFIPS;
          dataObjectOthers.GeoName = element.GeoName;
          dataObjectOthers.Description.push(element.Description);
        }else{
          stateStatsObjects.push({
            value: element[year],
            "GeoFIPS": element.GeoFIPS,
            "GeoName": element.GeoName,
            "Description": element.Description
          })
        }
      }
    });
    
    
    if(dataObjectOthers.value > 0) stateStatsObjects.push(dataObjectOthers);
  
    var pieData = pie(stateStatsObjects);
  
    pieData.forEach(element => statePieStats.push({
      index: element.index,
      name: element.data.Description,
      value: element.value,
      percentage: GetRoundFloatToSecondDecimal(element.value/totalYearValueGDP * 100)
    }));
  
    
    var statsSvg = d3
    .select(".stats-draw-container")
    .append("svg").attr("id", "svg-stats")
    .attr("width", width)
    .attr("height", height)
    .style("background", "white");
  
    pieData.sort((a, b) => (a.index > b.index) ? 1 : -1)
  
  
    var pieArcs = statsSvg
          .selectAll("g.pie")
          .data(pieData)
          .enter()
          .append("g")
          .attr("class", "pie")
          .attr("transform", "translate(" + width / 2 + ", " + height / 2 + ")")
          .on("click", function (d) {
            
          }).on("mouseover", function (d, i) {
            let sector = d3.select(`#legend-${d.index}`).transition().duration(250).style("font-weight", "600");
           
            d3.select(this).style("stroke", "black").style("opacity", 1)
              .append("svg:title").attr("id", "title")
              .text(function (d) {
                return `${d.data.Description}\n$${d.value} mil`;
              });
  
            
          }).on("mouseout", function (d, i) {
            let sector = d3.select(`#legend-${d.index}`).transition().duration(250);
            sector.style("font-weight", "400");
            d3.select(this).style("stroke", 'none').style("opacity", 0.9)
            
            const titleBox = document.getElementById('title');
                  titleBox.remove();
          });
  
        
  
  
    var pieChartScaledColor = d3.scaleQuantize()
      .domain(d3.extent(pieData, d => d.value))
      .range(colors);
  
        pieArcs
          .append("path")
          .attr("fill", function (d, i) {
            return pieChartScaledColor(d.data.value);
          }).style("opacity", 0.95)
          .attr("d", arc).attr("stroke", "#6e6e6e");
  
        pieArcs
          .append("text")
          .attr("transform", function (d) {
            return (
              translateLabels(d, distanceFromChart - 45) +
              rotateLabels(d.startAngle, d.endAngle)
            );
          })
          .attr("text-anchor", "middle").attr("dy", "0.3em")
          .text(function (d, i) {
            return (d.data.value/totalYearValueGDP > 0.015) ? (GetRoundFloatToSecondDecimal(d.data.value/totalYearValueGDP * 100) + " %") : "---";
          });
  
        pieArcs
          .append("text")
          .attr("transform", function (d) {
            return (
              translateLabels(d, distanceFromChart+2)
            );
          })
          .attr("text-anchor", "start").attr("dx",  function(d) {
            if(d.index + 1 === pieData.length){
                return "0.35em";
            }
             return "0em" 
          })
          .text(function (d) {
            return d.index + 1 + ".";
          })
          .attr("text-anchor", function (d) {
            return (d.endAngle + d.startAngle) / 2 > Math.PI ? "middle" : "start";
          });
  
        function translateLabels(d, distanceFromChart) {
          var c = arc.centroid(d);
          var x = c[0];
          var y = c[1];
          var h = Math.sqrt(x * x + y * y);
          return (
            "translate(" +
            (x / h) * (outerRadius + distanceFromChart) +
            "," +
            (y / h) * (outerRadius + distanceFromChart) +
            ")"
          );
        }
  
        function rotateLabels(startAngle, endAngle) {
          let rotation =
            (startAngle + endAngle) / 2 < Math.PI
              ? (((startAngle + endAngle) / 2) * 180) / Math.PI
              : ((startAngle / 2 + endAngle / 2 + Math.PI) * 180) / Math.PI;
  
          return "rotate(-90) rotate(" + rotation + ")";
        }
  
        var legend = d3
        .select(".stats-legends")
        .append("ol").attr("id", "stats-legends").selectAll("ol")
        .data(pieData).enter().append("li").attr("class", "legends-sectors")
        .attr("id", function(d) { return `legend-${d.index}`;} )
        .html(function(d) { 
         
          if(typeof(d.data.Description) === 'object'){
            return `<p class="legends-sectors-title">${GetStringRepesentationOfArrayElements(d.data.Description)} </p>  
              <p class="legends-sectors-content"><span>Udio: ${GetRoundFloatToSecondDecimal(d.data.value/totalYearValueGDP * 100)}%</span> 
              <span>Iznos: ${GetStringReprensteationOfDollars(d.value, (id === 0) ? true : false)}</span></p>`;
          }
          return `<p class="legends-sectors-title"> ${d.data.Description}</p>
          <p class="legends-sectors-content"><span>Udio: ${GetRoundFloatToSecondDecimal(d.data.value/totalYearValueGDP * 100)}%</span> 
          <span>Iznos: ${GetStringReprensteationOfDollars(d.value, (id === 0) ? true : false)}</span></p>`; 
      });
  
  }
  
  
  
  
  function GetStringRepesentationOfArrayElements(array){
    let result = ""
    array.forEach(element => {
      if(result.length === 0){
        result += element
      }
      else{
        result += ", " + element;
      }
    });
    return result;
  }
  

  export {statePieStats, DrawPieChart};