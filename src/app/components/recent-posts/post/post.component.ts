import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Post } from '../../../models/post.model';

@Component({
  selector: 'app-post',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './post.component.html',
  styleUrl: './post.component.scss'
})
export class PostComponent {
  post = input.required<Post>();
}
