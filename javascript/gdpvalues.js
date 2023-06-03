import { GetRoundFloatToSecondDecimal } from "./constants.js";

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

  export { GetTotalGDP, GetMinGDP, GetMaxGDP, GetStringReprensteationOfDollars}