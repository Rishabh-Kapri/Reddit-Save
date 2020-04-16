import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { StateService } from './state.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RestService {

  accessTokenUrl = environment.accessToken;
  redirectUri = environment.redirectUri;
  clientId = environment.clientId;
  clientSecret = environment.clientSecret;
  oauthUrl = environment.oauth;

  constructor(private _http: HttpClient, private _state: StateService) { }

  // if refresh is true, send different data
  getBearerToken(code: string): Observable<any> {
    const data = `grant_type=authorization_code&code=${code}&redirect_uri=${this.redirectUri}`;

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: 'Basic ' + btoa(this.clientId + ':' + this.clientSecret)
      })
    };
    return this._http.post(this.accessTokenUrl, data, httpOptions);
  }

  refreshBearerToken(): Observable<any> {
    const data = `grant_type=refresh_token&refresh_token=${this._state.user['refreshToken']}`;

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: 'Basic ' + btoa(this.clientId + ':' + this.clientSecret)
      })
    };
    return this._http.post(this.accessTokenUrl, data, httpOptions);
  }

  getUser(): Observable<any> {
    const url = this.oauthUrl + '/api/v1/me';

    const httpOptions = {
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + this._state.user['bearerToken']
      })
    };

    return this._http.get(url, httpOptions);
  }

  getSavedData(after: string) {
    const url = this.oauthUrl + `/user/${this._state.user['username']}/saved?context=10&count=1&after=${after}&limit=100`;

    const httpOptions = {
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + this._state.user['bearerToken']
      })
    };

    return this._http.get(url, httpOptions);
  }

}
