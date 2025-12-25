package weved.weved.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import weved.weved.entity.Application;
import weved.weved.entity.Request;
import weved.weved.repository.ApplicationRepository;
import weved.weved.repository.RequestRepository;


import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:8080")
@RestController
@RequestMapping("/api")
public class RequestController {

    @Autowired
    private RequestRepository requestRepository;

    @Autowired
    private ApplicationRepository applicationRepository;


}
