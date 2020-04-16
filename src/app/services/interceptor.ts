import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { RestService } from './rest.service';
import { StateService } from './state.service';

@Injectable()
export class Interceptor implements HttpInterceptor {

    constructor(
        private _auth: AuthService,
        private _rest: RestService,
        private _state: StateService,
        private _router: Router
    ) { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        console.log('Interceptor: ', req);
        return next.handle(req).pipe(tap((event: HttpEvent<any>) => {
            if (event instanceof HttpResponse) {
                console.log(event);
                // do something with response if required
            }
        }, (err: any) => {
            if (err instanceof HttpErrorResponse) {
                if (err.status === 401) {
                    this.isAuthenticated();
                }
                if (err.status === 404 && !localStorage.getItem('name')) {
                    this.getUser();
                }
            }
        }));
    }

    isAuthenticated() {
        this._auth.isAuthenticated().subscribe(value => {
            this._router.navigate(['/dashboard']);
        }, err => {
            this._router.navigate(['']);
        });
    }

    getUser() {
        this._rest.getUser().subscribe(response => {
            this._state.user['username'] = response.name;
            localStorage.setItem('name', this._state.user['username']);
            console.log(this._state.user['username']);
            // this._router.navigate(['/dashboard']);
            location.reload();
        }, err => {
            // redirect to home
            console.log(err);
        });
    }
}
