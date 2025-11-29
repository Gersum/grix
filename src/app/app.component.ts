import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { HomeComponent } from "./pages/home/home.component";
import { CommonModule } from '@angular/common';



@Component({
  selector: 'app-root',
  standalone: true,
  
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  imports: [HomeComponent,CommonModule]
})
export class AppComponent {
  rotation: number = 0;
  @ViewChild('videoPlayer', { static: false }) videoRef!: ElementRef<HTMLVideoElement>;


  @HostListener('window:scroll', ['$event'])
  onScroll(event: Event): void {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    this.rotation = Math.min(scrollTop / 10, 20); // Max tilt of 20 degrees

   
  }
}