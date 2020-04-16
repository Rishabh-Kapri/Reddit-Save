import { Injectable } from '@angular/core';
import { RestService } from './rest.service';
import { StateService } from './state.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private _rest: RestService,
    private _state: StateService
  ) { }

  // this is important because rest call will be async
  // returning a promising will work too
  isAuthenticated(): Observable<string> {
    return new Observable((observer) => {
      const token = this.getValueFromStorage('token');
      const time = Number(this.getValueFromStorage('time'));

      // Check if localStorage has been tampered with
      if (!token || !time) {
        localStorage.clear();
        observer.error('error');
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
          observer.next('success');
          observer.complete();
        }, err => {
          console.log(err);
          observer.error(err);
          observer.complete();
        });
      }
    });

  }

  getValueFromStorage(item: string) {
    return localStorage.getItem(item) ? localStorage.getItem(item) : '';
  }

}
