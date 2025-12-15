import { IEvents } from "../base/Events";
import { IBuyer, TPayment } from "../../types";

export type ValidationErrors = {
  email?: string[];
  phone?: string[];
  address?: string[];
  payment?: string[];
};

export class Buyer {
  private data: IBuyer;
  private errors: ValidationErrors = {};
  private events: IEvents;

  constructor(events: IEvents) {
    this.events = events;
    this.data = {
      email: "",
      phone: "",
      address: "",
      payment: "card", // Значение по умолчанию
    };
  }

  setData(field: keyof IBuyer, value: string | TPayment): boolean {
    if (!this.isValidValue(field, value)) {
      console.warn(`Недопустимое значение для поля "${field}":`, value);
      return false;
    }

    const normalizedValue = this.normalizeValue(field, value);
    (this.data as any)[field] = normalizedValue;

    this.validateField(field);
    this.emitChange();

    return true;
  }

  getData(): IBuyer {
    return { ...this.data };
  }

  getErrors(): ValidationErrors {
    return this.errors;
  }

  /**
   * Возвращает ошибки в формате, совместимом с формами (строки вместо массивов)
   */
  getFormattedErrors(): Partial<Record<keyof IBuyer, string>> {
    const formatted: Partial<Record<keyof IBuyer, string>> = {};

    Object.entries(this.errors).forEach(([field, messages]) => {
      if (messages && messages.length > 0) {
        formatted[field as keyof IBuyer] = messages.join("; ");
      }
    });

    return formatted;
  }

  validateAddressStep(): ValidationErrors {
    delete this.errors.address;
    delete this.errors.payment;

    this.validateField("address");
    this.validateField("payment");

    return this.errors;
  }

  validateContactStep(): ValidationErrors {
    delete this.errors.email;
    delete this.errors.phone;

    this.validateField("email");
    this.validateField("phone");

    return this.errors;
  }

  validateAll(): ValidationErrors {
    this.errors = {};
    (Object.keys(this.data) as Array<keyof IBuyer>).forEach((field) => {
      this.validateField(field);
    });
    return this.errors;
  }

  isValid(): boolean {
    return Object.values(this.errors).every(
      (errors) => !errors || errors.length === 0
    );
  }

  clear(): void {
    this.data = {
      email: "",
      phone: "",
      address: "",
      payment: "card",
    };
    this.errors = {};
    this.emitChange();
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

  private validateField(field: keyof IBuyer): void {
    const value = this.data[field];
    const errors: string[] = [];

    switch (field) {
      case "email":
        if (!value) {
          errors.push("Email обязателен для заполнения");
        } else if (!this.isValidEmail(value)) {
          errors.push("Некорректный формат email");
        }
        break;

      case "phone":
        if (!value) {
          errors.push("Телефон обязателен для заполнения");
        } else if (!this.isValidPhone(value)) {
          errors.push("Некорректный формат телефона");
        }
        break;

      case "address":
        if (!value) {
          errors.push("Адрес обязателен для заполнения");
        }
        break;

      case "payment":
        if (value !== "card" && value !== "cash") {
          errors.push("Выберите способ оплаты");
        }
        break;
    }

    if (errors.length > 0) {
      this.errors[field] = errors;
    } else {
      delete this.errors[field];
    }
  }

  private isValidEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  private isValidPhone(phone: string): boolean {
    return phone.length >= 10 && phone.length <= 15;
  }

  private emitChange(): void {
    this.events.emit("buyer:change", {
      data: this.getData(),
      errors: this.errors,
      isValid: this.isValid(),
    });
  }
}
