package weved.weved.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import weved.weved.dto.OrderHeaderDto;
import weved.weved.dto.OrderRequest;
import weved.weved.entity.OrderHeader;
import weved.weved.entity.OrderItem;
import weved.weved.repository.OrderHeaderRepository;
import weved.weved.repository.OrderItemRepository;
import weved.weved.service.OrderService;

import java.util.List;


@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private OrderHeaderRepository headerRepository;

    @Autowired
    private OrderItemRepository itemRepository;

    @PostMapping("/save")
    public String saveOrder(@RequestBody OrderRequest request) {
        orderService.saveOrder(request);
        return "Документ сохранён";
    }

    @GetMapping("/active")
    public List<OrderHeaderDto> getActiveOrders() {
        System.out.println("1. Контроллер вызван. Начинаем загрузку...");

        List<OrderHeaderDto> orders = orderService.getLatestActiveOrders();

        System.out.println("2. Найдено записей: " + orders.size());
        orders.forEach(o ->
                System.out.println("   - " + o.getDocumentNumber() +
                        " | " + o.getCreatedAt() +
                        " | " + o.getManager() +
                        " | " + o.getStatus())
        );

        return orders;
    }

    @GetMapping("/header/{documentNumber}")
    public ResponseEntity<OrderHeader> getOrderHeader(@PathVariable String documentNumber) {
        OrderHeader header = headerRepository.findByDocumentNumber(documentNumber);

        if (header == null) {
            return ResponseEntity.notFound().build(); // 404, если не найден
        }

        return ResponseEntity.ok(header); // 200 с данными
    }

    @GetMapping("/items/{documentNumber}")
    public ResponseEntity<List<OrderItem>> getOrderItems(@PathVariable String documentNumber) {
        List<OrderItem> items = itemRepository.findByDocumentNumber(documentNumber);

        if (items.isEmpty()) {
            return ResponseEntity.notFound().build(); // 404, если нет позиций
        }

        return ResponseEntity.ok(items); // 200 с массивом OrderItem
    }




}
