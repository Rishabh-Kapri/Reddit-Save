import { Component, OnInit, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Router } from '@angular/router';
import { StateService } from '../services/state.service';
import { RestService } from '../services/rest.service';
import { environment as env } from '../../environments/environment';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  randString: string;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    public _state: StateService,
    public _rest: RestService,
    private _router: Router
  ) { }

  ngOnInit(): void {
    // Check if bearer token is valid
    if (this._state.validateToken(localStorage.getItem('token'), true)) {
      if (this._state.user['username']) {
        this._router.navigate(['/dashboard']);
      } else {
        this._rest.getUser().subscribe(response => {
          this._state.user['username'] = response.name;
          localStorage.setItem('name', this._state.user['username']);
          this._router.navigate(['/dashboard']);
        }, err => {
          // retry 3 time
          // if failed call authorize()
          console.log('Error', err);
        });
      } // if bearer is invalid check if refresh is valid
    } else if (this._state.validateToken(localStorage.getItem('refresh'), false)) {
      this._rest.refreshBearerToken().subscribe(response => {
        this._state.user['bearerToken'] = response.access_token;
        localStorage.setItem('token', this._state.user['bearerToken']);
        localStorage.setItem('time', Math.round(new Date().getTime() / 1000).toString());
      });
    } else {
      // the error with state showing as undefined
      // it is because the app loads again after redirect
      // this resets everything. Use db for that
      this.randString = this._state.generateRandomString(8);
      this.authorize();
    }
  }

  // call this from a button
  authorize() {
    // tslint:disable-next-line: max-line-length
    this.document.location.href = `https://reddit.com/api/v1/authorize?client_id=${env.clientId}&response_type=code&state=${this.randString}
    &redirect_uri=${env.redirectUri}&duration=permanent&scope=history+identity`;
  }
}