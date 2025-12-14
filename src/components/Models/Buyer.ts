import { IEvents } from "../base/Events";

export interface IBuyer {
  email: string;
  phone: string;
  address: string;
  paymentMethod: TPayment | null;
}

export type ValidationErrors = Partial<Record<keyof IBuyer, string>>;
export type TPayment = "card" | "cash";

export class Buyer {
  private data: IBuyer = {
    email: "",
    phone: "",
    address: "",
    paymentMethod: null,
  };
  private errors: ValidationErrors = {};
  private events: IEvents;

  constructor(events: IEvents) {
    this.events = events;
  }

  setData(field: keyof IBuyer, value: string | TPayment): void {
    if (!this.isValidValueForField(field, value)) {
      console.warn(`Недопустимое значение для поля "${field}":`, value);
      return;
    }

    // Нормализация значений перед сохранением
    let normalizedValue = value;
    switch (field) {
      case "email":
        normalizedValue = value.trim().toLowerCase();
        break;
      case "phone":
        // Оставляем только цифры
        normalizedValue = value.replace(/\D/g, "");
        break;
      case "address":
        normalizedValue = value.trim();
        break;
      case "paymentMethod":
        // paymentMethod не нормализуем, оставляем как есть
        break;
    }

    (this.data as any)[field] = normalizedValue;
    console.log("[Buyer.data]", this.data);
    this.validate();
    this.emitChange();
  }

  getData(): IBuyer {
    return { ...this.data };
  }

  validate(): ValidationErrors {
    this.errors = {};

    // Email
    if (!this.data.email) {
      this.errors.email = "Email обязателен для заполнения";
    } else if (!this.isValidEmail(this.data.email)) {
      this.errors.email = "Некорректный формат email";
    }

    // Телефон
    if (!this.data.phone) {
      this.errors.phone = "Телефон обязателен для заполнения";
    } else if (!this.isValidPhone(this.data.phone)) {
      this.errors.phone = "Некорректный формат телефона";
    }

    // Адрес
    if (!this.data.address) {
      this.errors.address = "Адрес обязателен для заполнения";
    }

    // Способ оплаты
    if (!this.data.paymentMethod) {
      this.errors.paymentMethod = "Выберите способ оплаты";
    }

    return this.errors;
  }

  isValid(): boolean {
    return Object.keys(this.errors).length === 0;
  }

  clear(): void {
    this.data = { email: "", phone: "", address: "", paymentMethod: null };
    this.errors = {};
    this.emitChange();
  }

  private isValidEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  private isValidPhone(phone: string): boolean {
    // Проверяем длину цифр после нормализации (уже только цифры)
    return phone.length >= 10 && phone.length <= 15;
  }

  private emitChange(): void {
    this.events.emit("buyer:change", {
      data: this.data,
      errors: this.errors,
      isValid: this.isValid(),
    });
  }

  // Метод для проверки соответствия значения полю
  private isValidValueForField(field: keyof IBuyer, value: unknown): boolean {
    switch (field) {
      case "email":
        return typeof value === "string";
      case "phone":
        return typeof value === "string";
      case "address":
        return typeof value === "string";
      case "paymentMethod":
        return value === null || value === "card" || value === "cash";
      default:
        return false;
    }
  }
}
