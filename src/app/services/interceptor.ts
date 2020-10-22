import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, filter, switchMap, take } from 'rxjs/operators';
import { AuthService } from './auth.service';
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
                    this._auth.isAuthenticated().pipe(
                        filter(val => !val),
                        tap(val => console.log(val)),
                        take(1),
                        switchMap(bearerToken => next.handle(req.clone({ setHeaders: { Authorization: `Bearer ${bearerToken}` } })))
                    );
                } else {
                    this._auth.logout();
                }
            }
        }));
    }

    isAuthenticated() {
        this._auth.isAuthenticated().subscribe(value => {
            if (value) {
                this._state.currentRoute = 'login';
            } else {
                this._state.currentRoute = 'login';
            }
        });
    }
}
