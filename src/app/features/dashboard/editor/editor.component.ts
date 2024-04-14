import { Component, input, model } from "@angular/core";
import { FormsModule } from "@angular/forms";

@Component({
  selector: "app-editor",
  template: `
    <div class="editor">
      <textarea
        [(ngModel)]="content"
        [autofocus]="true"
        class="textarea"
      ></textarea>
    </div>
  `,
  standalone: true,
  imports: [FormsModule],
  styles: `
    .editor {
      border-right: 1px solid #ccc;
      height: 100%;
      padding-right: 1rem;

      .textarea {
        width: 100%;
        height: 100%;
        background: none;
        border: none;
        resize: none;
        color: #ccc;

        &:focus {
          outline: none;
        }
      }
    } 
  `,
})
export class EditorComponent {
  content = model.required();
}
