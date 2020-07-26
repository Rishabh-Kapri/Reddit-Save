import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { RestService } from '../services/rest.service';
import { StateService } from '../services/state.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { AuthService } from '../services/auth.service';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit, OnDestroy {

  subreddit = {};
  tempSaves = [];
  routeSubscriber: Subscription;

  constructor(
    private _rest: RestService,
    public _state: StateService,
    private _spinner: NgxSpinnerService,
    private _auth: AuthService,
    private _router: Router
  ) { }

  ngOnInit() {
    this._auth.isAuthenticated().subscribe(value => {
      console.log('Is user authenticated: ', value);
      if (value) {
        this.initApp();
      } else {
        this._state.currentRouteSource.next('login');
      }
    });
  }

  ngOnDestroy() {
  }

  initApp() {
    this._spinner.show();
    this._state.selectedSubreddit = 'All';
    console.log('dashboard called');
    console.log(this.subreddit, this.tempSaves);
    console.log(this._state.user);
    // show spinner here
    if (!this._state.saved) {
      setTimeout(() => {
        this.getSavedDataFromStorage();
      }, 1000);
    } else {
      this._spinner.hide();
    }
  }

  getSavedDataFromStorage() {
    // Get data from IndexedDB
    // if error then get data from reddit
    this._state.connectDB()
      .then((result) => {
        console.log(result);
        this._state.getDataFromDb()
          .then(data => {
            this._spinner.hide();
            this._state.saved = true;
            this._state.subNames = data;
            this._state.subNamesSource.next(data);
            this._state.filterSubreddit('All');
            console.log(this._state.saved);
          }).catch(err => {
            console.log(err);
            this._spinner.show();
            this.getSavedDataFromReddit();
          });
      });
  }

  getSavedDataFromReddit() {
    this._rest.getSavedData(this._state.after).subscribe(response => {
      // hide spinner here
      response['data']['children'].forEach(save => {
        this.tempSaves.push(save);
      });
      this._state.after = response['data']['after'];
      if (this._state.after) {
        this.getSavedDataFromReddit();
      } else {
        this.uniqueSubreddits();
      }
      console.log(this._state.saved);
    }, err => {
      // hide spinner here
      console.log(err);
    });
  }

  uniqueSubreddits() {
    this._spinner.hide();
    this.subreddit['All'] = [];
    // get unique subreddits from all the saved data
    this.tempSaves.forEach(save => {
      this.subreddit['All'].push(save);
      if (this.subreddit[save['data']['subreddit']]) {
        this.subreddit[save['data']['subreddit']].push(save);
      } else {
        this.subreddit[save['data']['subreddit']] = [];
        this.subreddit[save['data']['subreddit']].push(save);
      }
    });
    console.log(this.subreddit);

    this._state.addDataToDb(this.subreddit)
      .then()
      .then(this._state.getDataFromDb)
      .catch(console.log);
  }

}
