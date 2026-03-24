package coding;

import java.util.HashMap;
import java.util.Map;

public class FrequecnyOfWords {
    public static void main(String arg[]) {
        String io = "akdjfgtreqaaaaaaaaaaaaaaaartyuio;lmnbvcsawasdfghjkmloihuytrewsdfghjiuh";
        Map<Character, Integer> map = new HashMap();
        for (int i = 0; i < io.length(); i++) {
            char sample = io.charAt(i);
            if (!map.containsKey(sample)) {
                map.put(sample, 1);
            } else {
                Integer previousCount = map.get(sample);
                map.put(sample, ++previousCount);
            }
        }
        System.out.println(map);
    }
}
