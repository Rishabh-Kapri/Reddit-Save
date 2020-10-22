import { Injectable } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { environment as env } from '../../environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';
import { exhaustMap, shareReplay, switchMap, tap, take, filter, map, toArray } from 'rxjs/operators';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { User } from '../interfaces/user.interface';

@Injectable({
  providedIn: 'root'
})
export class StateService {

  after = '';
  redditDB = {};
  state: string;
  user: User = {
    bearerToken: '',
    refreshToken: '',
    username: ''
  };
  saved = false;
  filtered;
  subNames: Array<string>;
  // selectedSubreddit = 'All';

  private readonly _saveData = new BehaviorSubject([]);
  private readonly _allSubreddits = new BehaviorSubject<Array<string>>(null);
  private readonly _filteredData = new BehaviorSubject(null);
  private readonly _selectedSubreddit = new BehaviorSubject<string>('All');
  private readonly _currentRoute = new BehaviorSubject<string>('dashboard');
  _refresh = new BehaviorSubject(null);
  _dummy = this._refresh.pipe(
    switchMap(() => this._http.get('https://jsonplaceholder.typicode.com/todos/1'))
  );

  readonly saveData$ = this._saveData.asObservable().pipe(shareReplay(1));
  readonly allSubreddits$ = this._allSubreddits.asObservable().pipe(shareReplay(1));
  readonly filteredData$ = this._filteredData.asObservable().pipe(shareReplay(1));
  readonly selectedSubreddit$ = this._selectedSubreddit.asObservable().pipe(shareReplay(1));
  readonly currentRoute$ = this._currentRoute.asObservable();

  private readonly possible = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  constructor(
    private _http: HttpClient,
    private _spinner: NgxSpinnerService,
    private _router: Router
  ) {
    console.log('State service constructor');
    this.user.bearerToken = localStorage.getItem('token');
    this.user.refreshToken = localStorage.getItem('refresh');
    this.user.username = localStorage.getItem('name');
    // this.currentRoute$.subscribe(route => {
    //   console.log('Current Route: ', route);
    //   this._router.navigate([`/${route}`]);
    // });
    this._dummy.pipe(tap(val => console.log(val)));
  }

  generateRandomString(length: number) {
    let text = '';
    for (let i = 0; i < length; i++) {
      text += this.possible.charAt(Math.floor(Math.random() * this.possible.length));
    }
    // Use db to persist this
    // this.state = text;
    return text;
  }

  set saveData(data) {
    this._saveData.next(data);
  }

  get saveData() {
    return this._saveData.value;
  }

  set allSubreddits(data: Array<string>) {
    this._allSubreddits.next(data);
  }

  get allSubreddits() {
    return this._allSubreddits.value;
  }

  set filteredData(data) {
    this._filteredData.next(data);
  }

  get filteredData() {
    return this._filteredData.value;
  }

  set selectedSubreddit(subreddit: string) {
    this._selectedSubreddit.next(subreddit);
  }

  get selectedSubreddit() {
    return this._selectedSubreddit.value;
  }

  set currentRoute(route: string) {
    this._currentRoute.next(route);
  }

  // background sync
  syncSaves() {
    // TODO
    // 1. behaviourSubject when refresh button is clicked
    // 2. listen to that subject in this method
    // 3. get new saves from reddit
    // 4. delete old saves
    // 5. put these new saves
  }

  // TODO
  // 1. Move all the db methods to its own service
  filterSubreddit(subName: string) {
    // this._refresh.next(subName);
    this.saveData$.pipe(
      take(1),
      switchMap(saves => saves),
      filter(save => subName === 'All' || save['data']['subreddit'] === subName),
      tap(val => console.log(val)),
      toArray()
      // map(val => val.filter(save => save['data']['subreddit'] === subName || subName === 'All')), // Another method to do the same
    ).subscribe(val => {
      this.selectedSubreddit = subName;
      this.filteredData = val;
    });
    console.log(this.filteredData);

    // this.getSubredditData(subName).subscribe(data => {
    //   this.selectedSubreddit = subName;
    //   this._selectedSubreddit.next(subName);
    //   this.filtered = data;
    //   this.filteredData = data;
    //   console.log(this.filtered);
    // }, err => {
    //   console.log(err);
    // });
  }

  connectDB() {
    return new Promise((resolve, reject) => {

      // Opens a connection to existing db or creates a new one
      const request = window.indexedDB.open(env.DB_NAME, env.DB_VERSION);
      request.onsuccess = (event) => {
        console.log('DB initialized');
        this.redditDB['dbCon'] = request.result;
        resolve('Connected');
      };

      request.onerror = (err) => {
        console.log('initDb: ', err);
        reject(err);
      };

      request.onupgradeneeded = (event) => {
        console.log('onupgrade: ', event);
        // Only fired once per db version, used to initialize the db
        // If there is not an existing db or version is changed then this will be called
        this.redditDB['dbCon'] = request.result;
        // const store = request.result.createObjectStore(
        //   env.DB_STORE_NAME, { keyPath: 'sub_name', autoIncrement: true });
        const store = request.result.createObjectStore(
          env.DB_STORE_NAME);
      };
    });
  }

  addDataToDb(data: object) {
    return new Promise((resolve, reject) => {
      const trx = this.redditDB['dbCon'].transaction([env.DB_STORE_NAME], 'readwrite').objectStore(env.DB_STORE_NAME);
      trx.add(data, 'saves');
      // Object.keys(data).forEach(key => {
      // trx.add(data[key], key);
      // });

      resolve('Completed');

      trx.onerror = (err: string) => {
        reject(err);
      };
    });
  }

  removeDataFromDb() {

  }

  // Get subreddit names from the db
  getDataFromDb() {
    return new Promise<Array<string>>((resolve, reject) => {
      const trx = this.redditDB['dbCon'].transaction([env.DB_STORE_NAME]).objectStore(env.DB_STORE_NAME);

      const keysTrx = trx.getAllKeys();
      keysTrx.onsuccess = (r) => {
        if (!r.target.result.length || r.target.result === undefined) {
          reject('Not found');
        } else {
          const keys = r.target.result;
          resolve(keys);
          // this.getAllSubredditData(keys, trx)
          //   .then(() => {
          //     resolve('Done');
          //   }).catch(err => {
          //     reject(err);
          //   });
        }
      };

      keysTrx.onerror = (e) => {
        reject(e);
      };

    });
  }

  getAllData(): Observable<Array<any>> {
    let trx = this.redditDB['dbCon'].transaction([env.DB_STORE_NAME]).objectStore(env.DB_STORE_NAME);
    trx = trx.get('saves');

    return new Observable((observer) => {
      trx.onsuccess = (r) => {
        if (r.target.result === undefined || !r.target.result) {
          observer.error('No saves found');
          observer.complete();
        } else {
          observer.next(r.target.result);
          observer.complete();
        }
      };
    });
  }

  getSubredditData(key: string): Observable<any> {
    let trx = this.redditDB['dbCon'].transaction([env.DB_STORE_NAME]).objectStore(env.DB_STORE_NAME);
    trx = trx.get(key);

    return new Observable((observer) => {
      trx.onsuccess = (r) => {
        if (r.target.result === undefined || !r.target.result) {
          observer.error('No data for this subreddit');
          observer.complete();
        } else {
          observer.next(r.target.result);
          observer.complete();
        }
      };
    });
  }

  public authorizeClient() {
    const randString = this.generateRandomString(8);
    document.location.href = `https://reddit.com/api/v1/authorize?client_id=${env.clientId}&response_type=code&state=${randString}
    &redirect_uri=${env.redirectUri}&duration=permanent&scope=history+identity`;
  }
}
