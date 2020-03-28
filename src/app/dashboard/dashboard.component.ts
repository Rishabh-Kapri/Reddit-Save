import { Component, OnInit } from '@angular/core';
import { RestService } from '../services/rest.service';
import { StateService } from '../services/state.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  constructor(
    private _rest: RestService,
    public _state: StateService,
    public _router: Router
  ) { }

  ngOnInit(): void {
    // show spinner here
    this.getSavedData();
  }

  getSavedData() {
    this._rest.getSavedData().subscribe(response => {
      // hide spinner here
      console.log(response);
      this._state.saved = response['data']['children'];
      console.log(this._state.saved);
    }, err => {
      // hide spinner here
      console.log(err);
      this._router.navigate(['']);
    });
  }

}
