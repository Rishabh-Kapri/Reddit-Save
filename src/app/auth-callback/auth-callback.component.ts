import { Component, OnInit } from '@angular/core';
import { RestService } from '../services/rest.service';
import { StateService } from '../services/state.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-auth-callback',
  templateUrl: './auth-callback.component.html',
  styleUrls: ['./auth-callback.component.css']
})
export class AuthCallbackComponent implements OnInit {

  oneTimeCode: string;
  state = this._state.state;

  constructor(
    private _rest: RestService,
    private _state: StateService,
    private activatedRoute: ActivatedRoute,
    private _router: Router
  ) { }

  ngOnInit(): void {
    console.log('auth callback called');
    this.validateUrlParams();
  }

  validateUrlParams() {
    console.log('validating params');
    this.activatedRoute.queryParams.subscribe(params => {
      if (params.error) {
        if (params.error === 'access_denied') {
          this._state.currentRoute = 'login';
        } else {
          this._state.currentRoute = 'login';
        }
      } else {
        this.oneTimeCode = params.code;
        this.getToken();
      }
    }, err => {
      this._state.currentRoute = 'login';
    });
  }

  getToken() {
    this._rest.getBearerToken(this.oneTimeCode).subscribe(response => {
      console.log(response);
      if (response.access_token) {
        this._state.user['bearerToken'] = response.access_token;
        this._state.user['refreshToken'] = response.refresh_token;
        localStorage.setItem('token', this._state.user['bearerToken']);
        localStorage.setItem('refresh', this._state.user['refreshToken']);
        localStorage.setItem('time', Math.round(new Date().getTime() / 1000).toString());
        this.getUser();
      }
    }, err => {
      console.log(err);
      this._state.currentRoute = 'login';
    });
  }

  getUser() {
    this._rest.getUser().subscribe(response => {
      this._state.user['username'] = response.name;
      localStorage.setItem('name', this._state.user['username']);
      this._state.currentRoute = 'dashboard';
      this._router.navigate(['dashboard']);
    }, err => {
      console.log(err);
      this._state.currentRoute = 'login';
    });
  }
}
