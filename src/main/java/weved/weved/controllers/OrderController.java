package weved.weved.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import weved.weved.dto.OrderHeaderDto;
import weved.weved.dto.OrderRequest;
import weved.weved.service.OrderService;

import java.util.List;


@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

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
}
