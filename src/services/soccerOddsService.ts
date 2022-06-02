import { bookPrioridade, getKeys } from "@config/BookPrioridade";
import { listaLigas, listaMatches, ultimoImport } from "@data/OddsData";
import League from "@models/League";
import Market from "@models/Market";
import Match from "@models/Match";
import Odd from "@models/Odd";
import apisoccer from "./apisoccer";
import {AxiosResponse}  from 'axios';
import {format, addDays, addHours, startOfTomorrow} from 'date-fns';
import Country from "@models/Country";
import { structuredClone } from "@config/StructuredClone";


export default class SoccerOddsService {

  async importOdds(bm: string, ts = '0'): Promise<AxiosResponse> {
      const strdatastart = format(new Date(), 'dd.MM.yyyy');
      const strdataend = format(addDays(new Date(),5), 'dd.MM.yyyy');
      const response : AxiosResponse = await apisoccer.get('', {
        params: {
          cat: 'soccer_10',
          json: '1',
          bm,
          date_start: strdatastart,
          date_end: strdataend,
          ts
        }
      });
      console.log('Server Response Status: '+response.status);
      console.log('Bookmakers: ' + bm);
      ultimoImport.sport = response.data.scores.sport;
      ultimoImport.ts = response.data.scores.ts;
      const listaCountries = ultimoImport.listaCountries;
      response.data.scores.categories.forEach(cat => {
        // League Handle
        let novaliga : boolean = false;
        // console.log ('-----------------------------------------CAT ------------------------------', cat.id);
        // listaLigas.forEach((lig,idx)=> console.log('listaLiga'+idx,' - '+lig.id));
        let curLeague : League = listaLigas.find( liga =>
          liga.id === cat.id);
        if (!curLeague) {
          novaliga = true;
          curLeague = new League();
          curLeague.id = cat.id;
          curLeague.country =  cat.name.split(':')[0];
          curLeague.name =  cat.name.split(':')[1];
          curLeague.matches = [];
          listaLigas.push(curLeague);
          const country = listaCountries.find( c => c.pais === curLeague.country);
          if (country) {
            country.ligas.push(curLeague);
          } else {
            listaCountries.push({
              pais: curLeague.country,
              ligas: [curLeague],
            });
          }
        };

        // Match Handle
        cat.matches.forEach( mat => {
          console.log('Jogo a adicionar: ',mat.localteam.name +' x '+ mat.visitorteam.name + ' - '+ cat.name);
          let novomatch : boolean = false;
          let curMatch : Match = novaliga ? undefined : curLeague.matches.find( match => match.id === mat.id);
          if (!curMatch) {
            console.log('------------------------------------------ NOVO JOGO ---------------------------------------------------');
            novomatch = true;
            const sdate: number[] = mat.formatted_date.concat('.').concat(mat.time.replace(':','.')).split('.');
            const ts = Date.UTC(sdate[2],sdate[1]-1,sdate[0],sdate[3],sdate[4]);
            curMatch = {
              id: mat.id,
              league: curLeague.id,
              status: mat.status,
              date: mat.formatted_date,
              ts,
              time: mat.time,
              home: mat.localteam.name,
              alway: mat.visitorteam.name,
              description: mat.localteam.name+' X '+mat.visitorteam.name,
              markets: [],
            };
            curLeague.matches.push(curMatch);
            listaMatches.push(curMatch);
          //  console.log('Match Added: ', curMatch.description + ' - '+ curLeague.country + ' - '+ curLeague.name);
          } else {
            console.log('Jogo já existe na base');
          };

          // Market Handle
          mat.odds.forEach( mar => {
            let novomarket : boolean = false;
            let curMarket : Market = (novaliga || novomatch) ? undefined : curMatch.markets.find( market => market.id === mar.id); 
            if (!curMarket) {
              novomarket = true;
              curMarket = {
                id: mar.id,
                name: mar.value,
                match: curMatch.id,
                stop: mar.stop,
                odds: [],
                bookmaker: '',
              };
              curMatch.markets.push(curMarket);
            };

          // Bookmaker Handle
          let selectedBook = mar.bookmakers.reduce((selec,atual) => {
              const selecprioridade = bookPrioridade.get(selec.id);
              const atualprioridade = bookPrioridade.get(atual.id);
              return selecprioridade < atualprioridade ? selec : atual;
          });
          curMarket.bookmaker = selectedBook.name;
      //   console.log('Dados da Odd: '+ curMatch.description + ' - '+curMarket.name + ' - '+selectedBook.name);
          
          // Odd Handle
          curMarket.odds = [];
          selectedBook.odds.forEach( od => {
            if (od.type) {
              od.odds.forEach(o => {
                const curOdd: Odd = new Odd();
                curOdd.name = o.name;
                curOdd.type = od.type;
                curOdd.var = od.name;
                curOdd.value = o.value;
                curMarket.odds.push(curOdd);
              });
            } else {
              const curOdd: Odd = new Odd();
              curOdd.name = od.name;
              curOdd.value = od.value;
              curMarket.odds.push(curOdd);
            }
          });

          });
        });
      });
      return response;
  }

  async countriesFromDate(date: string, bm: string): Promise<string[]> {
    const response =  await apisoccer.get('',{
        params: {
          cat: 'soccer_10',
          json: '1',
          date_start: date,
          date_end: date,
          bm,
        }
      });
    return [...new Set<string>(response.data.scores.categories.map(cat => {
      return cat.name.split(':')[0];
    }))];
  }

   jogosdeHoje(): Country[] {
    const cloneImport = structuredClone(ultimoImport);
    const filteredCountries = cloneImport.listaCountries;
    const tsstart = Date.now();
   // console.log('start: ',tsstart);
    const tsend = addHours(startOfTomorrow(),-3).getTime();
  //  const tsend = addHours(new Date(),2).getTime();
  //  console.log('end: ',tsend);
    filteredCountries.forEach( ct => ct.ligas.forEach( lig => {
      lig.matches = lig.matches.filter( m =>m.ts > tsstart && m.ts < tsend);
    }) ); 
    filteredCountries.forEach(fc => 
      fc.ligas =  fc.ligas.filter( fl => fl.matches.length>0));
    return filteredCountries.filter(ct => ct.ligas.length>0);  
  }
}
