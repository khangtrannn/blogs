import { Injectable } from '@angular/core';
import { Post } from '../models/post.model';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  recentPosts: Post[] = [
    {
      title: 'Everything you need to know about Angular Signal 🚦',
      preview: 'I’ve just released a comprehensive video delving deep into my Neovim setup and command-line centric workflow. This video is a response to the curiosity of my YouTube subscribers. It’s an all-inclusive guide from A to Z, detailing the rationale behind my configuration choices. I’ve spent years perfecting my workflow and this video has been several months in the making, so I’m excited that I can finally share it with you....',
      slug: 'everything-you-need-to-know-about-angular-signal',
    },
    {
      title: 'Never doubt about Angular Change Detection',
      preview: 'I’ve just released a comprehensive video delving deep into my Neovim setup and command-line centric workflow. This video is a response to the curiosity of my YouTube subscribers. It’s an all-inclusive guide from A to Z, detailing the rationale behind my configuration choices. I’ve spent years perfecting my workflow and this video has been several months in the making, so I’m excited that I can finally share it with you....',
      slug: 'never-doubt-about-angular-change-detection',
    },
    {
      title: 'Signals and Change Detection',
      preview: 'I’ve just released a comprehensive video delving deep into my Neovim setup and command-line centric workflow. This video is a response to the curiosity of my YouTube subscribers. It’s an all-inclusive guide from A to Z, detailing the rationale behind my configuration choices. I’ve spent years perfecting my workflow and this video has been several months in the making, so I’m excited that I can finally share it with you....',
      slug: 'signal-and-change-detection',
    }
  ]

  getPostBySlug(slug: string): Post | undefined {
    return this.recentPosts.find((post) => post.slug === slug);
  }
}
