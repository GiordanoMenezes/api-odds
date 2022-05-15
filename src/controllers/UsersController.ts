import User from '@models/Users';

export default class UsersController {
  static teste() : string {
    const user = new User();
    return JSON.stringify(user);
  }
}
