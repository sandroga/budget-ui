import {Component} from '@angular/core';
import {AuthService} from 'src/app/shared/services/auth-service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor(readonly authService: AuthService) {}

  // Füge eine Methode hinzu, um den Benutzernamen abzurufen, wenn der Benutzer eingeloggt ist.
  getLoggedInUsername(): string {
    if (this.authService.isLoggedIn()) {
      // Hier kannst du die Logik implementieren, um den Benutzernamen abzurufen.
      // Annahme: authService hat eine Methode getUsername(), um den Benutzernamen abzurufen.
      return this.authService.getUsername();
    }
    return '';
  }

  // Füge eine Methode hinzu, um den Avatar-Pfad abzurufen, wenn der Benutzer eingeloggt ist.
  getLoggedInAvatar(): string {
    if (this.authService.isLoggedIn()) {
      // Hier kannst du die Logik implementieren, um den Avatar-Pfad abzurufen.
      // Annahme: authService hat eine Methode getAvatar(), um den Avatar-Pfad abzurufen.
      return this.authService.getAvatar();
    }
    return '';
  }

  // Füge eine Methode hinzu, um den Benutzer auszuloggen.
  logout(): void {
    this.authService.logout();
    // Füge hier die Weiterleitung zur Logout-Seite oder zur Startseite hinzu.
  }
}
