import { cloneTemplate } from '../../../utils/utils';
import { IProduct } from '../../../types';
import { CardCatalog } from '../card/CardCatalog';

export interface IGalleryActions {
  onClickProduct: (product: IProduct) => void;
}

export class GalleryView {
  constructor(
    private container: HTMLElement,
    private actions: IGalleryActions,
    private cardTemplate: HTMLTemplateElement
  ) {}

  render(products: IProduct[]): void {
    // Очищаем контейнер
    this.container.innerHTML = '';

    products.forEach((product) => {
      // Клонируем шаблон карточки
      const cardElement = cloneTemplate<HTMLElement>(this.cardTemplate);
      
      // Создаём экземпляр карточки с данными и обработчиком
      const card = new CardCatalog(product, cardElement);
      
      // Заполняем поля карточки
      card.title = product.title || 'Нет названия';
      card.image = product.image || '';
      card.category = product.category || 'Прочее';
      card.price = product.price || null;
      card.getContainer().dataset.id = product.id;
      

       cardElement.addEventListener('click', () => {
      this.actions.onClickProduct(product);
    });


      // Добавляем в контейнер
      this.container.append(card.getContainer());
    });
  }

  clear(): void {
    this.container.innerHTML = '';
  }
}
