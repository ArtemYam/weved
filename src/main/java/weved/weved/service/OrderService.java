package weved.weved.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import weved.weved.dto.NomenclatureDto;
import weved.weved.dto.OrderHeaderDto;
import weved.weved.dto.OrderRequest;
import weved.weved.entity.Document;
import weved.weved.entity.OrderHeader;
import weved.weved.entity.OrderItem;
import weved.weved.repository.OrderHeaderRepository;
import weved.weved.repository.OrderItemRepository;

import java.util.List;

@Service
public class OrderService {

    @Autowired
    private OrderHeaderRepository headerRepository;
    @Autowired
    private OrderItemRepository itemRepository;

    @Transactional
    public void saveOrder(OrderRequest request) {
        if (request.getDocument() == null) {
            throw new IllegalArgumentException("Документ не может быть null");
        }

        Document doc = request.getDocument();
        String docNumber = doc.getDocumentNumber();

        // 1. Проверяем, существует ли заголовок с таким documentNumber
        OrderHeader existingHeader = headerRepository.findByDocumentNumber(docNumber);

        OrderHeader header;
        if (existingHeader != null) {
            // Обновляем существующий заголовок
            header = existingHeader;
            header.setCreatedAt(doc.getCreatedAt());
            header.setManager(doc.getManager());
            header.setStatus(doc.getStatus());
        } else {
            // Создаём новый
            header = mapToHeader(doc);
        }

        if (!isHeaderComplete(header)) {
            throw new IllegalArgumentException("Не все обязательные поля документа заполнены");
        }

        headerRepository.save(header); // Сохраняем (обновление или вставка)

        // 2. Удаляем все старые позиции для этого documentNumber
        itemRepository.deleteByDocumentNumber(docNumber);

        // 3. Сохраняем новые позиции из запроса
        for (NomenclatureDto nomen : request.getNomenclatures()) {
            System.out.println("Проверяем позицию: ...");
            if (isItemComplete(nomen)) {
                OrderItem item = mapToItem(nomen, docNumber);
                itemRepository.save(item);
                System.out.println("Позиция сохранена: ID=" + item.getId());
            } else {
                System.out.println("Позиция пропущена...");
            }
        }
    }

    public List<OrderHeaderDto> getLatestActiveOrders() {
        List<OrderHeader> headers = headerRepository.findLatestActiveOrders();

        return headers.stream()
                .map(h -> new OrderHeaderDto(
                        h.getDocumentNumber(),
                        h.getCreatedAt(),
                        h.getManager(),
                        h.getStatus()
                ))
                .toList();
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
        return nomen.getArticle() != null ||
                nomen.getTnvedCode() != null ||
                nomen.getInvoiceName() != null ||
                nomen.getQuantity() != null;
    }

}

