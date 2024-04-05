/* Autor: Marvin Wiechers */

import { LitElement, html, nothing } from 'lit';
import { customElement, query, state } from 'lit/decorators.js';
import { consume } from '@lit/context';
import { HttpClient, httpClientContext } from '../../../http-client.js';

@customElement('trainings-einheiten')
export class TrainingsComponent extends LitElement {


  @consume({ context: httpClientContext })
  httpClient!: HttpClient;

  render(){
    return html`
    <head>
        <title>Trainingseinheiten</title>
        <link rel="stylesheet" href= "/trainings-einheiten.css">
    </head>
    <header>
        <nav class="navbar navbar-expand-lg navbar-light bg-light">
            <a class="navbar-brand" href="#">Fitnessseite</a>
            <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav">
                    <li class="nav-item">
                        <a class="nav-link" href="#">Übungen</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="#">Trainingspläne</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="#">Ernährung</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="#">Kontakt</a>
                    </li>
                </ul>
            </div>
        </nav>
    </header>

    <!-- Hauptinhalt -->
    <div class="container mt-4">
        <h1>Trainingseinheiten</h1>
        <div class="row">
            <!-- Trainingseinheit 1 -->
            <div class="col-md-4 mb-4">
                <div class="card">
                    <img src="trainingseinheit1.jpg" class="card-img-top" alt="Trainingseinheit 1">
                    <div class="card-body">
                        <h5 class="card-title">Trainingseinheit 1</h5>
                        <p class="card-text">Beschreibung der Trainingseinheit 1.</p>
                        <a href="#" class="btn btn-primary">Mehr erfahren</a>
                    </div>
                </div>
            </div>
            <!-- Trainingseinheit 2 -->
            <div class="col-md-4 mb-4">
                <div class="card">
                    <img src="trainingseinheit2.jpg" class="card-img-top" alt="Trainingseinheit 2">
                    <div class="card-body">
                        <h5 class="card-title">Trainingseinheit 2</h5>
                        <p class="card-text">Beschreibung der Trainingseinheit 2.</p>
                        <a href="#" class="btn btn-primary">Mehr erfahren</a>
                    </div>
                </div>
            </div>
            <!-- Weitere Trainingseinheiten ... -->
        </div>
    </div>
`
  }
}