
// 2 bwin
// 14 10Bet
// 16 bet365
// 18 unibet
// 20 5Dimes
// 21 betfair SP
// 28 Ladbrokes
// 56 188Bet
// 70 Intertops
// 82 Pinnacle
// 88 Sbobet
// 105 1xBet
// 142 Bovada
// 190 Tipico
// 230 Betcris
// 231 888Sport
// 232 Dafabet

//O mapa abaixo reflete o código do Bookmaker como chave e a ordem de prioridade como valor
// Para mudar a prioridade, coloque os bookmakers mais preferidos associados aos menores valores.
export const bookPrioridade: Map<string,number> = new Map<string,number>(
  [
    ['16',1],
    ['105',2],
    ['2',3],
    ['18',4],
    ['230',5],
    ['21',6],
    ['14',7],
  ]
);

// todos os bookmakers inseridos no mapa bookPrioridade serão utilizados na importação das odds.
export const getKeys = () => {
  let fm = '';
  for (const value of bookPrioridade.keys()) {
     fm = fm.concat(','+value);
  };
  return fm.substring(1);
}
  