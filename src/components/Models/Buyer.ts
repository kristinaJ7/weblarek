//для работы с интерфейсом для данных покупателя

// импортируем интерфейс покупателя
import { IBuyer } from "../../types/index";
//импортируем способ оплаты
import { TPayment } from "../../types/index";

export class Buyer {
  //покупатель хранит данные
  private data: IBuyer = {
    payment: "card", //вид оплаты
    address: "",
    phone: "",
    email: "",
  };

  //МЕТОДЫ:

  // Сохранение данных в модели (отдельные методы для каждого поля)
  setPayment(payment: TPayment): void {
    this.data.payment = payment; //поле оплаты
  }

  setEmail(email: string): void {
    //поле почты
    this.data.email = email;
  }

  setPhone(phone: string): void {
    //поле телефона
    this.data.phone = phone;
  }

  setAddress(address: string): void {
    //поле адреса
    this.data.address = address;
  }

  // Метод для массовой установки данных
  setData(data: Partial<IBuyer>): void {
    Object.assign(this.data, data);
  }

  // получение всех данных покупателя
  getData(): IBuyer {
    return { ...this.data };
  }

  // очистка данных покупателя
  clearData(): void {
    this.data = {
      payment: "card",
      email: "",
      phone: "",
      address: "",
    };
  }

  // Валидация данных методом validate() проверяем коректность данных в объекте data
  validate(): Record<string, string> {
    const errors: Record<string, string> = {}; //Создаем пустой объект  который будет содержать сообщения об ошибках для каждого поля

    if (!this.data.payment) {
      errors.payment = "Выберите вид оплаты"; //Если поле payment(оплаты) не заполнено  добавляется сообщение об ошибке в объект errorr
    }
    if (!this.data.email) {
      errors.email = "Укажите email";
    }
    if (!this.data.phone) {
      errors.phone = "Укажите номер телефона";
    }
    if (!this.data.address) {
      errors.address = "Укажите адрес";
    }

    return errors; // вернуть массив если есть ошибки при валидации
  }
}
