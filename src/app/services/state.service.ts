import { Injectable } from '@angular/core';
import { stringify } from 'querystring';

@Injectable({
  providedIn: 'root'
})
export class StateService {

  state: string;
  user = {};
  saved = [];
  after = '';

  private possible = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  constructor() {
    this.user['bearerToken'] = localStorage.getItem('token');
    this.user['refreshToken'] = localStorage.getItem('refresh');
    this.user['username'] = localStorage.getItem('name');
  }

  generateRandomString(length: number) {
    let text = '';
    for (let i = 0; i < length; i++) {
      text += this.possible.charAt(Math.floor(Math.random() * this.possible.length));
    }
    // Use db to persist this
    // this.state = text;
    return text;
  }
}
