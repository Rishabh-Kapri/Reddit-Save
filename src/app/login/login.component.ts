import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RestService } from '../services/rest.service';
import { StateService } from '../services/state.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  oneTimeCode: string;
  state = this._state.state;

  constructor(
    private _rest: RestService,
    public _state: StateService,
    private activatedRoute: ActivatedRoute,
    public _router: Router
  ) { }

  ngOnInit(): void {
    this.validateUrlParams();
  }

  validateUrlParams() {
    this.activatedRoute.queryParams.subscribe(params => {
      if (params.error) {
        if (params.error === 'access_denied') {
          console.log('Hope we meet again');
        } else {
          console.log('Something went wrong');
        }
      } else {
        this.oneTimeCode = params.code;
        this.getToken();
      }
    }, err => {
      console.log(err);
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
      // retry here 3 times
      // if still failed redirect again
      console.log(err);
    });
  }

  getUser() {
    this._rest.getUser().subscribe(response => {
      this._state.user['username'] = response.name;
      localStorage.setItem('name', this._state.user['username']);
      this._router.navigate(['/dashboard']);
    }, err => {
      // redirect to home
      console.log(err);
    });
  }
}
