

const AddLegendToMap = () => {
  

    var mapLegend = d3.select(".map-legend")
    .append("svg")
    .attr("width", 645)
    .attr("height", 250)
    
  var defs = mapLegend.append("defs");
  
  var linearGradient = defs.append("linearGradient")
      .attr("id", "linear-gradient");
  
  linearGradient
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "0%");
  
  //Set the color for the start (0%)
  linearGradient.append("stop")
  .attr("offset", "0%")
  .attr("stop-color", "rgb(0, 128, 0)"); //light blue
  
  //Set the color for the end (100%)
  linearGradient.append("stop")
  .attr("offset", "85%")
  .attr("stop-color", "rgba(0, 128, 0, 0.15)");
  
  linearGradient.append("stop")
  .attr("offset", "85%")
  .attr("stop-color", "rgba(222, 48, 4, 0.15)");
  
  linearGradient.append("stop")
  .attr("offset", "100%")
  .attr("stop-color", "rgba(222, 48, 4, 1)");
  
  mapLegend.append("rect")
    .attr("width", 380)
    .attr("height", 25).attr("transform", "translate(20 48)")
    .style("fill", "url(#linear-gradient)");
  
  
  
  // append title
  mapLegend.append("text")
    .attr("class", "legendTitle")
    .attr("x", 20)
    .attr("y", 20)
    .style("text-anchor", "left").style("font-weight", 600)
    .text("Intezitet boje odogvarajućeg omjera BDP-a pojedine savezene države u odonsu na ");
  
  mapLegend.append("text")
    .attr("class", "legendTitle")
    .attr("x", 20)
    .attr("y", 38)
    .style("text-anchor", "left").style("font-weight", 600)
    .text("saveznu dražavu s najvećim BDP-om");
  
  //create tick marks
  var xLeg = d3.scaleLinear()
  .domain([0, 100])
  .range([20, 400]);
  
  let presentnegaes = ["100%", "15%", "0%"] 
  var axisLeg = d3.axisBottom(xLeg)
  .tickValues([0, 85, 100]).tickFormat(function (d, i) {
    return presentnegaes[i];
  })
  
   mapLegend
   .attr("class", "axis")
   .append("g")
   .attr("transform", "translate(0, 78)")
   .call(axisLeg);
  
  
    mapLegend.append("text")
    .attr("class", "legendTitle")
    .attr("x", 20)
    .attr("y", 120)
    .style("text-anchor", "left")
    .html(`Legenda prikazuje intezitet korištenih boja. Svaki intezitet boje odgovara omjeru`)
  
    mapLegend.append("text")
    .attr("class", "legendTitle")
    .attr("x", 20)
    .attr("y", 136)
    .style("text-anchor", "left")
    .html(`BDP-a pojedine savezne države u odnosu na saveznu državu s najvećim BDP-om.`)
  
    mapLegend.append("text")
    .attr("class", "legendTitle")
    .attr("x", 20)
    .attr("y", 152)
    .style("text-anchor", "left")
    .html(`Ukoliko se radi o saveznoj državi s najvećim BDP-om ona će imat puni intezitet zelene`)
  
    mapLegend.append("text")
    .attr("class", "legendTitle")
    .attr("x", 20)
    .attr("y", 168)
    .style("text-anchor", "left")
    .html(`boje. Sve savezne države čiji je BDP manji od 15% u odnosu na saveznu državu s`)
  
    mapLegend.append("text")
    .attr("class", "legendTitle")
    .attr("x", 20)
    .attr("y", 184)
    .style("text-anchor", "left")
    .html(`najvećim BDP-om biti će obojane crvenom bojom pri čemu će ona savezna država`)
  
    mapLegend.append("text")
    .attr("class", "legendTitle")
    .attr("x", 20)
    .attr("y", 200)
    .style("text-anchor", "left")
    .html(`koja ima najmanji BDP biti obojana najvećim inteziteteom crvene boje`)
}

export { AddLegendToMap };
