import { Injectable } from '@angular/core';
import { environment as env } from '../../environments/environment';
import { rejects } from 'assert';

@Injectable({
  providedIn: 'root'
})
export class StateService {

  state: string;
  user = {};
  saved = false;
  filtered;
  subNames;
  selectedSubreddit = 'All';
  after = '';
  redditDB = {};

  private possible = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  constructor() {
    this.user['bearerToken'] = localStorage.getItem('token');
    this.user['refreshToken'] = localStorage.getItem('refresh');
    this.user['username'] = localStorage.getItem('name');
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

  // TODO
  // 1. Move all the db methods to its own service
  filterSubreddit(subName: string) {
    console.log(subName);
    this.getSubredditData(subName)
      .then(data => {
        this.selectedSubreddit = subName;
        this.filtered = data;
        console.log(this.filtered);
      })
      .catch(console.log);
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
      Object.keys(data).forEach(key => {
        trx.add(data[key], key);
      });

      resolve('Completed');

      trx.onerror = (err: string) => {
        reject(err);
      };
    });
  }

  removeDataFromDb() {

  }

  getDataFromDb() {
    return new Promise((resolve, reject) => {
      console.log(this.redditDB);
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

  // Redundant for now
  getAllSubredditData(keys, trx) {
    let trxData = trx;
    return new Promise((resolve, reject) => {
      keys.forEach(key => {
        trxData = trx.get(key);

        trxData.onsuccess = (r) => {
          if (!r.target.result.length || r.target.result === undefined) {
            reject('No data');
          } else {
            this.saved[key] = r.target.result;
          }
        };

        trxData.onerror = (e) => {
          reject(e);
        };
      });
      resolve('Retrieved data');
    });
  }

  getSubredditData(key) {
    let trx = this.redditDB['dbCon'].transaction([env.DB_STORE_NAME]).objectStore(env.DB_STORE_NAME);
    trx = trx.get(key);

    return new Promise((resolve, reject) => {
      trx.onsuccess = (r) => {
        if (r.target.result === undefined || !r.target.result) {
          reject('No data for this subreddit');
        } else {
          resolve(r.target.result);
        }
      };
    });
  }
}
