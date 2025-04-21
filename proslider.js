/*
 * Simple Slider Card v0.1.0
 * A minimal custom card for Home Assistant that mimics the look of
 * https://codepen.io/josiahruddell/pen/DqbVJq (rounded track + filled bar)
 *
 * Author: ChatGPT (OpenAI)
 * License: MIT
 */

import { LitElement, html, css } from "https://unpkg.com/lit@2/index.js?module";

class SimpleSliderCard extends LitElement {
  static properties = {
    hass: { attribute: false },
    _config: { state: true },
    _value: { state: true },
  };

  setConfig(config) {
    if (!config.entity) {
      throw new Error("Entity must be specified");
    }
    this._config = {
      name: config.name,
      min: config.min ?? 0,
      max: config.max ?? 100,
      step: config.step ?? 1,
      ...config,
    };
  }

  set hass(hass) {
    this.__hass = hass;
    if (!this._config) return;
    const stateObj = hass.states[this._config.entity];
    if (stateObj) {
      const newVal = Number(stateObj.state);
      if (!Number.isNaN(newVal)) this._value = newVal;
    }
  }

  get hass() {
    return this.__hass;
  }

  _onInput(ev) {
    const value = Number(ev.target.value);
    this._value = value;
    // update CSS variable for filled track length
    const percent = ((value - this._config.min) * 100) / (this._config.max - this._config.min);
    ev.target.style.setProperty("--fill", `${percent}%`);
  }

  _onChange(ev) {
    if (!this.hass) return;
    const value = Number(ev.target.value);
    this.hass.callService("input_number", "set_value", {
      entity_id: this._config.entity,
      value,
    });
  }

  render() {
    if (!this._config) return html``;
    return html`
      <ha-card>
        ${this._config.name ? html`<div class="header">${this._config.name}</div>` : ``}
        <div class="container">
          <input
            type="range"
            min="${this._config.min}"
            max="${this._config.max}"
            step="${this._config.step}"
            .value="${this._value ?? this._config.min}"
            @input="${this._onInput}"
            @change="${this._onChange}"
          />
          <span class="value">${this._value ?? this._config.min}</span>
        </div>
      </ha-card>
    `;
  }

  static styles = css`
    ha-card {
      padding: 16px;
    }
    .header {
      font-weight: 600;
      margin-bottom: 12px;
    }
    .container {
      position: relative;
    }
    input[type="range"] {
      -webkit-appearance: none;
      width: 100%;
      height: 10px;
      border-radius: 5px;
      background: linear-gradient(
          var(--slider-fill, var(--accent-color)) 0 0
        ) no-repeat var(--track-color, #ececec);
      background-size: var(--fill, 0%) 100%;
      outline: none;
      transition: background-size 0.3s ease;
    }
    input[type="range"]::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: var(--thumb-color, #ffffff);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
      cursor: pointer;
      transition: transform 0.2s ease;
    }
    input[type="range"]:active::-webkit-slider-thumb {
      transform: scale(1.15);
    }
    input[type="range"]::-moz-range-thumb {
      width: 22px;
      height: 22px;
      border: none;
      border-radius: 50%;
      background: var(--thumb-color, #ffffff);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
      cursor: pointer;
    }
    .value {
      position: absolute;
      top: 50%;
      right: 0;
      transform: translateY(-50%);
      font-size: 14px;
      font-weight: 500;
      color: var(--primary-text-color, #1c1c1c);
    }
  `;
}

customElements.define("simple-slider-card", SimpleSliderCard);

