import { Injectable } from '@angular/core';
import { Lugage } from '../models/lugage';
import { Http, Headers, RequestOptions, Response } from '@angular/http';

@Injectable()
export class LugageService {
    constructor(private http: Http) { }
 
}