
import {AddLegendToMap } from './maplegend.js';
import {GetTotalGDP, GetMinGDP, GetMaxGDP, GetStringReprensteationOfDollars} from './gdpvalues.js'
import {AddLinearGraph} from './linearchart.js'
import {infoParagraphContent, rightSideTitle, showGDPBySectorButton, showGDPOverYearButton, exitViewButton, infoParagraph, infoParaghraphBottom,
         selectYearContainer, statsDrawContainer, statsLegendsContainer, selectStateContainer, selectState, infoContainer} from './constants.js';
import { DrawPieChart } from './piechart.js';




//Decalarton of graph elements
var w = window.innerWidth;
var margin = { top: 0, bottom: 250, left: 10, right: 0 };
var width = w*0.7 - margin.left - margin.right;
var height = 1050 - margin.top - margin.bottom;
var yearObject = document.getElementById("years");
var scaleToRed = d3.scaleLinear().domain([0.85, 1]).range([0.15, 1]);
var active = d3.select(null);
var projection = d3
    .geoAlbersUsa().scale(1400)
      .translate([width / 2, height / 2]);
infoContainer.style["width"] = `${w*0.26}px`;


var path = d3.geoPath().projection(projection);
var svg = d3
    .select(".map-container")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .style("background", "white").attr(
      "transform",
      "translate(" + margin.left + "," + margin.top + ")"
    );;


var g = svg.append("g").style("stroke-width", "1.5px");
svg.attr("fill",  "#595959");
let currentIdState = 0;
let isShowPress = false;
let addedStatesToLinearGraph = [];


//Functions
const ShowDispalySpace = () => {
  d3.select(".left-side-container").transition().duration(750).style("width", `${w-1250}px`);
  d3.select(".info-container").transition().duration(750).style("width", `${1180}px`);
  svg.transition().duration(750).attr("width", `${w-1040}px`);
  exitViewButton.style.display = "block";
}

const HideDisplaySpace = () => {
  d3.select(".left-side-container").transition().duration(750).style("width", `${width}px`);
  d3.select(".info-container").transition().duration(750).style("width", `${w*0.26}px`);
  svg.transition().duration(750).attr("width", `${width}px`);
  exitViewButton.style.display = "none";
}

const GetNameOfState = (data, id) => {
  let stateName;
  data.forEach(element => {
    if(element.GeoFIPS === id) stateName = element.GeoName;
  })
  return stateName;
}


const SetDrawMargin = (obj1, obj2, margin) => {
  if(typeof(obj1) !== 'undefined') obj1.style.margin = margin;
  if(typeof(obj2) !== 'undefined') obj2.style.margin = margin;
}


const GetNameOfAllStates = (data) =>{
  let result = [];
  data.forEach(dataElement => {
    if(result.some(element => element.id === dataElement.GeoFIPS) === false) {
      result.push({
        id: dataElement.GeoFIPS,
        name: dataElement.GeoName
      })
    }

  })

  return result;
}


const FillSelectStateOptions = (data, ids) =>{
  let states = GetNameOfAllStates(data);
  const result = states.filter(element => {
    let value = ids.some(id => id === element.id);
    return !value;
  } )
  let opt = document.createElement("option");
  opt.disabled = true;
  opt.innerHTML = 'Odaberite državu za usporedbu';
  selectState.innerHTML = '';
  selectState.append(opt);
  selectState[0].setAttribute('selected','selected');
  result.map( (state) => {
    opt = document.createElement("option");
    opt.value = state.id; // the index
    opt.innerHTML = state.name;
    selectState.append(opt);
});
if(addedStatesToLinearGraph.length >= 8) selectStateContainer.style.display = "none";
}

function RemoveDrawnData(){
  let statsContainer = document.querySelector('.stats-draw-container');
  let statslegends = document.querySelector('.stats-legends');
  if(typeof(statsContainer) !== 'undefined' && typeof(statslegends) !== 'undefined'){
      statsContainer.innerHTML = '';
      statslegends.innerHTML = '';
  }
}


//Exit button
exitViewButton.addEventListener('click', ()=>{
  reset();
});

//Read the data
fetch("data.json")
        .then((response) => response.json())
        .then((data) => {
        

          function UpdateDescription(){
          
            if(currentIdState === 0){
              rightSideTitle.innerHTML = 'Prikaz raspodijele BDP-a Sjedinjenih američkih država na odgovarajuća gospodarstva';
              infoParagraph.innerHTML= `Prikaz za odgovarajuću godinu moguće je dobiti jednostavnim odabirom godine.`;
              infoParaghraphBottom.innerHTML = `Ukupni BDP <span class="bold-span">Sjedinjenih američkih država</span> za ${yearObject.options[yearObject.selectedIndex].text}. godinu je <span class="bold-span">${GetStringReprensteationOfDollars(GetTotalGDP(data, currentIdState, yearObject.options[yearObject.selectedIndex].text), true)}</span>.<br/>
                                                Gore prikazani kružni graf prikazuje udjel pojedinog gospodartva ukupnog BDP-a.<br/></br>`
            }else{
              rightSideTitle.innerHTML = `Prikaz raspodijele BDP-a savezne države ${GetNameOfState(data, currentIdState)} na odgovarajuća gospodarstva`;
              infoParagraph.innerHTML= `Prikaz za odgovarajuću godinu moguće je dobiti jednostavnim odabirom godine.`;
              infoParaghraphBottom.innerHTML = `Ukupni BDP savezne države <span class="bold-span">${GetNameOfState(data, currentIdState)}</span> za ${yearObject.options[yearObject.selectedIndex].text}. godinu  je <span class="bold-span">${GetStringReprensteationOfDollars(GetTotalGDP(data, currentIdState, yearObject.options[yearObject.selectedIndex].text), true)}</span>.<br/> 
                                                Gore prikazani kružni graf prikazuje udjel pojedinog gospodartva ukupnog BDP-a.<br/></br>`
            }
          }


          function stateClicked(d) {
            const svgBox = document.getElementById('svg-stats');
            const legendsBox = document.getElementById('stats-legends');
            if(svgBox !== null) svgBox.remove();
            if(legendsBox !== null) legendsBox.remove();

            if (active.node() === this) return reset();
            active.classed("active", false);
            active = d3.select(this).classed("active", true);
            rightSideTitle.innerHTML = `Prikaz BDP-a savezne države ${GetNameOfState(data, d.id)}`
            currentIdState = d.id;
            UpdateDescription();
            selectYearContainer.style.display = "none";
            ShowDispalySpace();
            showGDPBySectorButton.style.display = "block";
            showGDPBySectorButton.style.width = "290px";
            showGDPOverYearButton.style.display = "block";
            showGDPOverYearButton.style.width = "360px";
            statsDrawContainer.style.display = "none";
            statsLegendsContainer.display = "none";
            SetDrawMargin(statsDrawContainer, statsLegendsContainer, "0px");
            RemoveDrawnData();
            infoParagraph.innerHTML = ''
            selectStateContainer.style.display = "none";
            FillSelectStateOptions(data, [d.id]);

            var bounds = path.bounds(d),
              dx = bounds[1][0] - bounds[0][0],
              dy = bounds[1][1] - bounds[0][1],
              x = (bounds[0][0] + bounds[1][0]) / 2,
              y = (bounds[0][1] + bounds[1][1]) / 2,
              scale = 0.9 / Math.max(dx / width, dy / height),
              translate = [(width - 600) / 2 - scale * x, height / 2 - scale * y];
          
            
            g.transition()
              .duration(750)
              .style("stroke-width", 1.5 / scale + "px")
              .attr("transform", "translate(" + translate + ")scale(" + scale + ")");

          }

          //Read map data
          d3.json("us.json", function(error, us) {
            if (error) throw error;
              
              AddLegendToMap();
               var states = g.selectAll("path")
                  .data(topojson.feature(us, us.objects.states).features)
                  .enter()
                  .append("path")
                  .attr("d", path)
                  .attr("class", "feature")
                  .on("click", stateClicked);
          
              g.append("path")
                  .datum(
                    topojson.mesh(us, us.objects.states, function (a, b) {
                      return a !== b;
                    })
                  )
                  .attr("class", "mesh")
                  .attr("d", path);

                //Color the states
                const UpdateFillStates = () => {
                  let max = GetMaxGDP(data, yearObject.options[yearObject.selectedIndex].text);
                  let totalGDPofCurrentState;
                 
                  states
                    .style("fill", function(d,i){
                      if(d.id !== 72 && d.id !== 78) {
                        totalGDPofCurrentState = GetTotalGDP(data, d.id, yearObject.options[yearObject.selectedIndex].text);
                      }else{
                        totalGDPofCurrentState = 0;
                      }
                      return (totalGDPofCurrentState/max >= 0.15) ? "green": "#de3004";
                    })
                    .attr("opacity", function(d,i){
                      if(d.id !== 72 && d.id !== 78) {
                        totalGDPofCurrentState = GetTotalGDP(data, d.id, yearObject.options[yearObject.selectedIndex].text);
                      }else{
                        totalGDPofCurrentState = 0;
                      }
                      return (totalGDPofCurrentState/max >= 0.15) ? totalGDPofCurrentState/max : scaleToRed(1-totalGDPofCurrentState/max);
                      //return (totalGDPofCurrentState/max >= 0.15) ? totalGDPofCurrentState/max : GetMinGDP(data, yearObject.options[yearObject.selectedIndex].text)/totalGDPofCurrentState;
                    })
                }
                
                UpdateFillStates();
                
                yearObject.addEventListener("change", ()=>{
                  UpdateFillStates();
                  if(currentIdState === 0 && isShowPress === false) return;
                  UpdateDescription();
                  DrawPieChart(data, currentIdState, yearObject.options[yearObject.selectedIndex].text);
                })
                
                selectState.addEventListener("change", ()=>{
                 
                  let id = parseInt(selectState.options[selectState.selectedIndex].value);
                  if(addedStatesToLinearGraph.some(element => element === id)) return;
                  addedStatesToLinearGraph.push(id);
                  AddLinearGraph(data, currentIdState, addedStatesToLinearGraph);
                  let allIds = [...addedStatesToLinearGraph];
                  allIds.push(currentIdState)
                  FillSelectStateOptions(data, allIds);
                })

              
              showGDPBySectorButton.addEventListener('click', ()=>{
              
                UpdateDescription();
                showGDPBySectorButton.style.display = "none";
                showGDPOverYearButton.style.display = "block"
                selectYearContainer.style.display = "flex";
                statsDrawContainer.style.display = "block";
                statsLegendsContainer.display = "block";
                showGDPBySectorButton.style.width = "290px";
                showGDPOverYearButton.style.width = "360px";
                SetDrawMargin(statsDrawContainer, statsLegendsContainer, "5px 0px");
                isShowPress = true;
                selectStateContainer.style.display = "none";
                DrawPieChart(data, currentIdState, yearObject.options[yearObject.selectedIndex].text);
                ShowDispalySpace();
              });

              showGDPOverYearButton.addEventListener('click', ()=>{

                addedStatesToLinearGraph = [];
                UpdateDescription();
                showGDPBySectorButton.style.display = "block";
                showGDPOverYearButton.style.display = "none";
                selectYearContainer.style.display = "none";
                statsDrawContainer.style.display = "block";
                statsLegendsContainer.display = "block";
                isShowPress = true;
                showGDPBySectorButton.style.width = "290px";
                showGDPOverYearButton.style.width = "360px";
                selectStateContainer.style.display = "flex";
                SetDrawMargin(statsDrawContainer, statsLegendsContainer, "20px 0px");
                AddLinearGraph(data, currentIdState);
                FillSelectStateOptions(data, [currentIdState]);
                ShowDispalySpace();
              });


              states.on("mouseover", function (d, i) {
                let currentState = data.filter(element => element.GeoFIPS === d.id);
                let totalGDP = GetTotalGDP(data, d.id, yearObject.options[yearObject.selectedIndex].value);
                d3.select(this) 
                .style("fill", "#878787").attr("opacity", 0.8).style("stroke", "black")
                  .append("svg:title").attr("id", "title")
                  .text(function (d) {
                    return `${currentState[0].GeoName}\n$${totalGDP} mil`;
                  });

                
              }).on("mouseout", function (d, i) {
                let max = GetMaxGDP(data, yearObject.options[yearObject.selectedIndex].text);
                let totalGDPofCurrentState  = GetTotalGDP(data, d.id, yearObject.options[yearObject.selectedIndex].text);
                d3.select(this).style("fill", function(d,i){          
                  return (totalGDPofCurrentState/max >= 0.15) ? "green": "#de3004";
                })
                .attr("opacity", function(d,i){          
                  return (totalGDPofCurrentState/max >= 0.15) ? totalGDPofCurrentState/max : scaleToRed(1-totalGDPofCurrentState/max);
                });

                const titleBox = document.getElementById('title');
                titleBox.remove();
                
              });
          
          });

        });




function reset() {
  active.classed("active", false);
  active = d3.select(null);
  currentIdState = 0;
  rightSideTitle.innerHTML = `Interaktivna mapa SAD-a s ukupnim prikazom BDP-a`;
  isShowPress = false;
  infoParagraph.innerHTML = infoParagraphContent;
  showGDPBySectorButton.style.display = "block";
  selectYearContainer.style.display = "block";
  showGDPBySectorButton.style.width = "245px";
  showGDPOverYearButton.style.width = "245px";
  showGDPOverYearButton.style.display = "block"
  SetDrawMargin(statsDrawContainer, statsLegendsContainer, "0px");
  infoParaghraphBottom.innerHTML = '';
  RemoveDrawnData();
  selectStateContainer.style.display = "none";
  
  const svgBox = document.getElementById('svg-stats');
  const legendsBox = document.getElementById('stats-legends');
  if(svgBox !== null) svgBox.remove();
  if(legendsBox !== null) legendsBox.remove();


  HideDisplaySpace();
  g.transition()
    .duration(750)
    .style("stroke-width", "1.5px")
    .attr("transform", "");
}


export {currentIdState, addedStatesToLinearGraph, RemoveDrawnData, GetNameOfState}







