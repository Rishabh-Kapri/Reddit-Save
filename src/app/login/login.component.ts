import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StateService } from '../services/state.service';
import { take } from 'rxjs/operators';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  constructor(
    private _state: StateService,
    private _router: Router
  ) { }

  ngOnInit() {
    console.log('Login user');
    this._state.currentRoute$.pipe(take(1)).subscribe(route => {
      if (route === 'dashboard') {
        // this._router.navigate(['/dashboard']);
      }
    });
  }

  login() {
    this._state.authorizeClient();
  }
}
