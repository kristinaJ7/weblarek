

import { cloneTemplate, ensureElement, ensureAllElements } from "../../../utils/utils";
import { Component } from "../../base/Component";
import { IEvents } from "../../base/Events";

export abstract class OrderForm<T extends object> extends Component<HTMLElement> {
  protected formSubmitButtonElement: HTMLButtonElement;
  protected formErrorsElement: HTMLElement;
  protected formTitleElements: HTMLElement[];

  constructor(protected events: IEvents, template: string, protected submitEvent: string) {
    super(cloneTemplate<HTMLFormElement>(template));

    this.formSubmitButtonElement = ensureElement<HTMLButtonElement>(
      'button[type="submit"]',
      this.container
    );
    this.formErrorsElement = ensureElement<HTMLElement>(
      ".form__errors",
      this.container
    );
    this.formTitleElements = ensureAllElements<HTMLElement>(
      ".modal__title",
      this.container
    );
  }

  // Публичные методы (без изменений)
  setErrors(message: string): void {
    this.formErrorsElement.textContent = message;
  }

  setSubmitEnabled(enabled: boolean): void {
    this.formSubmitButtonElement.disabled = !enabled;
  }

  clearErrors(): void {
    this.formErrorsElement.textContent = "";
  }

  getContainer(): HTMLElement {
    return this.container;
  }
}









