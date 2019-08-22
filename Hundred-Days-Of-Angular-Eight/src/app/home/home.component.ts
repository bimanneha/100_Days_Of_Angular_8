import { Component, OnInit } from '@angular/core';
import {User} from '../../_models/user';
import {UserService} from '../../_services/user.service';
import {first} from 'rxjs/operators';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  loading = false;
  users: User[];

  constructor(private userService: UserService) { }

  ngOnInit() {
      this.loading = true;

      this.userService.getAllUsers()
        .pipe(first())
        .subscribe(usersFromDB => {
          this.users = usersFromDB;
        });
  }

}
