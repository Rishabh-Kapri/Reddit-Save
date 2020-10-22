import { Component, OnInit } from '@angular/core';
import { StateService } from '../services/state.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  valueX = 0;
  LEFT_LIMIT = 0;
  RIGHT_LIMIT = -2950;
  constructor(
    public _state: StateService
  ) { }

  ngOnInit(): void {
  }

  moveNavbar(value: number) {
    this.valueX += value;
    if (this.valueX <= -2950) {
      this.valueX = -2950;
    } else if (this.valueX >= 0) {
      this.valueX = 0;
    }
  }

}
