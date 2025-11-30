import { Component, HostBinding, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { TopbarComponent } from '../topbar/topbar.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, TopbarComponent],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.css',
})
export class ShellComponent implements OnInit {
  @HostBinding('class.dark') isDarkMode = false;

  private readonly document = inject(DOCUMENT);

  ngOnInit(): void {
    this.syncBodyClass();
  }

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    this.syncBodyClass();
  }

  private syncBodyClass(): void {
    const body = this.document.body.classList;
    if (this.isDarkMode) {
      body.add('dark');
    } else {
      body.remove('dark');
    }
  }
}
