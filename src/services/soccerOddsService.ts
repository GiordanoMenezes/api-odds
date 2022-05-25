import { bookPrioridade, getKeys } from "@config/BookPrioridade";
import { listaCountries, listaLigas, listaMatches, ultimoImport } from "@data/OddsData";
import League from "@models/League";
import Market from "@models/Market";
import Match from "@models/Match";
import Odd from "@models/Odd";
import apisoccer from "./apisoccer";
import {AxiosResponse}  from 'axios';


export default class SoccerOddsService {

  async importOdds(bm: string, ts = '0'): Promise<AxiosResponse> {
    const response : AxiosResponse = await apisoccer.get('', {
      params: {
        cat: 'soccer_10',
        json: '1',
        bm,
        ts
      }
    });
    console.log('Server Response Status: '+response.status);
    console.log('Bookmakers: ' + bm);
    ultimoImport.sport = response.data.scores.sport;
    ultimoImport.ts = response.data.scores.ts;
    response.data.scores.categories.forEach(cat => {
      console.log('Liga a Adicionar: ',cat.name);
      // League Handle
      let novaliga : boolean = false;
      // console.log ('-----------------------------------------CAT ------------------------------', cat.id);
      // listaLigas.forEach((lig,idx)=> console.log('listaLiga'+idx,' - '+lig.id));
      let curLeague : League = listaLigas.find( liga =>
        liga.id === cat.id);
      if (!curLeague) {
        console.log('Liga nova');
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
      } else {
        console.log('Liga já existe na base');
      };

      // Match Handle
      cat.matches.forEach( mat => {
        console.log('Jogo a adicionar: ',mat.localteam.name +' x '+ mat.visitorteam.name);
        let novomatch : boolean = false;
        let curMatch : Match = novaliga ? undefined : curLeague.matches.find( match => match.id === mat.id);
        if (!curMatch) {
          console.log('Jogo Novo');
          novomatch = true;
          curMatch = {
            id: mat.id,
            league: curLeague.id,
            status: mat.status,
            date: mat.date,
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
}
