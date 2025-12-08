//родительский класс для формы отправки(в который выносится общий для всех форм функционал)
import {
  cloneTemplate,
  ensureElement,
  ensureAllElements,
} from "../../../utils/utils";
import { Component } from "../../base/Component";
import { IEvents } from "../../base/Events";

export abstract class OrderForm<
  T extends object
> extends Component<HTMLElement> {
  protected formSubmitButtonElement: HTMLButtonElement;
  protected formErrorsElement: HTMLElement;
  protected formTitleElements: HTMLElement[];

  constructor(
    protected events: IEvents,
    template: string,
    protected submitEvent: string
  ) {
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

    this.container.addEventListener("submit", (event: Event) => {
      event.preventDefault();

      const data = this.getFormData();
      const errors = this.validate(data);

      if (errors.length === 0) {
        this.clearErrors();
        this.events.emit(this.submitEvent, data);
        this.setSubmitEnabled(true);
      } else {
        this.setErrors(errors.join("\n"));
        this.setSubmitEnabled(false);
      }
    });
  }

  // Обязательные методы для дочерних классов
  protected abstract getFormData(): T;
  protected abstract validate(data: T): string[];

  // Публичные методы
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
