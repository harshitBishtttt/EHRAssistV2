package justFun.service.impls;

import justFun.service.Car;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

@Service
@Primary
public class BenzImpl implements Car {
    public String getMyCar() {
        return "Benz 2.6 lit ";
    }
}
