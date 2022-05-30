import Market from "./Market";

export default class Match {
  id: string;
  league: string;
  status: string;
  date: string;
  time: string;
  ts: number;
  home: string;
  alway: string;
  description: string;
  markets: Market[];
}
