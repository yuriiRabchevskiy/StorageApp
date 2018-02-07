export interface IUserToEdit {
    id: string;
    login: string;
    name: string;
    surname: string;
    phone: string;
    isAdmin: boolean;
    notes?: string;
}

export class UserToEdit implements IUserToEdit {
    id: string;
    login: string;
    name: string;
    surname: string;
    phone: string;
    isAdmin: boolean;
    notes?: string;

    public constructor(val) {
        this.id = val.id;
        this.login = val.login;
        this.name = val.name;
        this.surname = val.surname;
        this.phone = val.phone;
        this.notes = val.notes;
        this.isAdmin = val.isAdmin;
    }
}

export interface ISUser {
    id: string;
    login: string;
    name: string;
    surname: string;
    email: string;
    phone: string;
    notes?: string;
    password: string;
    isActive?: boolean;
    isAdmin: boolean;
}

export interface IUser {
    userName: string;
    token: string;
    isAdmin: boolean;
}

export class User implements ISUser {
    id: string;
    token: string;
    login: string = '';
    name: string;
    surname: string;
    email: string;
    phone: string;
    notes?: string;
    password: string;
    isActive?: boolean = false;
    isAdmin: boolean = false;

    public constructor() { }
}

export interface IChangePassword {
    currentPassword: string;
    newPassword: string;
}
export class ChangePassword implements IChangePassword {
    currentPassword: string;
    newPassword: string;

    public constructor() {}
}
