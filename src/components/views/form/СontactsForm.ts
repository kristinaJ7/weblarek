//класс для отображения формы для отправки контактов(почта и телефон)

import { ensureElement } from "../../../utils/utils";
import { IEvents } from "../../base/Events";
import { OrderForm } from "./MainForm"; // родительский класс

// Тип данных формы контактов
interface IContactsData {
  email: string;
  phone: string;
}

export class ContactsForm extends OrderForm<IContactsData> {
  protected emailInput: HTMLInputElement;
  protected phoneInput: HTMLInputElement;

  constructor(protected events: IEvents) {
    super(events, "#contacts", "contacts:submit");

    // Получаем поля ввода из DOM
    this.emailInput = ensureElement<HTMLInputElement>(
      'input[name="email"]',
      this.container
    );
    this.phoneInput = ensureElement<HTMLInputElement>(
      'input[name="phone"]',
      this.container
    );

    // Настраиваем обработчики событий
    this.initEventListeners();
  }

  private initEventListeners(): void {
    // Слушатель на изменение email
    this.emailInput.addEventListener("input", () => {
      this.events.emit("contacts:email:change", {
        value: this.emailInput.value,
      });
      this.handleFormChange();
    });

    // Слушатель на изменение телефона
    this.phoneInput.addEventListener("input", () => {
      this.events.emit("contacts:phone:change", {
        value: this.phoneInput.value,
      });
      this.handleFormChange();
    });
  }

  // Обязательная реализация: сбор данных формы
  protected getFormData(): IContactsData {
    return {
      email: this.emailInput.value.trim(),
      phone: this.phoneInput.value.trim(),
    };
  }

  // Обязательная реализация: валидация данных
  protected validate(data: IContactsData): string[] {
    const errors: string[] = [];

    // Валидация email
    if (!data.email) {
    } else if (!this.isValidEmail(data.email)) {
      errors.push("Некорректный формат email");
    }

    // Валидация телефона
    if (!data.phone) {
    } else if (!this.isValidPhone(data.phone)) {
      errors.push("Некорректный формат телефона");
    }

    return errors;
  }

  // Вспомогательные методы валидации
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidPhone(phone: string): boolean {
    // Удаляем все нецифры (оставляем только 0-9)
    const digits = phone.replace(/\D/g, "");

    // Проверяем: начинается с 7 или 8, далее 10 цифр
    const isValid = /^(7|8)\d{10}$/.test(digits);

    return isValid;
  }

  // Общий обработчик изменений формы (дебаунс для оптимизации)
  private handleFormChange(): void {
    setTimeout(() => this.validateAndUpdate(), 0);
  }

  // Метод для принудительного обновления валидации
  public forceValidate(): void {
    this.validateAndUpdate();
  }

  // Переопределяем метод для более точного лога
  protected validateAndUpdate(): void {
    const data = this.getFormData();
    const errors = this.validate(data);

    if (errors.length === 0) {
      this.clearErrors();
      this.setSubmitEnabled(true);
      // Дополнительно эмиттим событие о валидных данных
      this.events.emit("contacts:valid", data);
    } else {
      this.setErrors(errors.join("\n"));
      this.setSubmitEnabled(false);
    }
  }
}
