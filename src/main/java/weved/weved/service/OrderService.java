package weved.weved.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import weved.weved.dto.NomenclatureDto;
import weved.weved.dto.OrderRequest;
import weved.weved.entity.Document;
import weved.weved.entity.Order;
import weved.weved.entity.OrderHeader;
import weved.weved.entity.OrderItem;
import weved.weved.repository.OrderHeaderRepository;
import weved.weved.repository.OrderItemRepository;
import weved.weved.repository.OrderRepository;

@Service
public class OrderService {

    @Autowired
    private OrderHeaderRepository headerRepository;
    @Autowired
    private OrderItemRepository itemRepository;

    @Transactional
    public void saveOrder(OrderRequest request) {
        // 1. Проверяем документ
        if (request.getDocument() == null) {
            throw new IllegalArgumentException("Документ не может быть null");
        }

        // 2. Сохраняем заголовок заказа
        OrderHeader header = mapToHeader(request.getDocument());
        if (isHeaderComplete(header)) {
            headerRepository.save(header);
        } else {
            throw new IllegalArgumentException("Не все обязательные поля документа заполнены");
        }

        // 3. Сохраняем позиции номенклатуры
        for (NomenclatureDto nomen : request.getNomenclatures()) {
            if (isItemComplete(nomen)) {
                OrderItem item = mapToItem(nomen, header.getDocumentNumber());
                itemRepository.save(item);
            }
        }
    }

    private OrderHeader mapToHeader(Document doc) {
        OrderHeader header = new OrderHeader();
        header.setDocumentNumber(doc.getDocumentNumber());
        header.setCreatedAt(doc.getCreatedAt());
        header.setManager(doc.getManager());
        header.setStatus(doc.getStatus());
        return header;
    }

    private OrderItem mapToItem(NomenclatureDto nomen, String docNumber) {
        OrderItem item = new OrderItem();
        item.setDocumentNumber(docNumber);
        item.setArticle(nomen.getArticle());
        item.setTnvedCode(nomen.getTnvedCode());
        item.setInvoiceName(nomen.getInvoiceName());
        item.setRussianName(nomen.getRussianName());
        item.setWeight(nomen.getWeight());
        item.setQuantity(nomen.getQuantity());
        item.setUnit(nomen.getUnit());
        item.setVat(nomen.getVat());
        item.setDuty(nomen.getDuty());
        item.setPricePerUnit(nomen.getPricePerUnit());
        item.setTotalPrice(nomen.getTotalPrice());
        return item;
    }

    private boolean isHeaderComplete(OrderHeader header) {
        return header.getDocumentNumber() != null && !header.getDocumentNumber().isEmpty()
                && header.getCreatedAt() != null
                && header.getManager() != null && !header.getManager().isEmpty()
                && header.getStatus() != null && !header.getStatus().isEmpty();
    }

    private boolean isItemComplete(NomenclatureDto nomen) {
        return nomen.getArticle() != null && !nomen.getArticle().isEmpty()
                && nomen.getTnvedCode() != null && !nomen.getTnvedCode().isEmpty()
                && nomen.getInvoiceName() != null && !nomen.getInvoiceName().isEmpty()
                && nomen.getQuantity() != null;
    }
}

