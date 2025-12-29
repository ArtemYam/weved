package weved.weved.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import weved.weved.dto.OrderRequest;
import weved.weved.service.OrderService;


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
}
