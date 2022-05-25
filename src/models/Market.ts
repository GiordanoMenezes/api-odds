import Odd from "./Odd";

export default class Market {
  id: string;
  name: string;
  match: string;
  stop: string;
  odds: Odd[];
  bookmaker: string;
}
