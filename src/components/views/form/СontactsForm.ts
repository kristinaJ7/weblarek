import { ensureElement } from "../../../utils/utils";
import { IEvents } from "../../base/Events";
import { OrderForm } from "./MainForm";
import { IContactsData } from "../../../types";

// Типы для событий
interface ContactsFieldChangeEvent {
  field: keyof IContactsData;
  value: string;
}

interface ContactsSubmitEvent extends IContactsData {}

export class ContactsForm extends OrderForm<IContactsData> {
  protected emailInput: HTMLInputElement;
  protected phoneInput: HTMLInputElement;
  private _container: HTMLElement;

  constructor(protected events: IEvents) {
    super(events, "#contacts", "contacts:submit");

    // Сохраняем контейнер сразу
    this._container = this.container;

    // Инициализация полей
    this.emailInput = ensureElement<HTMLInputElement>(
      'input[name="email"]',
      this.container
    );
    this.phoneInput = ensureElement<HTMLInputElement>(
      'input[name="phone"]',
      this.container
    );

    // Настройка обработчиков событий
    this.initEventListeners();
  }

  private initEventListeners(): void {
    // Обработчик ввода для полей
    const handleInput = (
      field: keyof IContactsData,
      input: HTMLInputElement
    ) => {
      input.addEventListener("input", () => {
        // Автоматически очищаем ошибки при вводе
        this.clearErrors();

        this.events.emit<ContactsFieldChangeEvent>("contacts:field:change", {
          field,
          value: input.value.trim(),
        });
      });
    };

    handleInput("email", this.emailInput);
    handleInput("phone", this.phoneInput);

    // Обработчик отправки формы
    this.container.addEventListener("submit", (event: Event) => {
      event.preventDefault();

      const formData = this.getFormData();
      this.events.emit<ContactsSubmitEvent>("contacts:submit", formData);
    });
  }

  // Сбор данных из DOM (без валидации)
  protected getFormData(): IContactsData {
    return {
      email: this.emailInput.value.trim(),
      phone: this.phoneInput.value.trim(),
    };
  }

  public showErrors(
    errors: Partial<Record<keyof IContactsData, string>>
  ): void {
    // Всегда очищаем старые ошибки
    this.clearErrors();

    // Выходим, если ошибок нет
    if (Object.keys(errors).length === 0) {
      return;
    }

    Object.entries(errors).forEach(([field, message]) => {
      const input = this.getInput(field as keyof IContactsData);
      if (input && message) {
        const errorEl = this.createErrorElement(message);
        input.parentNode?.insertBefore(errorEl, input.nextSibling);
        input.classList.add("error");
      }
    });
  }

  // UI-метод: очистить ошибки
  public clearErrors(): void {
    const errorElements = this.container.querySelectorAll(".form-error");
    errorElements.forEach((el) => el.remove());

    [this.emailInput, this.phoneInput].forEach((input) => {
      input.classList.remove("error");
    });
  }

  // UI-метод: включить/отключить кнопку отправки
  public setSubmitEnabled(enabled: boolean): void {
    const submitButton = this.container.querySelector(
      "button[type='submit']"
    ) as HTMLButtonElement | null;
    if (submitButton) {
      submitButton.disabled = !enabled;
    }
  }

  // UI-метод: обновить значения полей
  public updateFields(data: IContactsData): void {
    this.emailInput.value = data.email;
    this.phoneInput.value = data.phone;
  }

  // Заглушка для абстрактного метода (валидация делегирована внешнему слою)
  public validate(): string[] {
    return [];
  }

  /*// Получение контейнера формы
getContainer(): HTMLElement {
return this.container;
}*/
  getContainer(): HTMLElement {
    if (!this._container) {
      throw new Error("ContactsForm: контейнер не инициализирован!");
    }
    return this._container;
  }

  // Вспомогательные методы

  /**
   * Получает DOM-элемент поля по имени
   * @param field Имя поля (email/phone)
   * @returns HTMLInputElement или null
   */

  private getInput(field: keyof IContactsData): HTMLInputElement | null {
    return this.container.querySelector(`input[name="${field}"]`);
  }

  /**
   * Создаёт элемент с сообщением об ошибке
   * @param message Текст ошибки
   * @returns HTMLElement с классом form-error
   */

  private createErrorElement(message: string): HTMLElement {
    const el = document.createElement("div");
    el.className = "form-error";
    el.textContent = message;
    return el;
  }
}
