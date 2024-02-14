import { Component } from '@angular/core';
import { PostComponent } from './post/post.component';

@Component({
  selector: 'app-recent-posts',
  standalone: true,
  imports: [PostComponent],
  templateUrl: './recent-posts.component.html',
  styleUrl: './recent-posts.component.scss'
})
export class RecentPostsComponent {

}
