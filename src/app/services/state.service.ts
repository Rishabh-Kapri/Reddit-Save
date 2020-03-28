import { Injectable } from '@angular/core';
import { stringify } from 'querystring';

@Injectable({
  providedIn: 'root'
})
export class StateService {

  public state: string;
  public user = {};
  public saved = [];

  private possible = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  constructor() {
    this.user['bearerToken'] = localStorage.getItem('token');
    this.user['refreshToken'] = localStorage.getItem('refresh');
    this.user['username'] = localStorage.getItem('name');
  }

  validateToken(token: string, isBearer: boolean) {

    if (!token) {
      return false;
    }

    const time = localStorage.getItem('time') ? localStorage.getItem('time') : '';

    if (!time) {
      return false;
    }
    const tillValid = Number(time) + 3600;
    const now = Math.round(new Date().getTime() / 1000);

    if ((now - tillValid) > 3600 && isBearer) {
      return false;
    } else {
      return true;
    }
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
