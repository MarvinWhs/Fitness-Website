/* Autor: Marvin Wiechers */

import { LitElement, html, nothing } from 'lit';
import { customElement, query, state } from 'lit/decorators.js';
import { consume } from '@lit/context';
import { HttpClient, httpClientContext } from '../../../http-client.js';

@customElement('trainings-sessions')
export class TrainingsComponent extends LitElement {


  @consume({ context: httpClientContext })
  httpClient!: HttpClient;

  render(){
    return html`
    <!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Trainingsmenü</title>
    <link rel="style" href="trainings-sessions.css">
</head>
<body>
    <h1>Trainingsmenü</h1>
    <ul>
        <li class="dropdown">
            <a href="#" class="dropbtn">Muskelaufbau</a>
            <div class="dropdown-content">
                <a href="#">Zuhause</a>
                <a href="#">Fitnessstudio</a>
            </div>
        </li>
        <li class="dropdown">
            <a href="#" class="dropbtn">Abnehmen</a>
            <div class="dropdown-content">
                <a href="#">Zuhause</a>
                <a href="#">Fitnessstudio</a>
            </div>
        </li>
        <li class="dropdown">
            <a href="#" class="dropbtn">Training</a>
            <div class="dropdown-content">
                <a href="#">Muskelaufbau</a>
                <a href="#">Abnehmen</a>
                <a href="#">Zuhause</a>
                <a href="#">Fitnessstudio</a>
            </div>
        </li>
        <li class="dropdown">
            <a href="#" class="dropbtn">Ernährung</a>
            <div class="dropdown-content">
                <a href="#">Muskelaufbau</a>
                <a href="#">Abnehmen</a>
            </div>
        </li>
        <li class="dropdown">
            <a href="#" class="dropbtn">Zuhause</a>
            <div class="dropdown-content">
                <a href="#">Muskelaufbau</a>
                <a href="#">Abnehmen</a>
            </div>
        </li>
        <li class="dropdown">
            <a href="#" class="dropbtn">Fitness-Übungen</a>
            <div class="dropdown-content">
                <a href="#">Beine</a>
                <a href="#">Rücken</a>
                <a href="#">Brust</a>
                <a href="#">Schulter</a>
                <a href="#">Arme</a>
                <a href="#">Bauch</a>
                <a href="#">Po</a>
            </div>
        </li>
        <li><a href="#">Trainingspläne</a></li>
    </ul>



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
</body>
</html>
`
  }
}