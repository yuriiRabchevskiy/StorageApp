export interface IUser {
    FirstName: string;
    LastName: string;
    Login: string;
    Password: string;
    Role: string;
}
// export interface IUsers {
//     Roles: string;
//     Users: IUser[];
// }

export class User implements IUser {
    FirstName: string;
    LastName: string;
    Login: string;
    Password: string;
    Role: string;
}
