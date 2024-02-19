import { Component } from '@angular/core';
import { PostComponent } from './post/post.component';
import { Post } from '../../models/post.model';

@Component({
  selector: 'app-recent-posts',
  standalone: true,
  imports: [PostComponent],
  templateUrl: './recent-posts.component.html',
  styleUrl: './recent-posts.component.scss'
})
export class RecentPostsComponent {
  recentPosts: Post[] = [
    {
      title: 'Never doubt about Angular Change Detection',
      preview: 'I’ve just released a comprehensive video delving deep into my Neovim setup and command-line centric workflow. This video is a response to the curiosity of my YouTube subscribers. It’s an all-inclusive guide from A to Z, detailing the rationale behind my configuration choices. I’ve spent years perfecting my workflow and this video has been several months in the making, so I’m excited that I can finally share it with you....',
      slug: 'never-doubt-about-angular-change-detection',
    }
  ]
}
