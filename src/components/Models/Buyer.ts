import { IEvents } from "../base/Events";
import { IBuyer, TPayment } from "../../types";

export class Buyer {
  private data: IBuyer;
  private events: IEvents;
  private isDirty = false;

  constructor(events: IEvents) {
    this.events = events;
    this.data = {
      email: "",
      phone: "",
      address: "",
      payment: "card",
    };
  }

  setData(field: keyof IBuyer, value: string | TPayment): boolean {
    if (!this.isValidValue(field, value)) {
      console.warn(`Недопустимое значение для поля "${field}":`, value);
      return false;
    }

    const normalizedValue = this.normalizeValue(field, value);
    (this.data as any)[field] = normalizedValue;

    this.isDirty = true; //  отмечаем, что данные менялись

    // Эмиссия события сразу после изменения данных
    this.emitOrderChanged();
    return true;
  }

  getData(): IBuyer {
    return { ...this.data };
  }

  // Единый метод валидации
  validate(): Record<string, string> {
    const errors: Record<string, string> = {};

    if (!this.data.payment) {
      errors.payment = "Выберите вид оплаты";
    }
    if (!this.data.email) {
      errors.email = "Укажите email";
    } else if (!this.isValidEmail(this.data.email)) {
      errors.email = "Некорректный формат email";
    }
    if (!this.data.phone) {
      errors.phone = "Укажите номер телефона";
    } else if (!this.isValidPhone(this.data.phone)) {
      errors.phone = "Некорректный формат телефона";
    }
    if (!this.data.address) {
      errors.address = "Укажите адрес";
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
    this.isDirty = false; // сбрасываем флаг
    this.emitOrderChanged(); // Эмиссия события при очистке
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

    // Если данных ещё не меняли, не показываем ошибки
    const errors = this.isDirty ? this.validate() : {};

    const isValid = Object.keys(errors).length === 0;

    this.events.emit("order:changed", {
      data,
      errors,
      isValid,
    });
  }

  isValid(): boolean {
    const errors = this.validate();
    return Object.keys(errors).length === 0;
  }
}
