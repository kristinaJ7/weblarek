// класс для отображения формы для отправки адреса (способ оплаты и адрес)

import { ensureElement, ensureAllElements } from "../../../utils/utils";
import { IEvents } from "../../base/Events";
import { OrderForm } from "./MainForm";
import { TPayment } from "../../../types";

interface IAddressData {
  paymentMethod: TPayment | null;
  address: string;
}

export class FormAddress extends OrderForm<IAddressData> {
  protected formPaymentButtonElement: HTMLButtonElement[] = [];
  protected formAddressInputElement: HTMLInputElement | null = null;

  constructor(protected events: IEvents) {
    super(events, "#order", "order:submit");

    try {
      this.formPaymentButtonElement = ensureAllElements<HTMLButtonElement>(
        ".order__buttons button",
        this.container
      );
      this.formAddressInputElement = ensureElement<HTMLInputElement>(
        'input[name="address"]',
        this.container
      );
    } catch (error) {
      console.error("Ошибка инициализации DOM-элементов:", error);
    }

    this.initEventListeners();
  }

  private initEventListeners(): void {
    this.formPaymentButtonElement.forEach((button) => {
      button.addEventListener("click", () => {
        this.setPaymentSelected(button.name as TPayment);
      });
    });

    if (this.formAddressInputElement) {
      const input = this.formAddressInputElement;
      input.addEventListener("input", () => {
        this.emitAddressChange("address", input.value.trim());
      });
    } else {
      console.warn("[FormAddress] Input адреса не найден");
    }

    this.container.addEventListener("submit", (event: Event) => {
      event.preventDefault();
      this.handleSubmit();
    });
  }

  private emitAddressChange(
    field: keyof IAddressData,
    value: string | TPayment
  ): void {
    this.events.emit("address:field:change", { field, value });
    this.validateAndUpdate();
  }

  protected getFormData(): IAddressData {
    return {
      paymentMethod: this.getSelectedPaymentMethod(),
      address: this.formAddressInputElement?.value.trim() || "",
    };
  }

  protected validate(data: IAddressData): string[] {
    const errors: string[] = [];
    if (!data.paymentMethod) errors.push("Выберите способ оплаты");
    if (!data.address) errors.push("Введите адрес доставки");
    return errors;
  }

  private getSelectedPaymentMethod(): TPayment | null {
    const activeButton = this.formPaymentButtonElement.find((btn) =>
      btn.classList.contains("button_alt-active")
    );
    const method = activeButton?.name;
    return method === "card" || method === "cash" ? method : null;
  }

  setPaymentSelected(method: TPayment): void {
    this.formPaymentButtonElement.forEach((button) => {
      button.classList.toggle("button_alt-active", button.name === method);
    });
    this.emitAddressChange("paymentMethod", method);
  }

  private validateAndUpdate(): void {
    const data = this.getFormData();
    const errors = this.validate(data);

    if (errors.length === 0) {
      this.clearErrors();
      this.setSubmitEnabled(true);
    } else {
      this.setErrors(errors.join("\n"));
      this.setSubmitEnabled(false);
    }
  }

  private handleSubmit(): void {
    const data = this.getFormData();
    const errors = this.validate(data);

    if (errors.length === 0) {
      this.clearErrors();
      this.events.emit(this.submitEvent, data);
      this.events.emit("order:address:submitted", data);
      this.setSubmitEnabled(true);
    } else {
      this.setErrors(errors.join("\n"));
      this.setSubmitEnabled(false);
    }
  }
}
