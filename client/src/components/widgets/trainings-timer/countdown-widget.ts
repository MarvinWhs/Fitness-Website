/* Autor: Niklas Lobo */

import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import componentStyle from './countdown-widget.css?inline';
import { stopwatchIcon } from './stopwatch';

@customElement('countdown-widget')
export class CountdownWidget extends LitElement {
  static styles = [componentStyle];

  @state()
  open = false;

  @state()
  minutes = 0;

  @state()
  seconds = 0;

  @state()
  timerId: NodeJS.Timeout | null = null;

  @state()
  paused = false;

  startTimer() {
    if (this.timerId) {
      return;
    }
    this.paused = false;
    this.timerId = setInterval(() => {
      if (this.seconds > 0) {
        this.seconds--;
      } else if (this.minutes > 0) {
        this.minutes--;
        this.seconds = 59;
      } else {
        this.stopTimer();
      }
    }, 1000);
  }

  pauseTimer() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
      this.paused = true;
    }
  }

  stopTimer() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    this.paused = false;
    this.minutes = 0;
    this.seconds = 0;
  }

  togglePopup() {
    this.open = !this.open;
    if (this.open) {
      this.minutes = 0;
      this.seconds = 0;
    }
  }

  render() {
    return html`
      <button @click=${this.togglePopup}>${stopwatchIcon}</button>
      ${this.open
        ? html`
            <div class="popup">
              <div class="icon-container">
                <input
                  class="minutes-input"
                  type="number"
                  min="0"
                  .value=${this.minutes.toString()}
                  @input=${(e: InputEvent) => (this.minutes = parseInt((e.target as HTMLInputElement).value))}
                />
                :
                <input
                  class="seconds-input"
                  type="number"
                  min="0"
                  max="59"
                  .value=${this.seconds.toString()}
                  @input=${(e: InputEvent) => (this.seconds = parseInt((e.target as HTMLInputElement).value))}
                />
                <button @click=${this.startTimer}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="green">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </button>
                <button @click=${this.pauseTimer}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="blue">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                  </svg>
                </button>
                <button @click=${this.stopTimer}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="red">
                    <path d="M6 6h12v12H6z" />
                  </svg>
                </button>
              </div>
            </div>
          `
        : ''}
    `;
  }
}
