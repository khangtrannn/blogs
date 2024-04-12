import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  signal,
} from "@angular/core";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { MarkdownModule } from "ngx-markdown";

import Shiki from "@shikijs/markdown-it";

import MarkdownIt from "markdown-it";

import { FormsModule } from "@angular/forms";

const md = new MarkdownIt();

@Component({
  selector: "app-post-details",
  template: `
    <textarea [(ngModel)]="content"></textarea>
    <div [innerHTML]="html()"></div>
    <div [innerHTML]="test()"></div>
  `,
  imports: [MarkdownModule, FormsModule],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PostDetailsComponent implements OnInit {
  content = signal("");

  html = computed(() =>
    this.domSanitizer.bypassSecurityTrustHtml(md.render(this.content()))
  );

  test = signal<SafeHtml>("");

  constructor(private domSanitizer: DomSanitizer) {}

  ngOnInit(): void {
    this.render();
  }

  async render(): Promise<void> {
    md.use(
      await Shiki({
        themes: {
          light: "vitesse-light",
          dark: "vitesse-dark",
        },
        langs: ["html", "css", "js", "ts"],
        defaultColor: "dark",
      })
    );
  }
}
