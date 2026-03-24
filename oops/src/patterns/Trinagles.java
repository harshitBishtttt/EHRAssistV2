package patterns;

public class Trinagles {
    static void triangleOne(int input) {
        int i = 0, num = input;
        while (i < input) {
            int j = 0;
            while (j < num) {
                System.out.print("* ");
                j++;
            }
            --num;
            System.out.println();
            i++;
        }
    }

    static void leftUpper(int size) {
        int i = 0;
        while (i < size) {
            System.out.print(" ");
            i++;
        }
    }

    static void rightUpper(int size) {
        int i = 0;
        while (i < size) {
            System.out.print("* ");
            i++;
        }
    }

    static void upperPart(int input) {
        int i = 1;
        while (input > 1) {
            leftUpper(input--);
            rightUpper(i++);
            System.out.println();
        }
    }

    static void triangleTwo(int input) {
        upperPart(input);
        lowerPart(input);
    }

    static void leftLower(int size) {
        int i = 0;
        while (i < size) {
            System.out.print(" ");
            i++;
        }
    }

    static void rightLower(int size) {
        int i = 0;
        while (i < size) {
            System.out.print("* ");
            i++;
        }
    }

    static void lowerPart(int input) {
        int i = 1;
        while (input > 0) {
            leftLower(i++);
            rightLower(input--);
            System.out.println();
        }
    }

    public static void main(String arg[]) {
        String a = "fe";
        a = a + "dd";

        String b = "fe";
        b = b.concat("dd");

    }
}
