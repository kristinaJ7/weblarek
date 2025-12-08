// класс для отображения формы для отправки адреса (способ оплаты и адрес)

import { ensureElement, ensureAllElements } from "../../../utils/utils";
import { IEvents } from "../../base/Events";
import { OrderForm } from "./MainForm";

// Тип данных формы
interface IAddressData {
  paymentMethod: string | null;
  address: string;
}

export class FormAddress extends OrderForm<IAddressData> {
  protected formPaymentButtonElement: HTMLButtonElement[];
  protected formAddressInputElement: HTMLInputElement;

  constructor(protected events: IEvents) {
    super(events, "#order", "order:submit");

    this.formPaymentButtonElement = ensureAllElements<HTMLButtonElement>(
      ".order__buttons button",
      this.container
    );
    this.formAddressInputElement = ensureElement<HTMLInputElement>(
      'input[name="address"]',
      this.container
    );

    // Слушатели на кнопки оплаты
    this.formPaymentButtonElement.forEach((button) => {
      button.addEventListener("click", () => {
        this.events.emit("payment:select", { method: button.name });
        this.setPaymentSelected(button.name); // Обновляем UI и валидацию
      });
    });

    // Слушатель на ввод адреса
    this.formAddressInputElement.addEventListener("input", () => {
      this.events.emit("address:change", {
        value: this.formAddressInputElement.value,
      });
      this.validateAndUpdate(); // Перевалидируем при каждом вводе
    });

    // Обработчик отправки формы
    this.container.addEventListener("submit", (event: Event) => {
      event.preventDefault();

      const data = this.getFormData();
      const errors = this.validate(data);

      if (errors.length === 0) {
        this.clearErrors();
        this.events.emit(this.submitEvent, data); // order:submit
        this.events.emit("order:address:submitted", data); // Сигнал для перехода к контактам
        this.setSubmitEnabled(true);
      } else {
        this.setErrors(errors.join("\n"));
        this.setSubmitEnabled(false);
      }
    });
  }

  // Обязательная реализация из AbstractFormOrder
  protected getFormData(): IAddressData {
    return {
      paymentMethod: this.getSelectedPaymentMethod(),
      address: this.formAddressInputElement.value.trim(),
    };
  }

  protected validate(data: IAddressData): string[] {
    const errors: string[] = [];
    if (!data.paymentMethod) errors.push("Выберите способ оплаты");
    if (!data.address) errors.push("Введите адрес доставки");
    return errors;
  }

  // Вспомогательные методы
  private getSelectedPaymentMethod(): string | null {
    const activeButton = this.formPaymentButtonElement.find((btn) =>
      btn.classList.contains("button_alt-active")
    );
    return activeButton ? activeButton.name : null;
  }

  setPaymentSelected(method: string): void {
    this.formPaymentButtonElement.forEach((button) => {
      button.classList.toggle("button_alt-active", button.name === method);
    });
    this.validateAndUpdate(); // Запускаем валидацию после выбора метода
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
}
