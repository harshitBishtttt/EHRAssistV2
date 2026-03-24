package justFun.service.impls;

import justFun.service.Car;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

@Service
@Qualifier("Kia")
public class KiaImpl implements Car {
    public String getMyCar() {
        return "Kia 1.6 lit ";
    }
}
