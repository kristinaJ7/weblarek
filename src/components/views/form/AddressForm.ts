import { ensureElement, ensureAllElements } from "../../../utils/utils";
import { IEvents } from "../../base/Events";
import { OrderForm } from "./MainForm";
import { TPayment } from "../../../types";

import { IBuyer } from "../../../types";

interface IAddressData {
  paymentMethod: TPayment | null;
  address: string;
}

export class FormAddress extends OrderForm<IAddressData> {
  private buttons: HTMLButtonElement[] = [];
  private input: HTMLInputElement | null = null;

  constructor(events: IEvents) {
    super(events, "#order", "order:address:submit");
    this.initElements();
    this.initListeners();
  }

  private initElements(): void {
    this.buttons = ensureAllElements<HTMLButtonElement>(
      ".order__buttons button",
      this.container
    );
    this.input = ensureElement<HTMLInputElement>(
      'input[name="address"]',
      this.container
    );

    if (!this.input) console.warn("[FormAddress] Input адреса не найден");
  }

  private initListeners(): void {
    this.container.addEventListener("submit", (e) => {
      e.preventDefault();
      this.events.emit("order:address:submit");
    });

    this.buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        this.events.emit("payment:selected", {
          paymentMethod: btn.name as TPayment,
        });
      });
    });

    this.input?.addEventListener("input", (e) => {
      const value = (e.target as HTMLInputElement).value.trim();
      this.events.emit("address:changed", { address: value });
    });
  }

  updateUI(
    data: IAddressData,
    errors: Partial<Record<keyof IBuyer, string>>
  ): void {
    // Изменили тип errors
    this.setPaymentMethod(data.paymentMethod);
    this.setAddress(data.address);
    this.showErrors(errors);
  }

  private setPaymentMethod(method: TPayment | null): void {
    this.buttons.forEach((btn) => {
      btn.classList.toggle("button_alt-active", btn.name === method);
    });
  }

  private setAddress(value: string): void {
    if (this.input) this.input.value = value;
  }

  // ИЗМЕНЕНО: тип errors теперь Partial<Record<keyof IBuyer, string>>
  showErrors(errors: Partial<Record<keyof IBuyer, string>>): void {
    this.clearErrors();

    const messages: string[] = [];

    // Теперь errors содержит строки, а не массивы
    if (errors.address) {
      messages.push(errors.address);
    }
    if (errors.payment) {
      // payment, а не paymentMethod
      messages.push(errors.payment);
    }

    if (messages.length) {
      this.renderError(messages.join("\n"));
      this.setSubmitEnabled(false);
    } else {
      this.setSubmitEnabled(true);
    }
  }

  public clearErrors(): void {
    const el = this.container.querySelector(".form-error");
    el?.remove();
  }

  private renderError(message: string): void {
    const el = document.createElement("div");
    el.className = "form-error";
    el.textContent = message;
    this.container.appendChild(el);
  }

  getContainer(): HTMLElement {
    return this.container;
  }
}
