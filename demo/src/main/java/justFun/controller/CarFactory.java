package justFun.controller;

import justFun.service.Car;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/car")
public class CarFactory {
    //when we have one interface and multiple classes to implement it then which class will I choose to

    @Autowired
    @Qualifier("Benz")
    Car benz;
    @Autowired
    @Qualifier("Maruti")
    Car maruti;
    @Autowired
    @Qualifier("Kia")
    Car kia;

    @GetMapping
    String getMyCar(@RequestParam String io) {
        return switch (io) {
            case "Benz" -> benz.getMyCar();
            case "Maruti" -> maruti.getMyCar();
            case "Kia" -> kia.getMyCar();
            default -> "nothing such";
        };
    }

}
