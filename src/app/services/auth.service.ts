import { Injectable } from '@angular/core';
import { RestService } from './rest.service';
import { StateService } from './state.service';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private _rest: RestService,
    private _state: StateService,
    private _router: Router
  ) { }

  // this is important because rest call will be async
  // returning a promise will work too
  isAuthenticated(): Observable<string> {
    return new Observable((observer) => {
      const token = this.bearerTokenFromStorage;
      const time = Number(this.timeFromStorage);
      const refresh = this.refreshTokenFromStorage;

      // Check if localStorage has been tampered with
      if (!token || !time || !refresh) {
        console.log('no token, time or refresh found. Clearing localstorage');
        localStorage.clear();
        observer.next('');
        observer.complete();
      }

      const now = Math.round(new Date().getTime() / 1000);

      if ((now - time) > 3600) {
        localStorage.removeItem('token');
        localStorage.removeItem('time');

        this._rest.refreshBearerToken().subscribe(response => {
          this._state.user['bearerToken'] = response.access_token;
          localStorage.setItem('token', this._state.user['bearerToken']);
          localStorage.setItem('time', Math.round(new Date().getTime() / 1000).toString());
          observer.next(response.access_token);
          observer.complete();
        }, err => {
          observer.next('');
          observer.complete();
        });
      } else {
        observer.next(token);
        observer.complete();
      }
    });
  }

  get bearerTokenFromStorage(): string {
    return localStorage.getItem('token') ? localStorage.getItem('token') : '';
  }

  get refreshTokenFromStorage(): string {
    return localStorage.getItem('refresh') ? localStorage.getItem('refresh') : '';
  }

  get timeFromStorage(): string {
    return localStorage.getItem('time') ? localStorage.getItem('time') : '';
  }

  logout() {
    localStorage.clear();
    this._router.navigate(['login']);
    // this._state.saved = false;
    // this._state.user = {
    //   bearerToken: '',
    //   refreshToken: '',
    //   username: ''
    // };
    // this._state.subNames = [];
    // this._state.redditDB = {};
    // this._state.selectedSubreddit = 'All';
  }
}
