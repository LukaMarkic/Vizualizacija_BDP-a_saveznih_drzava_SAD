const infoParagraphContent = `
    S lijeve strane prikazna je interaktivna karta Sjedinjih američkih
    država s prikazom bruto društvenog proizvoda pojedine savezne
    države.
    <br /><br />Klikom na pojedinu državu otvara se prozor iz kojeg je
    moguće vidjeti raspodijelu BDP-a pojedine savezne države ne
    određene grane gospodarstva (poput: rudarstva, financija i sl.).
    Osim navedenog moguć je pregled promjene BDP-a kroz godine,
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
const exitViewButton = document.querySelector('#exit-view-button');
let infoParagraph = document.querySelector('#info-paragraph');
let infoParaghraphBottom = document.querySelector("#info-paraghraph-bottom")
const statsContainer = document.querySelector(".stats-container");
const selectYearContainer = document.querySelector(".select-year-container");
const statsDrawContainer = document.querySelector(".stats-draw-container");
const presentStatButton = document.querySelector('.present-stat-button');
const statsLegendsContainer = document.querySelector(".stats-legends");
const selectStateContainer = document.querySelector('.select-state-container');
const selectState = document.querySelector("#select-state");
const infoContainer = document.querySelector(".info-container");


//Funnctions

const GetRoundFloatToSecondDecimal = (number) =>{
    return Math.round((number + Number.EPSILON) * 100) / 100;
}



export {infoParagraphContent, rightSideTitle, infoDescriptionContainer, showGDPBySectorButton, showGDPOverYearButton, exitViewButton, infoParagraph, infoParaghraphBottom,
    statsContainer, selectYearContainer, statsDrawContainer, presentStatButton, statsLegendsContainer, selectStateContainer, selectState, infoContainer, GetRoundFloatToSecondDecimal};