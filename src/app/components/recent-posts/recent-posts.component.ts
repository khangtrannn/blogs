import { Component, inject } from '@angular/core';
import { PostComponent } from './post/post.component';
import { PostService } from '../../services/post.service';

@Component({
  selector: 'app-recent-posts',
  standalone: true,
  imports: [PostComponent],
  templateUrl: './recent-posts.component.html',
  styleUrl: './recent-posts.component.scss'
})
export class RecentPostsComponent {
  recentPosts = inject(PostService).recentPosts;
}

  

