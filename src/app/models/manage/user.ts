declare type UserRole = 'Admin' | 'AdminAssistant' | 'User' | 'Client' | 'WarehouseManager';

export class UserRoleName {
    static admin: UserRole = 'Admin';
    static adminAssistant: UserRole = 'AdminAssistant';
    static user: UserRole = 'User';
    static client: UserRole = 'Client';
    static warehouseManager: UserRole = 'WarehouseManager';

    static selectionList = [
        { label: 'Адміністратор', value: UserRoleName.admin },
        { label: 'Помічник Адміністратора', value: UserRoleName.adminAssistant },
        { label: 'Продавець', value: UserRoleName.user },
        { label: 'Клієнт', value: UserRoleName.client },
        { label: 'Завскладу', value: UserRoleName.warehouseManager }    
      ];
      
    static getRoleName(isAdmin: boolean, role: string ) {
        if (isAdmin) return 'Адміністратор';
        switch (role) {
          case UserRoleName.adminAssistant: return 'Помічник Адміністратора';
          case UserRoleName.user: return 'Продавець';
          case UserRoleName.warehouseManager: return 'Завскладу';
          default: return 'Клієнт';
        }
    }  
} 

export interface IUserToEdit {
    id: string;
    login: string;
    name: string;
    surname: string;
    phone: string;
    role: UserRole;
    notes?: string;
}

export class UserToEdit implements IUserToEdit {
    id: string;
    login: string;
    name: string;
    surname: string;
    phone: string;
    notes?: string;
    role: UserRole;

    public constructor(val: ISUser) {
        this.id = val.id;
        this.login = val.login;
        this.name = val.name;
        this.surname = val.surname;
        this.phone = val.phone;
        this.notes = val.notes;
        this.role = val.role;
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
    role: UserRole;
}

export interface IUser {
    userName: string;
    token: string;
    isAdmin: boolean;
    role: UserRole;
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
    role: UserRole = 'User';

    public constructor() { }
}

export interface IChangePassword {
    currentPassword: string;
    newPassword: string;
}
export class ChangePassword implements IChangePassword {
    currentPassword: string;
    newPassword: string;

    public constructor() { }
}
