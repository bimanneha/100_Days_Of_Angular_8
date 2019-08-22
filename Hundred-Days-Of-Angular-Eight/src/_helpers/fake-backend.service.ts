import {Injectable} from '@angular/core';
import {HTTP_INTERCEPTORS, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse} from '@angular/common/http';
import {Observable, of, throwError} from 'rxjs';
import {User} from '../_models/user';
import {delay, dematerialize, materialize, mergeMap} from 'rxjs/operators';

const users: User[] = [{id: 1, userName: 'bimanneha', password: 'pwd', firstName: 'Neha', lastName: 'Biman'}];

@Injectable()
export class FakeBackendService implements HttpInterceptor {

  constructor() {
  }

  // @ts-ignore
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    console.log('request', request);
    const {url, method, headers, body} = request;

    return of(null)
      .pipe(mergeMap(handleRoute))
      .pipe(materialize())
      .pipe(delay(500))
      .pipe(dematerialize());

    function handleRoute() {
      switch (true) {
        case url.endsWith('/users/authenticate') && method === 'POST':
          return authenticate();

        case url.endsWith('/users') && method === 'GET':
          return getUsers();

        default:
          return next.handle(request);
      }

      function authenticate() {
        const {userName, password} = body;

        const user = users.find(x => x.userName === userName && x.password === password);

        if (!user) {
          return errorMessage('User Name or password is incorrect.');
        }

        return success({
          id: user.id,
          userName: user.userName,
          firstName: user.firstName,
          lastName: user.lastName,
          token: 'fake-jwt-token'
        });
      }

      function getUsers() {
        if (!isLoggedIn()) {
          return unAuthorized();
        }
        return success(users);
      }

      function errorMessage(message) {
        return throwError({error: message});
      }

      function success(body?) {
        console.log('body', body);
        return of(new HttpResponse({status: 200, body}));
      }

      function isLoggedIn() {
        return headers.get('Authorization') === 'Bearer fake-jwt-token';
      }

      function unAuthorized() {
        return throwError({status: 401, error: {message: 'Unauthorized User.'}});
      }
    }
  }
}

export let fakeBackendService = {
  provide: HTTP_INTERCEPTORS,
  useClass: FakeBackendService,
  multi: true
};
