import { Component, OnInit } from '@angular/core';
import { StateService } from '../services/state.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  valueX = 0;
  constructor(
    public _state: StateService
  ) { }

  ngOnInit(): void {
  }

  moveNavbar(value: number) {
    this.valueX += value;
  }

}
