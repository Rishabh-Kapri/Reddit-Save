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
        private _state: StateService,
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
                    this._state.currentRouteSource.next('login');
                }
            }
        }));
    }

    isAuthenticated() {
        this._auth.isAuthenticated().subscribe(value => {
            if (value) {
                this._state.currentRouteSource.next('dashboard');
            } else {
                this._state.currentRouteSource.next('login');
            }
        });
    }
}
