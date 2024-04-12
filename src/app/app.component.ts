import { ApplicationRef, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  template: `
    <app-header />
    <div class="container">
      <router-outlet />
    </div>
    <app-footer />
  `,
  styles: `
    .container {
      position: relative;
      min-height: calc(100vh - var(--header-height) - var(--footer-height));
      max-width: calc(var(--main-width) + var(--gap) * 2);
      margin: auto;
      padding: var(--content-gap)var(--gap)0;
      line-height: 29px;
    }
  `,
})
export class AppComponent {
  title = 'khangtrann-blogs';

  constructor(private applicationRef: ApplicationRef) {
    setTimeout(() => {
      console.log(this.applicationRef);
    });
  }
}
