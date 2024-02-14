declare type UserRole = 'Admin' | 'AdminAssistant' | 'User' | 'Client' | 'WarehouseManager';

export function detDiscountPercent(discounts?: number[]) {
    if (!discounts || discounts.length !== 1) return 0;
    const discountMultiplier = discounts[0];
    if (discountMultiplier < 0 || discountMultiplier > 1) return 0;
    return Math.round((1 - discountMultiplier) * 100);
  }

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

    static getRoleName(isAdmin: boolean, role: string) {
        if (isAdmin) return 'Адміністратор';
        switch (role) {
            case UserRoleName.adminAssistant: return 'Помічник Адміністратора';
            case UserRoleName.user: return 'Продавець';
            case UserRoleName.warehouseManager: return 'Завскладу';
            default: return 'Клієнт';
        }
    }
}

export interface ILoginCommand {
    login: string;
    password: string;
}

export interface ICurrentUser {
    userName: string;
    token: string;
    isAdmin: boolean;
    role: UserRole;
    discountMultipliers: number[];
}

export interface IUserToEdit {
    id: string;
    login: string;
    name: string;
    surname: string;
    phone: string;
    role: UserRole;
    notes?: string;
    dropAddress?: string;
    discountMultipliers?: number[];
}

export interface IUser {
    id: string;
    isActive?: boolean;
    discountMultipliers?: number[];
    discountPercent?: number;

    login: string;
    name: string;
    surname: string;
    email: string;
    phone: string;
    notes?: string;
    dropAddress?: string;
    isAdmin: boolean;
    role: UserRole;
}

export interface IRegisterUserCommand extends IUser {
    discounts: number[]
    password: string;
}

export class UserToEdit implements IUserToEdit {
    id: string;
    login: string;
    name: string;
    surname: string;
    phone: string;
    dropAddress?: string;
    notes?: string;
    role: UserRole;
    discountMultipliers: number[] = [1.0];

    public constructor(val: IUser) {
        this.id = val.id;
        this.login = val.login;
        this.name = val.name;
        this.surname = val.surname;
        this.phone = val.phone;
        this.notes = val.notes;
        this.role = val.role;
        this.discountMultipliers = val.discountMultipliers;
        this.dropAddress = val.dropAddress;
    }
}

export class User implements IUser {
    id: string;
    token: string;
    login: string = '';
    name: string;
    surname: string;
    email: string;
    phone: string;
    notes?: string;
    dropAddress?: string;
    password: string;
    isActive?: boolean = false;
    isAdmin: boolean = false;
    role: UserRole = 'User';
    discountMultipliers: number[] = [1.0];

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
