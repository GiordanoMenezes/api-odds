
import { getKeys } from '@config/BookPrioridade';
import { listaCountries } from '@data/OddsData';
import { Request, Response } from 'express';
import SoccerOddsService from '@services/soccerOddsService';

export default class SoccerController {
  public async forceiImportOdds(
    request: Request,
    response: Response,
  ): Promise<Response> {
    const soccerService = new SoccerOddsService();

    const responseImport = await soccerService.importOdds(getKeys());
    console.log('');
    console.log('');
    console.log('------------------------FINISH---------------------------------- ', Date.now());
    console.log('');
    return responseImport.status === 200 ? response.json(listaCountries) : response.status(500).json({'Mensagem:':'Erro o importar Odds!'});
  }

  public async importOdds(ts: string): Promise<void> {
    const soccerService = new SoccerOddsService();
    try {
       const responseImport = await soccerService.importOdds(getKeys(),ts);
       console.log('');
       console.log('');
       console.log( 'CICLO DE ODDS REALIZADO AS '+Date.now()+ ' COM STATUS '+ responseImport.status);
       console.log('');
       console.log('');
    } catch (ex) {
      console.log(' --------------------------- PROBLEMA AO IMPORTAR CICLO DE ODDS ----------------', ex);
    }
  }

  public getAllOdds(request: Request, response: Response): Response {
    return response.json(listaCountries);
  }

}