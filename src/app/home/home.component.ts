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
    if (!localStorage.getItem('refresh')) {
      this.authorize();
    } else {
      this._router.navigate(['/dashboard']);
    }
  }

  // call this from a button
  authorize() {
    this.randString = this._state.generateRandomString(8);
    // tslint:disable-next-line: max-line-length
    this.document.location.href = `https://reddit.com/api/v1/authorize?client_id=${env.clientId}&response_type=code&state=${this.randString}
    &redirect_uri=${env.redirectUri}&duration=permanent&scope=history+identity`;
  }
}
