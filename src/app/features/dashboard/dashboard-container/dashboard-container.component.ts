import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { EditorComponent } from "../editor/editor.component";
import { MarkdownPreviewComponent } from "../markdown-preview/markdown-preview.component";

@Component({
  selector: "app-dashboard-container",
  template: `
    <div class="container">
      <app-editor [(content)]="content" />
      <app-markdown-preview [content]="content()" />
    </div>
  `,
  styles: `
    .container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      min-height: 80vh;
    }
  `,
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [EditorComponent, MarkdownPreviewComponent],
})
export class DashboardContainerComponent {
  content = signal("");
}
