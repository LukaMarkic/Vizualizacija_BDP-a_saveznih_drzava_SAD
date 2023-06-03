
import { currentIdState, addedStatesToLinearGraph, RemoveDrawnData, GetNameOfState} from "./index.js";
import { GetTotalGDP } from "./gdpvalues.js";
import {rightSideTitle, infoParagraph, infoParaghraphBottom, statsContainer, selectStateContainer} from './constants.js';
import { statePieStats } from "./piechart.js";



function GetLinarGraphObject(data, id){
  
    let stateObject = 
      {
        id: id,
        values: {
          "1997": GetTotalGDP(data, id, "1997"),
          "1998": GetTotalGDP(data, id, "1998"),
          "1999": GetTotalGDP(data, id, "1999"),
          "2000": GetTotalGDP(data, id, "2000"),
          "2001": GetTotalGDP(data, id, "2001"),
          "2002": GetTotalGDP(data, id, "2002"),
          "2003": GetTotalGDP(data, id, "2003"),
          "2004": GetTotalGDP(data, id, "2004"),
          "2005": GetTotalGDP(data, id, "2005"),
          "2006": GetTotalGDP(data, id, "2006"),
          "2007": GetTotalGDP(data, id, "2007"),
          "2008": GetTotalGDP(data, id, "2008"),
          "2009": GetTotalGDP(data, id, "2009"),
          "2010": GetTotalGDP(data, id, "2010"),
          "2011": GetTotalGDP(data, id, "2011"),
          "2012": GetTotalGDP(data, id, "2012"),
          "2013": GetTotalGDP(data, id, "2013"),
          "2014": GetTotalGDP(data, id, "2014"),
          "2015": GetTotalGDP(data, id, "2015"),
          "2016": GetTotalGDP(data, id, "2016"),
          "2017": GetTotalGDP(data, id, "2017"),
          "2018": GetTotalGDP(data, id, "2018"),
          "2019": GetTotalGDP(data, id, "2019"),
          "2020": GetTotalGDP(data, id, "2020")
        }
      }
  
      return stateObject;
    
  }
  
  function AddLinearGraph(data, mainId, otherIds = []){
  
    selectStateContainer.style.display = "flex";
    statsContainer.style["flex-direction"] = "column";
    statsContainer.style["align-items"] = "start";
    statsContainer.style["justify-content"] = "start"
  
    RemoveDrawnData();
    let stateObjects = [];
    let ids = [];
    if(otherIds.length > 0) ids = [...otherIds];
    ids.push(mainId);
  
    
    
    ids.forEach(id => stateObjects.push(GetLinarGraphObject(data, id)));
      
        var years = Object.keys(stateObjects[0].values);
        var GDPvalues;
        var colorsPalette = ["#0f59d1", "#0ac43c", "#83cc96", "#7179f5", "#9c16ba", "#de7143", "#8f910a", "#d61132", "#161717"]
        var margin = { top: 50, bottom: 50, left: 110, right: 30 };
        var width = 1200 - margin.left - margin.right;
        var height = 600 - margin.top - margin.bottom;
  
        let max = {
          index: 0,
          value: d3.max(Object.values(stateObjects[0].values))
        }
        stateObjects.forEach((element, index) => {
          
          if(d3.max(Object.values(element.values)) > max.value){
            
            max = {
              index: index,
              value: d3.max(Object.values(element.values))
            }
          }
        })
  
        
  
        var x = d3
          .scaleBand()
          .domain(d3.range(years.length))
          .range([0, width]);
  
        var y = d3
          .scaleLinear()
          .domain([0, max.value + 5])
          .range([height, 20]);
  
        if(mainId === 0){
            rightSideTitle.innerHTML = 'Prikaz promjene BDP-a Sjedinjenih američkih država kroz godine';
            infoParagraph.innerHTML= `Dolje prikazani graf prikazuje promjenu BDP-a u razdolju od ${1997}. godine do ${2020.}. godine <span class="bold-span">Sjedinjenih američkih država</span>.`;
            infoParaghraphBottom.innerHTML = '';
        }else{
            rightSideTitle.innerHTML = `Prikaz promjene BDP-a ${GetNameOfState(data, mainId)} kroz godine`;
            infoParagraph.innerHTML= `Dolje prikazani graf prikazuje promjenu BDP-a u razdolju od ${1997}. godine do ${2020.}. godine <span class="bold-span">${GetNameOfState(data, mainId)}</span>.`;
            infoParaghraphBottom.innerHTML = '';
        }
        
        if(statePieStats){
          document.querySelector('.stats-draw-container').innerHTML = '';
          document.querySelector('.stats-legends').innerHTML = '';
        }
          
        var svgLinear = d3
          .select(".stats-draw-container")
          .append("svg").attr("id", "svg-stats").attr("class", "linear-graph-svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.bottom + margin.top)
          .style("background-color", "#ffffff")
          .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  
        var xAxis = d3
          .axisBottom()
          .scale(x)
          .tickFormat(function (d, i) {
            return years[i] + ".";
          });
  
        var yAxis = d3.axisLeft().scale(y).ticks(20);
  
        //x-axis
        svgLinear
          .append("g")
          .attr("class", "x axis").attr("class", "y axis").attr("style", "font-size: 12; font-weight: 400")
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis)
              
        svgLinear.append("text")             
          .attr("x", width/2 )
          .attr("y",  height + 45 )
          .style("text-anchor", "middle")
          .attr("style", "font-size: 16; font-weight: bold")
          .text("Godina");
        
        //y-axis
        svgLinear
          .append("g")
          .attr("class", "y axis").attr("style", "font-size: 12; font-weight: 400")
          .call(yAxis)
        
        svgLinear.append("text")
          .attr("transform", "rotate(-90)")             
          .attr("x", -(height) + 80 )
          .attr("y",  0 )
          .attr("dy", "-5.5em")
          .style("text-anchor", "end")
          .attr("style", "font-size: 16; font-weight: bold")
          .text("Iznos BDP-a [milijuni američkih dolara]");
  
          
        //Title
        svgLinear
          .append("text")
          .attr("x", width / 2)
          .attr("y", -5 - margin.top / 2)
          .attr("text-anchor", "middle")
          .style("font-size", "1.4em")
          .text(`Iznos BDP-a ${(currentIdState === 0) ? 'SAD-a' : 'savezne države ' + GetNameOfState(data, currentIdState)} u razdoblju od 1997. do 2020.`);
  
        //Line chart
        var valueline = d3
          .line()
          .x(function (d, i) {
            return x(i) + 23;
          })
          .y(function (d) {
            return y(d);
          });
  
  
        
        
        let colors = [];
        
        stateObjects.forEach(stateObject => {
          
          var linechart = svgLinear
          .append("path")
          .attr("class", "line").attr("id", `line-${stateObject.id}`)
          .attr("d", valueline(Object.values(stateObject.values)))
          .style("stroke", function(){
            if(stateObject.id === mainId) {
              colors.push({
                id: stateObject.id,
                colorIndex: colorsPalette.length - 1
              })
              return "#161717"
            };
            let randomIndex = Math.floor(Math.random() * (colorsPalette.length -1) );
            
            while(colors.some(element => element.colorIndex === randomIndex) === true){
              randomIndex = Math.floor(Math.random() * (colorsPalette.length - 1))
            }
            colors.push({
              id: stateObject.id,
              colorIndex: randomIndex
            })
            return colorsPalette[randomIndex];
          })
          .style("stroke-width", 4)
          .style("fill", "none")
          .on("mouseover", function () {
            
           
            d3.select(this).style("stroke-width", 6).style("cursor", 'pointer')
              .append("svg:title").attr("id", "title")
              .text(`${GetNameOfState(data, stateObject.id)}\n`);
  
            
          }).on("mouseout", function (d, i) {
            
            
            d3.select(this).style("stroke-width", 2)
            
            const titleBox = document.getElementById('title');
                  titleBox.remove();
          });
  
          console.log(stateObject);
          
          years.forEach((year, index) => {
            svgLinear
            .append("circle")
            .attr("r", 4)
            .attr("cx", () => x(index) + 23)
            .attr("cy", () => y(stateObject.values[year]))
            .style("fill", "white").style("stroke", "black")
            .on("mouseover", function () {
            
              d3.select(this).attr("r", 7).style("cursor", 'pointer')
                .append("svg:title").attr("id", "title")
                .text(`${stateObject.values[year]} mil. USD\n`);
           
            }).on("mouseout", function () {
               
              d3.select(this).attr("r", 4);
              const titleBox = document.getElementById('title');
                    titleBox.remove();
            });
          })
          
  
        })
        
        
        
         var legend = d3
         .select(".stats-legends")
         .append("div").attr("id", "linear-legends").selectAll("ol")
         .data(stateObjects).enter().append("div").attr("class", "linear-legends-sectors")
         .attr("id", function(d) { return `legend-${d.id}`;} )
         .html(function(d) { 
           let color = colors.filter(element => element.id === d.id);
           let buttonValue = `<button class="remove-legend-button" id="${d.id}">Ukloni</button>`
          
           if(d.id == currentIdState) buttonValue = ''; 
  
           return `<div class="legends-linear-container">
            <div style="width: 75%; display: flex; align-items: center; gap:10px">
              <div id="legends-linear-color-${d.id}" style="background-color:${colorsPalette[color[0].colorIndex]}"></div>
              <p class="legends-sectors-title">${GetNameOfState(data, d.id)}</p>
              </div>
              ${buttonValue}
           </div>`
       });
  
       SetEventListenersToButon(data);
  }
  
  function SetEventListenersToButon(data){
    const removeLegendButton = document.querySelectorAll('.remove-legend-button');
  
    removeLegendButton.forEach(button =>{
      let id = button.id;
      if(id=== currentIdState.toString()) return;
      button.addEventListener('click', () =>{
        RemoveStateLinaerChart(data, id);
      })
    })
  }
  
  function RemoveStateLinaerChart(data, id){
    if(addedStatesToLinearGraph.length < 8 ) selectStateContainer.style.display = "flex";
    let indexOfItem = addedStatesToLinearGraph.indexOf(parseInt(id))
    addedStatesToLinearGraph.splice(indexOfItem, 1);
    AddLinearGraph(data, currentIdState, addedStatesToLinearGraph);
    let allIds = [...addedStatesToLinearGraph];
    allIds.push(currentIdState)
    FillSelectStateOpstions(data, allIds);
  }

  export {AddLinearGraph};