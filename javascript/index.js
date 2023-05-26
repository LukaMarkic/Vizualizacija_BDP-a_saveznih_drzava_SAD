const infoParagraphContent = `
    S lijeve strane prikazna je interaktivna karta Sjedinjih američkih
    država s prikazom bruto društvenog proizvoda pojedine savezne
    države.
    <br /><br />Klikom na pojedinu državu otvara se prozor iz kojeg je
    mouće vidjeti raspodijelu BDP-a pojedine savezne države ne
    određene grane gospodarstva (poput: rudarstva, financija i sl.).
    Osim navedenog mogućo je pregeld promjene BDP-a kroz godine,
    točnije od 1997. do 2020. godine. Dodatno je omogućena i usporedba
    s drugom saveznom/im državama. <br /><br />
    Grafički prikaz raspodijele ukupnog BDP-a na pojedina gospodarstav
    moguće je pritiskom na označeni gumb. Isto je moguće ostvariti i
    za prikaz prommjene BDP-a kroz godine. Odabir prikaza BDP-a za
    dogovarajuću godinu moguće je pomoću odgovarajućeg selektora
    godina.`;

//DOM elements
const rightSideTitle = document.querySelector('.right-side-title');
const infoDescriptionContainer = document.querySelector('.info-description-container');
const showGDPBySectorButton = document.querySelector('#show-gdp-by-sector-button');
const showGDPOverYearButton = document.querySelector('#show-gdp-over-year-button');
let infoParagraph = document.querySelector('#info-paragraph');
let infoParaghraphBottom = document.querySelector("#info-paraghraph-bottom")
const statsContainer = document.querySelector(".stats-container");
const selectYearContainer = document.querySelector(".select-year-container");
const statsDrawContainer = document.querySelector(".stats-draw-container");
const presentStatButton = document.querySelector('.present-stat-button');
const statsLegendsContainer = document.querySelector(".stats-legends");
const selectStateContainer = document.querySelector('.select-state-container');
const selectState = document.querySelector("#select-state");

//Decalarton of graph elements
var margin = { top: 0, bottom: 250, left: 0, right: 0 };
var width = 1150 - margin.left - margin.right;
var height = 1050 - margin.top - margin.bottom;
var yearObject = document.getElementById("years");
active = d3.select(null);
var projection = d3
    .geoAlbersUsa().scale(1500)
      .translate([width / 2, height / 2]);

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
let addedStatesToLinearGraph = []


/*
let zoom = d3.zoom().on("zoom", () => {
  svg.attr("transform", d3.event.transform);
});

svg.call(zoom);*/

//Functions
const GetRoundFloatToSecondDecimal = (number) =>{
    return Math.round((number + Number.EPSILON) * 100) / 100;
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


const FillSelectStateOpstions = (data, ids) =>{
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

          function clicked(d) {
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
            var element = d3.select(".left-side-container").transition().duration(750).style("width", "650px");
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
            FillSelectStateOpstions(data, [d.id]);

            var bounds = path.bounds(d),
              dx = bounds[1][0] - bounds[0][0],
              dy = bounds[1][1] - bounds[0][1],
              x = (bounds[0][0] + bounds[1][0]) / 2,
              y = (bounds[0][1] + bounds[1][1]) / 2,
              scale = 0.9 / Math.max(dx / width, dy / height),
              translate = [(width - 600) / 2 - scale * x, height / 2 - scale * y];
          
            svg.transition().duration(750).attr("width", width - 500);
            g.transition()
              .duration(750)
              .style("stroke-width", 1.5 / scale + "px")
              .attr("transform", "translate(" + translate + ")scale(" + scale + ")");

          }

          //Read map data
          d3.json("us.json", function(error, us) {
            if (error) throw error;
              
              var scaleToRed = d3.scaleLinear().domain([0.85, 1]).range([0.15, 1]);
              console.log("Scale" + scaleToRed(0.8))

              var mapLegend = d3.select(".map-legend")
                .append("svg")
                .attr("width", 645)
                .attr("height", 250)
                
              var defs = mapLegend.append("defs");

              var linearGradient = defs.append("linearGradient")
                  .attr("id", "linear-gradient");

              var linearGradientRed = defs.append("linearGradient")
              .attr("id", "linear-gradient-red");

              linearGradient
                  .attr("x1", "0%")
                  .attr("y1", "0%")
                  .attr("x2", "100%")
                  .attr("y2", "0%");

              linearGradientRed
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
                .html(`Legenda prikazuje intezitet korištenih boja. Svaka intezitet boje odgovara omjeru`)

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


               var states = g.selectAll("path")
                  .data(topojson.feature(us, us.objects.states).features)
                  .enter()
                  .append("path")
                  .attr("d", path)
                  .attr("class", "feature")
                  .on("click", clicked);
          
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
                  FillSelectStateOpstions(data, allIds);
                })

              
              showGDPBySectorButton.addEventListener('click', ()=>{
                
                var element = d3.select(".left-side-container").transition().duration(750).style("width", "400px");
                //If USA dataset then
                
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
              });

              showGDPOverYearButton.addEventListener('click', ()=>{
                
                var element = d3.select(".left-side-container").transition().duration(750).style("width", "400px");
                //If USA dataset then
                addedStatesToLinearGraph = [];
                UpdateDescription();
                showGDPBySectorButton.style.display = "block";
                showGDPOverYearButton.style.display = "none";
                selectYearContainer.style.display = "none";
                statsDrawContainer.style.display = "block";
                statsLegendsContainer.display = "block";
                SetDrawMargin(statsDrawContainer, statsLegendsContainer, "20px 0px");
                showGDPBySectorButton.style.width = "290px";
                showGDPOverYearButton.style.width = "360px";
                selectStateContainer.style.display = "flex";
                isShowPress = true;
                AddLinearGraph(data, currentIdState);
                FillSelectStateOpstions(data, [currentIdState]);
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



        
function GetTotalGDP(data, id, year){
  let totalGDP = 0;
  let statesData = data.filter(element => element.GeoFIPS === id);
  statesData.forEach(element => {
    totalGDP += element[year];
  });
  return GetRoundFloatToSecondDecimal(totalGDP);
}

function GetMaxGDP(data, year){
  let maxValue = 0;
  data.forEach(element=>{
    if(element.GeoFIPS !== 0){
      let totalGDPState = GetTotalGDP(data, element.GeoFIPS, year);
      if(totalGDPState >= maxValue) maxValue = totalGDPState;
    }
  })

  return maxValue;
}


function GetMinGDP(data, year){
  let minValue;
  data.forEach(element=>{
    if(element.GeoFIPS !== 0){
      if(element.GeoFIPS === 1) minValue = GetTotalGDP(data, 1, year);
      let totalGDPState = GetTotalGDP(data, element.GeoFIPS, year);
      if(totalGDPState <= minValue) minValue = totalGDPState;
    }
  })

  return minValue;
}

function RemoveDrawnData(){
  let statsContainer = document.querySelector('.stats-draw-container');
  let statslegends = document.querySelector('.stats-legends');
  if(typeof(statsContainer) !== 'undefined' && typeof(statslegends) !== 'undefined'){
      statsContainer.innerHTML = '';
      statslegends.innerHTML = '';
  }
}


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
  //var color = d3.scaleOrdinal(d3.schemeCategory20);
  var color = [ "#F3BB75", "#F3D56E", "#F4F367", "#D5F460", "#D5F460","#8BF652","#8AEA51", 
                "#87DD4F", "#85D14D", "#82C54B", "#7EB949", "#7AAE47", "#75A345"];
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

      


  var myColor = d3.scaleQuantize()
    .domain(d3.extent(pieData, d => d.value))
    .range(color);

      pieArcs
        .append("path")
        .attr("fill", function (d, i) {
          return myColor(d.data.value);
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
          //(d.data.Description.length > 20) ? d.data.Description.substring(0,17) + "..." : d.data.Description
        })
        .attr("text-anchor", function (d) {
          return (d.endAngle + d.startAngle) / 2 > Math.PI ? "middle" : "start";
        });

      function translateLabels(d, distanceFromChart) {
        var c = arc.centroid(d);
        x = c[0];
        y = c[1];
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

function GetStringReprensteationOfDollars(number, toBillions = false){
  let currencyStr = "";
  if(toBillions){
    currencyStr = (number/1000).toLocaleString('en-US', {
      style: 'currency', currency: 'USD', currencyDisplay: 'code'
    });
    currencyStr = currencyStr.slice(4);
    currencyStr =  currencyStr.replace(/,/g, " ");
    currencyStr += " milijardi USD"
  }else{
    currencyStr = number.toLocaleString('en-US', {
      style: 'currency', currency: 'USD', currencyDisplay: 'code'
    });
    currencyStr = currencyStr.slice(4);
    currencyStr =  currencyStr.replace(/,/g, " ");
    currencyStr += " milijuna USD"
  }

  return currencyStr
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

      
    
    console.log(d3.range(years.length));

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


  var element = d3.select(".left-side-container").transition().duration(750).style("width", `${width}px`);
  svg.transition().duration(750).attr("width", width);
  g.transition()
    .duration(750)
    .style("stroke-width", "1.5px")
    .attr("transform", "");
}







