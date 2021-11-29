import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PreferenceService {

    public constructor() { }

    public set(key: string, value: string) {
        localStorage.setItem(key, value);
    }

    public get(key: string, defaultValue?: string) {
        return localStorage.getItem(key) ?? defaultValue;
    }
}
