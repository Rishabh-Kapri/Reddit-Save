import { Component, OnInit } from '@angular/core';
import { RestService } from '../services/rest.service';
import { StateService } from '../services/state.service';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  subreddit = {};

  constructor(
    private _rest: RestService,
    public _state: StateService,
    public _router: Router,
    private _spinner: NgxSpinnerService
  ) { }

  ngOnInit(): void {
    console.log('dashboard called');
    // show spinner here
    this.getSavedDataFromStorage();
  }

  getSavedDataFromStorage() {
    this._spinner.show();
    if (localStorage.getItem('saved') && false) {
      this._state.saved = Array(localStorage.getItem('saved'));
    } else {
      localStorage.removeItem('saved');
      this.getSavedDataFromReddit();
    }
  }

  getSavedDataFromReddit() {
    this._rest.getSavedData(this._state.after).subscribe(response => {
      // hide spinner here
      response['data']['children'].forEach(save => {
        this._state.saved.push(save);
      });
      this._state.after = response['data']['after'];
      if (this._state.after) {
        this.getSavedDataFromReddit();
      } else {
        this.uniqueSubreddits();
        // localStorage.setItem('saved', this._state.saved.toString());
      }
      console.log(this._state.saved);
    }, err => {
      // hide spinner here
      console.log(err);
    });
  }

  uniqueSubreddits() {
    console.log('called unique');
    this._spinner.hide();
    // get unique subreddits from all the saved data
    this._state.saved.forEach(save => {
      if (this.subreddit[save['data']['subreddit']]) {
        this.subreddit[save['data']['subreddit']].push(save);
      } else {
        this.subreddit[save['data']['subreddit']] = [];
        this.subreddit[save['data']['subreddit']].push(save);
      }
    });
    console.log(this.subreddit);
  }


}
