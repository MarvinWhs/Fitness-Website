# Projekt zum Modul Web-Engineering & IT-Sicherheit
## Einleitung
Dieses ist das Grundgerüst für die zu entwickelnde Webanwendung, damit Sie direkt loslegen können.

Denken Sie daran, für jede Ihrer Dateien die Urheberschaft durch einen einleitenden Kommentar zu kennzeichnen (analog zu den bereitgestellten Dateien, wie z. B. `api-server/src/models/generic.dao.ts`).

## Start und Konfiguration der Anwendung
Den API-Server starten Sie mit

```sh
cd api-server
npm start
```

Über die Datei `api-server/src/config.json` können Sie insbesondere die Datenbankverbindung konfigurieren.

Den Client starten Sie mit

```sh
cd client
npm start
```

## Datei `print-files.js`

Über die Datei `print-files.js` können Sie einen Überblick über alle Dateien erhalten, bei denen die angegebene Person als Autor angegeben ist. Rufen Sie das Skript hierzu aus dem Wurzelverzeichnis des Projekts heraus auf.

### Beispiel

```sh
node print-files "John Doe"
```

Listet alle Dateien auf, in denen der Text `Autor: John Doe` enthalten ist


