package justFun.service.impls;

import justFun.service.Car;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

@Service
@Qualifier("Maruti")
public class MarutiImpl implements Car {
    public String getMyCar() {
        return "Maruti 0.6 lit ";
    }
}
