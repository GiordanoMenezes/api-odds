import axios from 'axios';

export default axios.create({
  baseURL: 'http://www.goalserve.com/getfeed/228e6f9210b5405573f508d9a80fef5d/getodds/soccer',
  timeout: 60000,
  timeoutErrorMessage: 'Conexão com o seridor de Odds não estabelecida!'
});
