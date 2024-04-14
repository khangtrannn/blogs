import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  input,
} from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import Shiki from "@shikijs/markdown-it";
import MarkdownIt from "markdown-it";

const md = new MarkdownIt();

@Component({
  selector: "app-markdown-preview",
  template: `<div class="markdown-preview" [innerHTML]="html()"></div>`,
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .markdown-preview {
      padding-left: 1rem;
    } 
  `,
})
export class MarkdownPreviewComponent implements OnInit {
  domSanitizer = inject(DomSanitizer);
  content = input.required<string>();

  html = computed(() =>
    this.domSanitizer.bypassSecurityTrustHtml(md.render(this.content()))
  );

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
