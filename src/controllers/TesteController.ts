import { bookPrioridade } from "@config/BookPrioridade";
import { Request, Response } from "express";


export default class TesteController {
  public async getTeste(
    request: Request,
    response: Response,
  ): Promise<Response> {

    return response.json(bookPrioridade.keys);
  }

}