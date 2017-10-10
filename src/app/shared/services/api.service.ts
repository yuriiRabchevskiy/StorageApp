import { User } from './../../models/users';
import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';

@Injectable()

export class ApiService {
    constructor(private http: Http) { }
    getUsers(): Observable<User[]> {
        return this.http.get('users.json').map((resp: Response) => {
            const usersList = resp.json().data;
            const users: User[] = [];
            for (let i = 0; i < usersList.length; i++) {
                const item = usersList[i];
                users.push({
                    FirstName: item.FirstName, LastName: item.LastName,
                    Login: item.Login, Password: item.Password,
                    Role: item.Role
                });
            }
            return users;
        })
        .catch((error: any) => {
            return Observable.throw(error);
        });
    }
}
