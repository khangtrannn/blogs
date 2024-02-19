import { Component, Input, OnInit, computed, input } from '@angular/core';
import { MarkdownModule } from 'ngx-markdown';

@Component({
  selector: 'app-post-details',
  standalone: true,
  imports: [MarkdownModule],
  templateUrl: './post-details.component.html',
  styleUrl: './post-details.component.scss'
})
export class PostDetailsComponent {
  private postSlug = input.required();
  markdownUrl = computed(() => `/assets/posts/${this.postSlug()}.md`);
}
