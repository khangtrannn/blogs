import { Component, Input, OnInit, computed, inject, input } from '@angular/core';
import { MarkdownModule } from 'ngx-markdown';
import { PostService } from '../../services/post.service';

@Component({
  selector: 'app-post-details',
  standalone: true,
  imports: [MarkdownModule],
  templateUrl: './post-details.component.html',
  styleUrl: './post-details.component.scss'
})
export class PostDetailsComponent {
  private postSlug = input.required<string>();
  private postService = inject(PostService);
  markdownUrl = computed(() => `/assets/posts/${this.postSlug()}.md`);
  post = computed(() => this.postService.getPostBySlug(this.postSlug()));
}
