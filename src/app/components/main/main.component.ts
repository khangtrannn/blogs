import { Component } from '@angular/core';
import { RecentPostsComponent } from '../recent-posts/recent-posts.component';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [RecentPostsComponent],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent {

}
