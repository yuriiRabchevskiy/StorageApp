import { IUser, User } from '../../models/users';

export class UsersService {
    private data: IUser[] = [];

    getData(): IUser[] {
        return this.data;
    }

    // addUser(fName: string, lName: string, login: string, pass: string, role: string) {
    //     this.data.push(new User(fName, lName, login, pass, role));
    // }
}
