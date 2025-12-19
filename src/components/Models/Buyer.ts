import { IEvents } from "../base/Events";
import { IBuyer, TPayment } from "../../types";
import { OrderChangedEvent } from "../../main";

export class Buyer {
  private data: IBuyer;
  private events: IEvents;
  private touchedFields: Set<keyof IBuyer> = new Set();

  constructor(events: IEvents) {
    this.events = events;
    this.data = {
      email: "",
      phone: "",
      address: "",
    // payment: "card",
       payment: null,
    };
  }

  setData(field: keyof IBuyer, value: string | TPayment): boolean {
    if (!this.isValidValue(field, value)) {
      console.warn(`Недопустимое значение для поля "${field}":`, value);
      return false;
    }

    const normalizedValue = this.normalizeValue(field, value);
    (this.data as any)[field] = normalizedValue;

    this.touch(field);

    this.emitOrderChanged();
    return true;
  }

  getData(): IBuyer {
    return { ...this.data };
  }

  validate(): Record<string, string> {
    const errors: Record<string, string> = {};

    // Email: ошибка, если тронут И пуст/некорректен
    if (this.isTouched("email")) {
      if (!this.data.email || this.data.email.trim().length === 0) {
        errors.email = "Укажите email";
      } else if (!this.isValidEmail(this.data.email)) {
        errors.email = "Некорректный формат email";
      }
    }

    // Телефон: аналогично
    if (this.isTouched("phone")) {
      if (!this.data.phone || this.data.phone.trim().length === 0) {
        errors.phone = "Укажите номер телефона";
      } else if (!this.isValidPhone(this.data.phone)) {
        errors.phone = "Некорректный формат телефона";
      }
    }

    // Адрес и оплата — аналогично (если они обязательны)
    if (
      this.isTouched("address") &&
      (!this.data.address || this.data.address.trim().length === 0)
    ) {
      errors.address = "Укажите адрес";
    }

    if (this.isTouched("payment") && !this.data.payment) {
      errors.payment = "Выберите вид оплаты";
    }

    return errors;
  }

  clear(): void {
    this.data = {
      email: "",
      phone: "",
      address: "",
      payment: "card",
    };
    this.resetTouched();
    this.emitOrderChanged();
  }

  private normalizeValue(
    field: keyof IBuyer,
    value: string | TPayment
  ): string | TPayment {
    switch (field) {
      case "email":
        return value.trim().toLowerCase();
      case "phone":
        return value.replace(/\D/g, "");
      case "address":
        return value.trim();
      default:
        return value;
    }
  }

  private isValidValue(field: keyof IBuyer, value: unknown): boolean {
    switch (field) {
      case "payment":
        return value === "card" || value === "cash";
      default:
        return typeof value === "string";
    }
  }

  private isValidEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  private isValidPhone(phone: string): boolean {
    return phone.length >= 10 && phone.length <= 15;
  }

  private emitOrderChanged(): void {
    const data = this.getData();
    const errors = this.validate();
    const isValid = Object.keys(errors).length === 0;

    this.events.emit("order:changed", {
      data,
      errors,
      isValid,
    } as OrderChangedEvent);
  }

  isValid(): boolean {
    const errors = this.validate();
    return Object.keys(errors).length === 0;
  }

  // Методы для управления "тронутыми" полями
  touch(field: keyof IBuyer): void {
    this.touchedFields.add(field);
  }

  isTouched(field: keyof IBuyer): boolean {
    return this.touchedFields.has(field);
  }

  resetTouched(): void {
    this.touchedFields = new Set();
  }
}
